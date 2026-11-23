<script setup lang="ts">
import { computed } from 'vue';
import type { DialogConfigContext, WatermarkProps } from 'element-plus';
import { useAppStore } from './store/modules/app';
import { useThemeStore } from './store/modules/theme';
import { useAuthStore } from './store/modules/auth';
import { UILocales } from './locales/ui';
// import customRender from '@/views/configprovider/table/modules/customRender';

defineOptions({ name: 'App' });

const appStore = useAppStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const locale = computed(() => {
  return UILocales[appStore.locale];
});
// el-dialog 全局默认：可拖拽且可拖出视口边界；实例上显式传参可覆盖
const dialogConfig: DialogConfigContext = {
  draggable: true,
  overflow: true
};
// 页面挂载
// customRender()
const watermarkProps = computed<WatermarkProps>(() => {
  const content =
    themeStore.watermark.enableUserName && authStore.userInfo.user.userName
      ? authStore.userInfo.user.userName
      : themeStore.watermark.text;

  return {
    content: themeStore.watermark.visible ? content : '',
    cross: true,
    fontSize: 16,
    lineHeight: 16,
    gap: [100, 120],
    rotate: -15,
    zIndex: 9999
  };
});
</script>

<template>
  <ElConfigProvider :locale="locale" :dialog="dialogConfig">
    <AppProvider>
      <ElWatermark class="h-full" v-bind="watermarkProps">
        <RouterView class="bg-layout" />
      </ElWatermark>
    </AppProvider>
  </ElConfigProvider>
</template>

<style scoped></style>
