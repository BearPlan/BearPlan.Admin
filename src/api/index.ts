import type { Action } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { createAlova } from 'alova';
import { axiosRequestAdapter } from '@sa/alova/adapter-axios';
import vueHook from 'alova/vue';
// import defaultSettings from '@/settings';
// import { useUserStoreHook } from '@/store/modules/user';
import { createServerTokenAuthentication } from 'alova/client';
import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
/** Get token */
import { createApis, withConfigType } from './createApis';
// Ensure SSR uses an absolute origin so Axios can resolve URLs server-side.
// API paths in definitions already include '/api', so baseURL should NOT include '/api'.
const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

type ICodeMessage = {
  [key: number]: string;
};
enum ResultEnum {
  SUCCESS = 0,
  TIMEOUT = 401,
  TOKENEXP = 403
}
const serverCodeMessage: ICodeMessage = {
  200: '服务器成功返回请求的数据',
  401: '无用户信息,请登录',
  403: 'Forbidden',
  404: '网络请求错误,未找到该资源',
  498: 'token过期',
  500: '服务器发生错误，请检查服务器(Internal Server Error)',
  502: '网关错误(Bad Gateway)',
  503: '服务不可用，服务器暂时过载或维护(Service Unavailable)',
  504: '网关超时(Gateway Timeout)',
  547: '数据关联,删除失败'
};
// 无感刷新
const { onAuthRequired, onResponseRefreshToken } = createServerTokenAuthentication<
  typeof vueHook,
  typeof axiosRequestAdapter
>({
  refreshTokenOnError: {
    // 响应时触发，可获取到error和method，并返回boolean表示token是否过期
    // 当服务端返回401时，表示token过期
    isExpired: (error, method) => {
      if (method?.meta?.skipAuthRefresh) return false;
      return error.status === ResultEnum.TIMEOUT;
    },

    // 当token过期时触发，在此函数中触发刷新token
    handler: async (_error, _method) => {
      try {
        const refreshToken = localStg.get('refreshToken') || '';
        if (!refreshToken) {
          throw new Error('NO_REFRESH_TOKEN');
        }

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await Apis.Auth.RefreshToken({
          meta: {
            authRole: 'refreshToken',
            skipAuthRefresh: true
          },
          params: {
            refreshToken
          },
          transform: res => {
            localStg.set('token', `${res.data.tokenType} ${res.data.accessToken}`);
            localStg.set('refreshToken', res.data.refreshToken || '');
          }
        });
      } catch (error) {
        ElMessageBox.confirm('当前页面已失效，请重新登录', '提示', {
          confirmButtonText: '确认',
          type: 'warning',
          showCancelButton: false,
          closeOnClickModal: false,

          callback: (action: Action) => {
            if (action === 'confirm') {
              const authStore = useAuthStore();
              authStore.logout();
            }
          }
        });

        throw error;
      }
    }
  }
});

export const alovaInstance = createAlova({
  statesHook: vueHook,
  baseURL,
  requestAdapter: axiosRequestAdapter(),
  beforeRequest: onAuthRequired(method => {
    method.config.headers.Authorization = localStg.get('token');
    method.config.headers['api-version'] ||= 1.0;
    method.config.headers['Content-Type'] ||= 'application/json';
  }),
  responded: onResponseRefreshToken({
    onSuccess: async response => {
      // const { data: rawData } = response;

      // if (rawData.code === ResultEnum.SUCCESS) {
      //   return rawData as any;
      // } else if (rawData.code === ResultEnum.TIMEOUT) {
      //   ElMessageBox.confirm('当前页面已失效，请重新登录', '提示', {
      //     confirmButtonText: '确认',
      //     type: 'warning',
      //     showCancelButton: false,
      //     closeOnClickModal: false,

      //     callback: (action: Action) => {
      //       if (action === 'confirm') {
      //         const authStore = useAuthStore();
      //         authStore.logout();
      //       }
      //     }
      //   });
      //    Promise.reject(rawData);
      // }

      // Promise.reject(rawData);
      // throw new Error(rawData.msg || serverCodeMessage[rawData.code] || '系统出错');

      const { data: rawData } = response;
      // 后端 NoFormatResponse 接口（如 WeiXin/CreateQrcode）直接返回纯字符串等非标准结构，
      // 没有 code/data/msg 包装，跳过统一格式校验直接放行
      if (rawData === null || typeof rawData !== 'object' || rawData.code === undefined) {
        return rawData;
      }
      if (rawData.code === ResultEnum.SUCCESS) {
        return rawData;
      }
      window.$message?.error(rawData.msg || serverCodeMessage[rawData.code] || '系统出错');
      // throw new Error(rawData);

      return Promise.reject(rawData);
      // throw new Error(rawData);
    },
    onError: async error => {
      // if (err.response?.data?.code === ResultEnum.TIMEOUT) {
      //   ElMessageBox.confirm('当前页面已失效，请重新登录', '提示', {
      //     confirmButtonText: '确认',
      //     type: 'warning',
      //     showCancelButton: false,
      //     closeOnClickModal: false,

      //     callback: (action: Action) => {
      //       if (action === 'confirm') {
      //         const authStore = useAuthStore();
      //         authStore.logout();
      //       }
      //     }
      //   });
      // } else {
      //   window.$message?.error(err.response?.data?.msg || '系统出错');
      //   throw new Error(err.response?.data?.msg || '系统出错');
      // }

      // return Promise.reject( err.response?.data);

      if (error.status === ResultEnum.TIMEOUT) {
        throw error;
      } else if (error.status === ResultEnum.TOKENEXP) {
        const authStore = useAuthStore();
        await authStore.logout();
        throw error;
      }
      // 使用 Nuxt UI 的 UToast 替代 ElMessageBox
      const errorMsg =
        error.response?.data?.msg || serverCodeMessage[error.response?.data?.code] || error.message || '系统出错';
      ElMessage.error(errorMsg);

      throw error;
    },
    onComplete: () => {
      // 处理请求完成逻辑
    }
  })
});

export const $$userConfigMap = withConfigType({});

const Apis = createApis(alovaInstance, $$userConfigMap);

export default Apis;
