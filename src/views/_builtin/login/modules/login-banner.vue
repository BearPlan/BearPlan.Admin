<script setup lang="ts">
import { $t } from '@/locales';

defineOptions({ name: 'LoginBanner' });

// 链接常量：项目地址取自官网 index.md brand action；文档指向官网站点
const PROJECT_URL = 'https://gitee.com/ByteXiong/BearPlan';
const DOCS_URL = 'https://bear.js.org/';

function openLink(url: string) {
  window.open(url, '_blank');
}
</script>

<template>
  <!-- 无边框介绍区：静态排版，不套卡片、不加动效 -->
  <div class="login-banner">
    <!-- 氛围光晕背景层（紫蓝色静态色斑） -->
    <div class="banner-glow" aria-hidden="true"></div>
    <div class="hero-inner">
      <h2 class="hero-name">{{ $t('page.login.intro.heroName') }}</h2>
      <p class="hero-text">{{ $t('page.login.intro.heroText') }}</p>
      <p class="hero-tagline">{{ $t('page.login.intro.tagline') }}</p>
      <!-- 双按钮：主(项目地址) / 次(开发文档)，统一使用原生 ElButton -->
      <div class="hero-actions">
        <ElButton type="primary" size="large" @click="openLink(PROJECT_URL)">
          {{ $t('page.login.intro.projectUrl') }}
        </ElButton>
        <ElButton class="is-glass" size="large" @click="openLink(DOCS_URL)">
          {{ $t('page.login.intro.docs') }}
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-banner {
  /* 字体栈对齐官网 hero（zh 优先 Punctuation SC + Inter，含 emoji 回退）*/
  font-family:
    'Punctuation SC', 'Inter', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
    'Segoe UI Symbol', 'Noto Color Emoji';
  position: relative;
  /* inline-flex：宽度自适应内容（不撑满父级），无面板直接浮于自然背景之上 */
  display: inline-flex;
  align-items: flex-start;
  justify-content: flex-start;
  max-width: 100%;
  padding: 48px 40px;
  overflow: hidden;
}

/* 氛围光晕：紫蓝色静态大色斑，模糊作背景分区（无边框形态下的视觉锚点） */
.banner-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 640px;
  height: 640px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(181, 155, 255, 0.3) 0%, rgba(96, 60, 186, 0.12) 40%, transparent 70%);
  filter: blur(60px);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}

html.dark .banner-glow {
  background: radial-gradient(circle, rgba(96, 60, 186, 0.38) 0%, rgba(55, 48, 163, 0.2) 40%, transparent 70%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

/* 主标题(BearPlan)：紫蓝渐变文字，字号/字重/字距严格对齐官网 VPHero .name */
.hero-name {
  margin: 0;
  font-size: 56px;
  font-weight: 700;
  line-height: 64px;
  letter-spacing: -0.4px;
  background: linear-gradient(135deg, #646cff, #b6beff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

/* 暗色：紫蓝渐变提亮端更偏蓝（对齐官网 var.css dark） */
html.dark .hero-name {
  background: linear-gradient(135deg, #818cf8, #c7d2fe);
  -webkit-background-clip: text;
  background-clip: text;
}

/* 副标题（全栈重构 API 集成体验）：与官网 .text 统一字号/字重/行高 */
.hero-text {
  margin: 0;
  font-size: 56px;
  font-weight: 700;
  line-height: 64px;
  letter-spacing: -0.4px;
  white-space: pre-wrap;
  color: rgba(0, 0, 0, 0.88);
}

html.dark .hero-text {
  color: rgba(255, 255, 255, 0.92);
}

/* tagline（技术栈，对齐官网 .tagline）：24px/500，padding-top 留出与上方大字间距 */
.hero-tagline {
  margin: 12px 0 0;
  padding-top: 8px;
  font-size: 24px;
  font-weight: 500;
  line-height: 36px;
  white-space: pre-wrap;
  color: rgba(0, 0, 0, 0.66);
}

html.dark .hero-tagline {
  color: rgba(255, 255, 255, 0.68);
}

/* 双按钮容器：去掉 gap，由 ElButton 自身的相邻按钮间距接管 */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 40px;
}

/* 次按钮(开发文档)：半透明背景 + backdrop-filter 毛玻璃，与主按钮形成质感对比（明暗通用） */
.hero-actions :deep(.is-glass) {
  background-color: rgba(96, 60, 186, 0.1);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border-color: rgba(181, 155, 255, 0.4);
  color: rgba(0, 0, 0, 0.78);
  transition: all 0.25s ease;
}

.hero-actions :deep(.is-glass:hover) {
  background-color: rgba(96, 60, 186, 0.2);
  border-color: rgba(181, 155, 255, 0.7);
}

html.dark .hero-actions :deep(.is-glass) {
  color: rgba(255, 255, 255, 0.88);
}

/* 小屏适配：严格对齐官网 VPHero 响应式断点 */
/* 中屏(sm, ≥640px)：name/text 56px→48px，tagline 24px→20px */
@media (max-width: 959px) {
  .hero-name,
  .hero-text {
    font-size: 48px;
    line-height: 56px;
  }
  .hero-tagline {
    margin-top: 8px;
    padding-top: 12px;
    font-size: 20px;
    line-height: 32px;
  }
}

/* 移动端(<640px)：对齐官网 name/text 32px / tagline 18px */
@media (max-width: 639px) {
  .hero-name,
  .hero-text {
    font-size: 32px;
    line-height: 40px;
  }
  .hero-tagline {
    font-size: 18px;
    line-height: 28px;
  }
}
</style>
