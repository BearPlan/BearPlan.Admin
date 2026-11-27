import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import Apis from '@/api';
import type { JwtUserInfo, LoginParam, LoginToken } from '@/api/globals';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { encrypt } from '@/utils/rsaEncrypt';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';
import { useRequest } from '~/packages/alova/src/client';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { startLoading, endLoading } = useLoading();

  const token = ref(getToken());

  // 仅初始化高频引用字段，完整 UserInfo 登录后经 GetInfo 填充；类型断言经 unknown 中转（部分初始化）
  const userInfo: JwtUserInfo = reactive({
    user: {
      id: '',
      userName: '',
      realName: '',
      avatar: '',
      email: ''
    },
    roles: [],
    authCodes: []
  } as unknown as JwtUserInfo);

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles?.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  // const { send: logout, onComplete: onlogout } = useRequest(
  //   () =>
  //     Apis.Auth.Logout({
  //       params: {
  //         refreshToken: localStg.get('refreshToken') || ''
  //       }
  //     }),
  //   {
  //     immediate: false,
  //     force: true
  //   }
  // );
  // onlogout(async () => {
  //   recordUserId();

  //   clearAuthStorage();

  //   authStore.$reset();

  //   if (!route.meta.constant) {
  //     await toLogin();
  //   }

  //   tabStore.cacheTabs();
  // });

  // /** Reset auth store */
  async function logout() {
    recordUserId();

    clearAuthStorage();

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  const { send: getUserInfo } = useRequest(
    () =>
      Apis.Auth.GetInfo({
        transform: ({ data }) => {
          Object.assign(userInfo, data);
          return true;
        }
      }),
    {
      immediate: false,
      // 强制拉新：GET 响应有默认缓存，资料/头像修改后刷新必须绕过缓存拿最新值
      force: true
      // async middleware(_, next) {
      //   if (userInfo.user?.id === 0) {
      //     await next();
      //   }
      //   return userInfo;
      // }
    }
  );

  const { send: login, loading: loginLoading } = useRequest(
    (loginData: LoginParam, redirect = true) =>
      Apis.Auth.Login({
        data: { ...loginData, password: encrypt(loginData.password || '') },
        transform: async res => {
          if (res.success) {
            const pass = await loginByToken(res.data);

            if (pass) {
              // Check if the tab needs to be cleared
              const isClear = checkTabClear();
              let needRedirect = redirect;

              if (isClear) {
                // If the tab needs to be cleared,it means we don't need to redirect.
                needRedirect = false;
              }
              await redirectFromLogin(needRedirect);

              window.$notification?.success({
                title: $t('page.login.common.loginSuccess'),
                message: $t('page.login.common.welcomeBack', { userName: userInfo.user.userName }),
                duration: 4500
              });
            }
          } else {
            await logout();
          }
          return res;
        }
      }),
    {
      immediate: false,
      async middleware(_, next) {
        // 全局 loading 必须在请求无论成败后都关闭，否则登录失败会永久卡住遮罩
        startLoading();
        try {
          await next();
        } finally {
          endLoading();
        }
      }
    }
  );

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.user.id) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.user.id);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.user.id) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (lastLoginUserId !== userInfo.user.id) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      return true;
    }

    return false;
  }

  // /**
  //  * Login
  //  *
  //  * @param userName User name
  //  * @param password Password
  //  * @param [redirect=true] Whether to redirect after login. Default is `true`
  //  */
  // async function login(userName: string, password: string, redirect = true) {
  //   startLoading();

  //   const { data: loginToken, error } = await fetchLogin(userName, password);

  //   if (!error) {
  //     const pass = await loginByToken(loginToken);

  //     if (pass) {
  //       // Check if the tab needs to be cleared
  //       const isClear = checkTabClear();
  //       let needRedirect = redirect;

  //       if (isClear) {
  //         // If the tab needs to be cleared,it means we don't need to redirect.
  //         needRedirect = false;
  //       }
  //       await redirectFromLogin(needRedirect);

  //       window.$notification?.success({
  //         title: $t('page.login.common.loginSuccess'),
  //         message: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
  //         duration: 4500
  //       });
  //     }
  //   } else {
  //     logout();
  //   }

  //   endLoading();
  // }

  async function loginByToken(loginToken: LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    const tokenstr = `${loginToken.tokenType} ${loginToken.accessToken || ''}`;
    localStg.set('token', tokenstr);
    localStg.set('refreshToken', loginToken.refreshToken || '');
    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = tokenstr;

      return true;
    }

    return false;
  }

  // async function getUserInfo() {
  //   const { data: info, error } = await fetchGetUserInfo();

  //   if (!error) {
  //     // update store
  //     Object.assign(userInfo, info);

  //     return true;
  //   }

  //   return false;
  // }

  async function initUserInfo() {
    const hasToken = getToken();

    if (hasToken) {
      const pass = await getUserInfo();

      if (!pass) {
        logout();
      }
    }
  }

  /** 刷新当前登录用户信息：个人中心修改资料/头像后调用，同步右上角等全局展示 */
  async function refreshUserInfo() {
    await getUserInfo();
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    logout,
    login,
    initUserInfo,
    refreshUserInfo
  };
});
