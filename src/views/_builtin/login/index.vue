<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import Background from '@/components/background/background.vue';
import PwdLogin from './modules/pwd-login.vue';
import CodeLogin from './modules/code-login.vue';
import Register from './modules/register.vue';
import ResetPwd from './modules/reset-pwd.vue';
import BindWechat from './modules/bind-wechat.vue';
import LoginBanner from './modules/login-banner.vue';

defineOptions({ name: 'LoginPage' });

interface Props {
  /** The login module */
  module?: UnionKey.LoginModule;
}

const props = defineProps<Props>();

const appStore = useAppStore();
const themeStore = useThemeStore();

interface LoginModule {
  label: App.I18n.I18nKey;
  component: Component;
}

const moduleMap: Record<UnionKey.LoginModule, LoginModule> = {
  'pwd-login': { label: loginModuleRecord['pwd-login'], component: PwdLogin },
  'code-login': { label: loginModuleRecord['code-login'], component: CodeLogin },
  register: { label: loginModuleRecord.register, component: Register },
  'reset-pwd': { label: loginModuleRecord['reset-pwd'], component: ResetPwd },
  'bind-wechat': { label: loginModuleRecord['bind-wechat'], component: BindWechat }
};

const activeModule = computed(() => moduleMap[props.module || 'pwd-login']);
</script>

<template>
  <!-- 背景由 Background 提供(天空/草/花/星空/萤火虫等)；左侧官网介绍区 + 右侧毛玻璃登录卡 -->
  <div class="login-page relative size-full overflow-hidden">
    <Background />
    <!-- 视口右上角：多语言 -->
    <div class="login-corner">
      <LangSwitch
        v-if="themeStore.header.multilingual.visible"
        :lang="appStore.locale"
        :lang-options="appStore.localeOptions"
        :show-tooltip="false"
        @change-lang="appStore.changeLocale"
      />
    </div>
    <!-- 左右两栏：窄屏(lt-lg)堆叠为上下，并让登录卡在上、介绍卡在下 -->
    <div class="login-layout relative z-6 size-full flex lt-lg:flex-col-reverse">
      <!-- 左侧：介绍区（占 3/5），贴左上角显示，卡片按内容尺寸 -->
      <div class="login-aside min-w-0 w-3/5 flex items-start justify-start p-24px lt-lg:w-full lt-lg:p-16px">
        <LoginBanner />
      </div>
      <!-- 右侧：登录面板（占 2/5，逻辑与样式不变） -->
      <div class="login-main w-2/5 flex flex-center p-24px lt-lg:w-full lt-lg:py-20px">
        <ElCard class="login-card relative z-7 w-auto rd-12px">
          <div class="w-400px lt-sm:w-300px">
            <header class="login-header flex-y-center">
              <SystemLogo class="size-64px lt-sm:size-48px" />
              <h3 class="login-title text-28px lt-sm:text-22px">{{ $t('system.title') }}</h3>
            </header>
            <main class="pt-24px">
              <h3 class="login-subtitle text-18px font-medium">{{ $t(activeModule.label) }}</h3>
              <div class="pt-24px">
                <Transition :name="themeStore.page.animateMode" mode="out-in" appear>
                  <component :is="activeModule.component" />
                </Transition>
              </div>
            </main>
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 毛玻璃登录卡：亮色=白色半透明 + 深字；暗色=深色半透明 + 白字（html.dark 覆盖）*/
.login-card {
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(100, 108, 255, 0.2);
  border-radius: 12px;
  box-shadow:
    0 8px 40px rgba(100, 108, 255, 0.1),
    0 2px 10px rgba(0, 0, 0, 0.06);
}

html.dark .login-card {
  background-color: rgba(15, 15, 20, 0.55);
  border-color: rgba(100, 108, 255, 0.25);
  box-shadow:
    0 8px 40px rgba(100, 108, 255, 0.18),
    0 2px 10px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* 视口右上角主题/语言切换浮层（脱离卡片，悬浮于登录页右上角）*/
.login-corner {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(0, 0, 0, 0.65);
}

html.dark .login-corner {
  color: rgba(255, 255, 255, 0.75);
}

/* 头部 / 标题 / 副标题：亮色深字，暗色亮字，标题用主题色渐变 */
.login-header {
  color: rgba(0, 0, 0, 0.85);
}

html.dark .login-header {
  color: rgba(255, 255, 255, 0.85);
}

.login-title {
  font-weight: 600;
  letter-spacing: 0.02em;
  background: linear-gradient(100deg, rgb(var(--primary-color)), #6b7280 55%, #1f2937);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

html.dark .login-title {
  background: linear-gradient(100deg, rgb(var(--primary-color)), #c9d2ff 55%, #ffffff);
  -webkit-background-clip: text;
  background-clip: text;
}

.login-subtitle {
  color: rgba(0, 0, 0, 0.75);
}

html.dark .login-subtitle {
  color: rgba(255, 255, 255, 0.9);
}

/* ---- 暗色控件定制（亮色沿用 Element Plus 默认，仅 html.dark 下覆盖）---- */
html.dark .login-card :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  transition: box-shadow 0.2s ease;
}

html.dark .login-card :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(100, 108, 255, 0.5) inset;
}

html.dark .login-card :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow:
    0 0 0 1px rgb(var(--primary-color)) inset,
    0 0 14px rgba(100, 108, 255, 0.35);
}

html.dark .login-card :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9);
}

html.dark .login-card :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.35);
}

html.dark .login-card :deep(.el-input__password),
html.dark .login-card :deep(.el-input__icon) {
  color: rgba(255, 255, 255, 0.5);
}

html.dark .login-card :deep(.el-image) {
  border-radius: 6px;
  overflow: hidden;
}

html.dark .login-card :deep(.el-checkbox__label),
html.dark .login-card :deep(.el-button.is-text) {
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.2s ease;
}

html.dark .login-card :deep(.el-button.is-text:hover) {
  color: rgb(var(--primary-color));
}

html.dark .login-card :deep(.el-button:not(.el-button--primary):not(.is-text):not(.is-link)) {
  background-color: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;
}

html.dark .login-card :deep(.el-button:not(.el-button--primary):not(.is-text):not(.is-link):hover) {
  background-color: rgba(100, 108, 255, 0.18);
  border-color: rgba(100, 108, 255, 0.5);
  color: #ffffff;
}

html.dark .login-card :deep(.el-divider) {
  background-color: rgba(255, 255, 255, 0.12);
}

html.dark .login-card :deep(.el-divider__text) {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.4);
}
</style>
