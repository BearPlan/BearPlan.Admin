<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useRequest, useSSE } from 'alova/client';
import QRCode from 'qrcode';
import Apis from '@/api';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { $t } from '@/locales';

defineOptions({ name: 'BindWechat' });

const { toggleLoginModule, redirectFromLogin } = useRouterPush();
const authStore = useAuthStore();

// 扫码状态：Waiting(等待) / Scanned(已扫码未绑定) / Confirmed(已确认) / Unbound(未绑定) / Expired(已过期)
type ScanStatus = 'Waiting' | 'Scanned' | 'Confirmed' | 'Unbound' | 'Expired';

const qrCanvasRef = useTemplateRef<HTMLCanvasElement>('qrCanvasRef');
// 当前会话 ticket，由 CreateQrcode 返回，用于建立 SSE 连接和换取登录凭证

// 扫码状态提示文案
const status = ref<ScanStatus>('Waiting');

const statusTip = computed(() => $t(`page.login.bindWeChat.status_${status.value}`));

// 微信扫码登录 SSE：监听后端推送的扫码状态变更
// 不走 alova 全局 responded 拦截器（SSE 流非 {code,data,msg} 结构），直接拿每条消息文本
// 注意：useSSE 内部用 fetch 模拟 EventSource，不经过 alova 实例的 beforeRequest 钩子，
// 因此全局设置的 api-version / Authorization 头不会自动带上，需在此显式声明
const {
  send: openStream,
  close: closeStream,
  onMessage
} = useSSE((ticket: string) => Apis.Auth.QrLoginStream({ params: { ticket }, headers: { 'api-version': 1.0 } }), {
  interceptByGlobalResponded: false,
  initialData: ''
});

// 拉取二维码：transform 兼容后端 NoFormatResponse 非标准返回，二维码就绪后建立 SSE 连接
const { send: createQrcode, loading: CreateQrcodeLoading } = useRequest(
  () =>
    Apis.WeiXin.CreateQrcode({
      transform: async res => {
        if (!res.data?.ticket || !res.data?.url) return res.data;
        await QRCode.toCanvas(qrCanvasRef.value, res.data.url, { width: 200, margin: 1 });
        // 二维码就绪后建立 SSE 连接，监听扫码状态
        openStream(res.data.ticket);
        return res.data;
      }
    }),
  {
    immediate: false,
    force: true,
    async middleware(ctx, next) {
      closeStream();
      await next();
      ctx.proxyStates.loading.v = false;
    }
  }
);

// 凭 ticket 换取登录 Token：transform 内完成登录态写入、用户信息加载与跳转
const { send: loginByWeixin } = useRequest(
  (ticket: string) =>
    Apis.Auth.LoginByWeixin({
      params: { ticket },
      transform: async res => {
        // 拦截器对标准 {code,data,msg} 结构放行整个响应对象，data 为 LoginToken
        const loginToken = res?.data ?? res;
        if (!loginToken?.accessToken) {
          window.$message?.error($t('page.login.bindWeChat.status_Unbound'));
          return;
        }
        // 写入本地存储，复用 authStore 完成用户信息加载与登录态更新
        localStg.set('token', `${loginToken.tokenType} ${loginToken.accessToken}`);
        localStg.set('refreshToken', loginToken.refreshToken || '');
        await authStore.initUserInfo();
        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          message: $t('page.login.common.welcomeBack', { userName: authStore.userInfo.userName }),
          duration: 4500
        });
        await redirectFromLogin(true);
      }
    }),
  { immediate: false, force: true }
);

// 收到扫码状态：终态(Confirmed/Unbound/Expired)处理后关闭连接
onMessage(event => {
  const msg = String(event.data || '').trim() as ScanStatus;
  if (!msg) return;
  status.value = msg;

  // 已确认登录：用 ticket 换取 Token
  if (msg === 'Confirmed') {
    closeStream();
    loginByWeixin(event.args[0]);
    return;
  }

  // 未绑定 / 已过期：关闭连接，提示用户刷新
  if (msg === 'Unbound' || msg === 'Expired') {
    closeStream();
  }
});

onMounted(async () => {
  await createQrcode();
});
</script>

<template>
  <div class="flex-col-center gap-20px py-24px">
    <!-- 微信登录二维码：alova 调 CreateQrcode 拿 URL 后由 qrcode 渲染到 canvas，点击刷新 -->
    <div
      v-loading="CreateQrcodeLoading"
      class="qr-wrapper size-200px flex-center cursor-pointer rd-8px"
      :title="$t('page.login.bindWeChat.clickToRefresh')"
      @click="createQrcode"
    >
      <canvas ref="qrCanvasRef" />
    </div>
    <!-- 扫码状态提示：waiting/scanned/confirmed/unbound/expired 对应不同文案 -->
    <p class="text-14px text-#666">{{ statusTip }}</p>
    <ElButton size="large" round block class="w-full" @click="toggleLoginModule('pwd-login')">
      {{ $t('page.login.bindWeChat.backToPwdLogin') }}
    </ElButton>
  </div>
</template>

<style scoped>
.qr-wrapper {
  background-color: rgba(7, 193, 96, 0.06);
  border: 1px solid rgba(7, 193, 96, 0.2);
}
</style>
