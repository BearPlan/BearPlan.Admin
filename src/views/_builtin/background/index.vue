<script setup lang="ts">
import { useRouter } from 'vue-router';
import Background from '@/components/background/background.vue';

defineOptions({ name: 'BackgroundPage' });

const router = useRouter();

/** 点击任意位置退出：有历史则返回上一页，直接访问(无历史)则回首页 */
function handleExit() {
  if (window.history.length <= 1) {
    router.push({ name: 'home' });
  } else {
    router.back();
  }
}
</script>

<template>
  <!-- 全屏背景预览：复用登录页背景；点击任意空白处退出，右上角太阳/月亮可切日夜(已 stop 不触发退出) -->
  <div class="background-page fixed inset-0 size-full cursor-pointer overflow-hidden" @click="handleExit">
    <Background />
    <div class="exit-hint">点击任意位置退出</div>
  </div>
</template>

<style scoped>
.exit-hint {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  letter-spacing: 1px;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
</style>
