<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@/locales';

defineOptions({ name: 'BackgroundButton' });

interface Props {
  /** 是否显示 hover 提示（登录页角落与多语言一致隐藏，头部显示） */
  showTooltip?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showTooltip: true });

const router = useRouter();

// tooltipContent 为空时 ButtonIcon 内部 ElTooltip 自动禁用
const tooltipContent = computed(() => (props.showTooltip ? $t('icon.background') : ''));

/** 跳转全屏背景预览页；用 router.push({ name }) 不依赖 RouteKey 类型 */
function goBackground() {
  router.push({ name: 'background' });
}
</script>

<template>
  <ButtonIcon icon="mdi:monitor-lock" :tooltip-content="tooltipContent" @click="goBackground" />
</template>

<style scoped></style>
