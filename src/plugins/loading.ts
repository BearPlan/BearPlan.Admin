// @unocss-include
import { getColorPalette, getRgb } from '@sa/color';
import { DARK_CLASS } from '@/constants/app';
import { localStg } from '@/utils/storage';
import { toggleHtmlClass } from '@/utils/common';
import { $t } from '@/locales';

interface LoadingTheme {
  bg: string;
  radial1: string;
  radial2: string;
  radial3: string;
  text: string;
  faceBg: string;
  faceBorder: string;
  glowDeep: string;
  logoColor: string;
  logoGlow: string;
  matrixHead: string;
  matrixTail: string;
  matrixTrail: string;
  matrixOpacity: number;
}

export function setupLoading() {
  const themeColor = localStg.get('themeColor') || '#646cff';
  const darkMode = localStg.get('darkMode') || false;
  const palette = getColorPalette(themeColor);

  const { r, g, b } = getRgb(themeColor);
  const primaryColor = `--primary-color: ${r} ${g} ${b}`;

  const svgCssVars = Array.from(palette.entries())
    .map(([key, value]) => `--logo-color-${key}: ${value}`)
    .join(';');

  const rgbOf = (hex: string) => {
    const c = getRgb(hex);
    return `${c.r}, ${c.g}, ${c.b}`;
  };

  const c200 = palette.get(200)!;
  const c300 = palette.get(300)!;
  const c400 = palette.get(400)!;
  const c500 = palette.get(500)!;
  const c600 = palette.get(600)!;
  const c700 = palette.get(700)!;
  const c800 = palette.get(800)!;

  // 魔方面保持暗色卡片风格（编辑器窗口），仅在页面背景与径向辉光上区分明暗
  const theme: LoadingTheme = darkMode
    ? {
        bg: '#0a0b0f',
        radial1: `rgba(${rgbOf(c700)}, 0.25)`,
        radial2: `rgba(${rgbOf(c500)}, 0.18)`,
        radial3: `rgba(${rgbOf(c300)}, 0.12)`,
        text: '#ffffff',
        faceBg: '#0d1117',
        faceBorder: 'rgba(255, 255, 255, 0.9)',
        glowDeep: c700,
        logoColor: themeColor,
        logoGlow: c300,
        matrixHead: c300,
        matrixTail: c500,
        matrixTrail: 'rgba(10, 11, 15, 0.08)',
        matrixOpacity: 0.35
      }
    : {
        bg: '#f5f7fb',
        radial1: `rgba(${rgbOf(c300)}, 0.28)`,
        radial2: `rgba(${rgbOf(c400)}, 0.18)`,
        radial3: `rgba(${rgbOf(c200)}, 0.15)`,
        text: c800,
        faceBg: '#0d1117',
        faceBorder: 'rgba(255, 255, 255, 0.9)',
        glowDeep: c500,
        logoColor: themeColor,
        logoGlow: c400,
        matrixHead: c800,
        matrixTail: c600,
        matrixTrail: 'rgba(245, 247, 251, 0.22)',
        matrixOpacity: 0.55
      };

  const themeCssVars = Object.entries(theme)
    .map(([k, v]) => `--al-${k}: ${v}`)
    .join(';');

  const cssVars = `${primaryColor}; ${svgCssVars}; ${themeCssVars}`;

  if (darkMode) {
    toggleHtmlClass(DARK_CLASS).add();
  }

  const title = $t('system.title');
  const codeTextureUri = getCodeTextureUri();
  const logoSvg = getLogoSvg(themeColor);
  const face = `<div class="al-face">${logoSvg}</div>`;
  const faces = face.repeat(6);

  const loading = `
<style>${getStyle(codeTextureUri)}</style>
<div id="app-loading" style="${cssVars}">
  <canvas class="al-matrix"></canvas>
  <div class="al-stage">
    <div class="al-cube-container">
      <div class="al-cube">${faces}</div>
    </div>
  </div>
  <h2 class="al-title" data-text="${title}">${title}</h2>
</div>`;

  const app = document.getElementById('app');

  if (app) {
    app.innerHTML = loading;
    initMatrix(theme.matrixHead, theme.matrixTail, theme.matrixTrail, theme.matrixOpacity);
  }
}

function initMatrix(headColor: string, tailColor: string, trailColor: string, opacity: number) {
  const canvas = document.querySelector<HTMLCanvasElement>('#app-loading .al-matrix');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.style.opacity = String(opacity);

  const chars = '01<>{}[]()/*+-=;:.,abcdef0123456789';
  const fontSize = 14;
  let columns = 0;
  let drops: number[] = [];

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(0).map(() => (Math.random() * canvas.height) / fontSize);
  };
  resize();
  window.addEventListener('resize', resize);

  const draw = () => {
    ctx.fillStyle = trailColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "Courier New", monospace`;
    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.96 ? headColor : tailColor;
      ctx.fillText(text, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  };
  const matrixTimer = window.setInterval(draw, 50);

  // #app-loading 被移除后停止矩阵动画并解绑监听，避免定时器与监听器长期存活导致内存泄漏
  // 必须先确认 #app-loading 确实从 DOM 中移除再清理：
  // 否则在 Vue 挂载（app.mount('#app')）之前，NProgress / Iconify / Vue 内部的任何 DOM 变更
  // 都会触发 MutationObserver 回调，导致代码雨一启动就被关闭（表现为"代码雨丢失"）。
  const loadingEl = document.getElementById('app-loading');
  let observer: MutationObserver | null = null;
  const stopMatrix = () => {
    // #app-loading 仍在 DOM 中则忽略本次回调，等待真正的卸载事件
    if (loadingEl && loadingEl.isConnected) return;

    clearInterval(matrixTimer);
    window.removeEventListener('resize', resize);
    window.removeEventListener('unload', stopMatrix);
    observer?.disconnect();
    observer = null;
  };

  // 只观察 #app-loading 父节点（#app）的直接子节点变化：
  // Vue 挂载时会替换 #app 的内容，#app-loading 随之被移除——这正是我们要捕获的唯一场景。
  // 避免使用 subtree: true 监听过宽，误伤其他模块的常规 DOM 操作。
  const parent = loadingEl?.parentElement;
  if (parent) {
    observer = new MutationObserver(stopMatrix);
    observer.observe(parent, { childList: true });
  }
  // 页面意外卸载时兜底
  window.addEventListener('unload', stopMatrix);
}

function getCodeTextureUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" preserveAspectRatio="none">
    <rect width="256" height="256" fill="#0d1117"/>
    <rect width="22" height="256" fill="#161b22"/>
    <rect x="22" width="234" height="14" fill="#161b22"/>
    <circle cx="30" cy="7" r="2.2" fill="#ff5f56"/>
    <circle cx="38" cy="7" r="2.2" fill="#ffbd2e"/>
    <circle cx="46" cy="7" r="2.2" fill="#27c93f"/>
    <rect x="110" y="5" width="3" height="3" fill="#6e7681"/>
    <rect x="115" y="5" width="14" height="3" fill="#6e7681"/>
    <rect x="131" y="5" width="3" height="3" fill="#6e7681"/>
    <rect x="136" y="5" width="6" height="3" fill="#6e7681"/>
    <g fill="#485563">
      <rect x="9" y="22" width="4" height="2.5"/>
      <rect x="9" y="34" width="4" height="2.5"/>
      <rect x="6" y="46" width="7" height="2.5"/>
      <rect x="9" y="58" width="4" height="2.5"/>
      <rect x="9" y="70" width="4" height="2.5"/>
      <rect x="6" y="82" width="7" height="2.5"/>
      <rect x="9" y="94" width="4" height="2.5"/>
      <rect x="9" y="106" width="4" height="2.5"/>
      <rect x="6" y="118" width="7" height="2.5"/>
      <rect x="3" y="130" width="10" height="2.5"/>
      <rect x="9" y="142" width="4" height="2.5"/>
      <rect x="6" y="154" width="7" height="2.5"/>
      <rect x="9" y="166" width="4" height="2.5"/>
      <rect x="9" y="178" width="4" height="2.5"/>
      <rect x="6" y="190" width="7" height="2.5"/>
      <rect x="9" y="202" width="4" height="2.5"/>
      <rect x="9" y="214" width="4" height="2.5"/>
      <rect x="6" y="226" width="7" height="2.5"/>
      <rect x="9" y="238" width="4" height="2.5"/>
      <rect x="3" y="250" width="10" height="2.5"/>
    </g>
    <g>
      <rect x="28" y="22" width="22" height="3" fill="#c678dd"/>
      <rect x="52" y="22" width="3" height="3" fill="#abb2bf"/>
      <rect x="58" y="22" width="3" height="3" fill="#abb2bf"/>
      <rect x="64" y="22" width="34" height="3" fill="#e5c07b"/>
      <rect x="100" y="22" width="3" height="3" fill="#abb2bf"/>
      <rect x="106" y="22" width="3" height="3" fill="#abb2bf"/>
      <rect x="112" y="22" width="20" height="3" fill="#c678dd"/>
      <rect x="134" y="22" width="26" height="3" fill="#98c379"/>
      <rect x="162" y="22" width="6" height="3" fill="#abb2bf"/>
      <rect x="170" y="22" width="30" height="3" fill="#c678dd"/>
      <rect x="202" y="22" width="3" height="3" fill="#abb2bf"/>
      <rect x="208" y="22" width="34" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="34" width="22" height="3" fill="#c678dd"/>
      <rect x="52" y="34" width="14" height="3" fill="#e5c07b"/>
      <rect x="68" y="34" width="20" height="3" fill="#c678dd"/>
      <rect x="90" y="34" width="50" height="3" fill="#98c379"/>
      <rect x="142" y="34" width="6" height="3" fill="#abb2bf"/>
      <rect x="150" y="34" width="38" height="3" fill="#e5c07b"/>
      <rect x="190" y="34" width="20" height="3" fill="#c678dd"/>
      <rect x="212" y="34" width="34" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="46" width="22" height="3" fill="#c678dd"/>
      <rect x="52" y="46" width="22" height="3" fill="#e5c07b"/>
      <rect x="76" y="46" width="20" height="3" fill="#c678dd"/>
      <rect x="98" y="46" width="44" height="3" fill="#98c379"/>
      <rect x="144" y="46" width="6" height="3" fill="#abb2bf"/>
      <rect x="152" y="46" width="46" height="3" fill="#e5c07b"/>
      <rect x="200" y="46" width="20" height="3" fill="#c678dd"/>
      <rect x="222" y="46" width="24" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="58" width="22" height="3" fill="#c678dd"/>
      <rect x="52" y="58" width="3" height="3" fill="#abb2bf"/>
      <rect x="58" y="58" width="3" height="3" fill="#abb2bf"/>
      <rect x="64" y="58" width="42" height="3" fill="#e5c07b"/>
      <rect x="108" y="58" width="3" height="3" fill="#abb2bf"/>
      <rect x="114" y="58" width="3" height="3" fill="#abb2bf"/>
      <rect x="120" y="58" width="20" height="3" fill="#c678dd"/>
      <rect x="142" y="58" width="36" height="3" fill="#98c379"/>
      <rect x="180" y="58" width="6" height="3" fill="#abb2bf"/>
      <rect x="188" y="58" width="34" height="3" fill="#e5c07b"/>
      <rect x="224" y="58" width="22" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="82" width="20" height="3" fill="#c678dd"/>
      <rect x="52" y="82" width="14" height="3" fill="#e06c75"/>
      <rect x="70" y="82" width="6" height="3" fill="#abb2bf"/>
      <rect x="80" y="82" width="34" height="3" fill="#61afef"/>
      <rect x="116" y="82" width="3" height="3" fill="#abb2bf"/>
      <rect x="122" y="82" width="10" height="3" fill="#e5c07b"/>
      <rect x="134" y="82" width="3" height="3" fill="#abb2bf"/>
      <rect x="140" y="82" width="6" height="3" fill="#abb2bf"/>
      <rect x="148" y="82" width="42" height="3" fill="#61afef"/>
      <rect x="192" y="82" width="3" height="3" fill="#abb2bf"/>
      <rect x="198" y="82" width="38" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="106" width="42" height="3" fill="#61afef"/>
      <rect x="72" y="106" width="3" height="3" fill="#abb2bf"/>
      <rect x="78" y="106" width="14" height="3" fill="#e06c75"/>
      <rect x="94" y="106" width="3" height="3" fill="#abb2bf"/>
      <rect x="100" y="106" width="6" height="3" fill="#abb2bf"/>
      <rect x="108" y="106" width="22" height="3" fill="#e06c75"/>
      <rect x="132" y="106" width="3" height="3" fill="#abb2bf"/>
      <rect x="138" y="106" width="20" height="3" fill="#61afef"/>
      <rect x="160" y="106" width="3" height="3" fill="#abb2bf"/>
      <rect x="166" y="106" width="50" height="3" fill="#e5c07b"/>
      <rect x="218" y="106" width="3" height="3" fill="#abb2bf"/>
      <rect x="224" y="106" width="22" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="118" width="14" height="3" fill="#e06c75"/>
      <rect x="44" y="118" width="3" height="3" fill="#abb2bf"/>
      <rect x="50" y="118" width="12" height="3" fill="#61afef"/>
      <rect x="64" y="118" width="3" height="3" fill="#abb2bf"/>
      <rect x="70" y="118" width="22" height="3" fill="#e5c07b"/>
      <rect x="94" y="118" width="3" height="3" fill="#abb2bf"/>
      <rect x="100" y="118" width="14" height="3" fill="#e06c75"/>
      <rect x="116" y="118" width="3" height="3" fill="#abb2bf"/>
      <rect x="122" y="118" width="20" height="3" fill="#61afef"/>
      <rect x="144" y="118" width="3" height="3" fill="#abb2bf"/>
      <rect x="150" y="118" width="42" height="3" fill="#e5c07b"/>
      <rect x="194" y="118" width="3" height="3" fill="#abb2bf"/>
      <rect x="200" y="118" width="46" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="130" width="14" height="3" fill="#e06c75"/>
      <rect x="44" y="130" width="3" height="3" fill="#abb2bf"/>
      <rect x="50" y="130" width="18" height="3" fill="#61afef"/>
      <rect x="70" y="130" width="3" height="3" fill="#abb2bf"/>
      <rect x="76" y="130" width="22" height="3" fill="#98c379"/>
      <rect x="100" y="130" width="3" height="3" fill="#abb2bf"/>
      <rect x="106" y="130" width="14" height="3" fill="#e06c75"/>
      <rect x="122" y="130" width="3" height="3" fill="#abb2bf"/>
      <rect x="128" y="130" width="26" height="3" fill="#61afef"/>
      <rect x="156" y="130" width="3" height="3" fill="#abb2bf"/>
      <rect x="162" y="130" width="60" height="3" fill="#e5c07b"/>
      <rect x="224" y="130" width="22" height="3" fill="#98c379"/>
    </g>
    <g fill="#5c6370">
      <rect x="28" y="154" width="3" height="3"/>
      <rect x="33" y="154" width="3" height="3"/>
      <rect x="40" y="154" width="180" height="3"/>
    </g>
    <g>
      <rect x="28" y="178" width="22" height="3" fill="#c678dd"/>
      <rect x="52" y="178" width="28" height="3" fill="#c678dd"/>
      <rect x="84" y="178" width="14" height="3" fill="#e5c07b"/>
      <rect x="100" y="178" width="6" height="3" fill="#abb2bf"/>
      <rect x="108" y="178" width="38" height="3" fill="#c678dd"/>
      <rect x="148" y="178" width="3" height="3" fill="#abb2bf"/>
      <rect x="154" y="178" width="46" height="3" fill="#e5c07b"/>
      <rect x="202" y="178" width="20" height="3" fill="#c678dd"/>
      <rect x="224" y="178" width="22" height="3" fill="#98c379"/>
    </g>
    <g>
      <rect x="28" y="202" width="34" height="3" fill="#c678dd"/>
      <rect x="66" y="202" width="50" height="3" fill="#abb2bf"/>
      <rect x="120" y="202" width="20" height="3" fill="#61afef"/>
      <rect x="144" y="202" width="6" height="3" fill="#abb2bf"/>
      <rect x="154" y="202" width="42" height="3" fill="#e5c07b"/>
      <rect x="200" y="202" width="3" height="3" fill="#abb2bf"/>
      <rect x="206" y="202" width="40" height="3" fill="#98c379"/>
      <rect x="32" y="214" width="20" height="3" fill="#e06c75"/>
      <rect x="56" y="214" width="6" height="3" fill="#abb2bf"/>
      <rect x="66" y="214" width="40" height="3" fill="#e5c07b"/>
      <rect x="110" y="214" width="6" height="3" fill="#abb2bf"/>
      <rect x="120" y="214" width="34" height="3" fill="#98c379"/>
      <rect x="158" y="214" width="6" height="3" fill="#abb2bf"/>
      <rect x="168" y="214" width="46" height="3" fill="#61afef"/>
      <rect x="218" y="214" width="3" height="3" fill="#abb2bf"/>
      <rect x="224" y="214" width="22" height="3" fill="#98c379"/>
      <rect x="28" y="226" width="42" height="3" fill="#c678dd"/>
      <rect x="74" y="226" width="30" height="3" fill="#61afef"/>
      <rect x="108" y="226" width="6" height="3" fill="#abb2bf"/>
      <rect x="118" y="226" width="60" height="3" fill="#e5c07b"/>
      <rect x="182" y="226" width="6" height="3" fill="#abb2bf"/>
      <rect x="192" y="226" width="34" height="3" fill="#e06c75"/>
      <rect x="230" y="226" width="16" height="3" fill="#98c379"/>
      <rect x="32" y="238" width="26" height="3" fill="#5c6370"/>
      <rect x="62" y="238" width="180" height="3" fill="#5c6370"/>
      <rect x="28" y="250" width="38" height="3" fill="#e06c75"/>
      <rect x="70" y="250" width="6" height="3" fill="#abb2bf"/>
      <rect x="80" y="250" width="24" height="3" fill="#61afef"/>
      <rect x="108" y="250" width="6" height="3" fill="#abb2bf"/>
      <rect x="118" y="250" width="44" height="3" fill="#98c379"/>
      <rect x="166" y="250" width="6" height="3" fill="#abb2bf"/>
      <rect x="176" y="250" width="38" height="3" fill="#e5c07b"/>
      <rect x="218" y="250" width="3" height="3" fill="#abb2bf"/>
      <rect x="224" y="250" width="22" height="3" fill="#c678dd"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getStyle(codeTextureUri: string) {
  return `
#app-loading {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 50%, var(--al-radial1) 0%, transparent 55%),
    radial-gradient(ellipse at 20% 80%, var(--al-radial2) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, var(--al-radial3) 0%, transparent 50%),
    var(--al-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  transition: background-color .3s ease;
}
#app-loading .al-matrix {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#app-loading .al-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 40px var(--al-glowDeep));
  animation: al-stage-in 1s cubic-bezier(.2, .9, .25, 1.2) both;
}
@keyframes al-stage-in {
  0%   { opacity: 0; transform: scale(.4) rotate(-30deg); filter: blur(20px); }
  100% { opacity: 1; transform: scale(1)   rotate(0);      filter: blur(0); }
}

#app-loading .al-cube-container {
  position: relative;
  perspective: 1000px;
  width: 275px;
  height: 275px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app-loading .al-cube,
#app-loading .al-face {
  width: 100%;
  height: 100%;
}

#app-loading .al-cube {
  position: relative;
  transform-style: preserve-3d;
  animation: al-spin 8s linear infinite;
}
@keyframes al-spin {
  0%   { transform: rotateX(0)      rotateY(0); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

#app-loading .al-face {
  position: absolute;
  border: 2px solid var(--al-faceBorder);
  background-color: var(--al-faceBg);
  background-image: url("${codeTextureUri}");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backface-visibility: visible;
  -webkit-backface-visibility: visible;
}

#app-loading .al-face::after {
  content: '';
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 0, 0, .92) 0%, rgba(0, 0, 0, .55) 55%, transparent 78%);
  z-index: 1;
  pointer-events: none;
}

#app-loading .al-face-logo {
  position: relative;
  width: 110px;
  height: 110px;
  pointer-events: none;
  z-index: 2;
}

#app-loading .al-face:nth-child(1) { transform: rotateX(90deg)  translateZ(50px); }
#app-loading .al-face:nth-child(2) { transform: rotateX(-90deg) translateZ(50px); }
#app-loading .al-face:nth-child(3) { transform: rotateY(90deg)  translateZ(50px); }
#app-loading .al-face:nth-child(4) { transform: rotateY(-90deg) translateZ(50px); }
#app-loading .al-face:nth-child(5) { transform: translateZ(50px); }
#app-loading .al-face:nth-child(6) { transform: rotateY(180deg) translateZ(50px); }

#app-loading .al-title {
  position: relative;
  margin: 60px 0 0 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.02em;
  /* 与登录页 .login-title 一致的渐变文字：主题色 → 中性灰过渡 */
  background: linear-gradient(100deg, rgb(var(--primary-color)), #6b7280 55%, #1f2937);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
html.dark #app-loading .al-title {
  background: linear-gradient(100deg, rgb(var(--primary-color)), #c9d2ff 55%, #ffffff);
  -webkit-background-clip: text;
  background-clip: text;
}
/* Stage 1 logo 下方间距收紧，避免 60px 留白过大 */
#app-loading .al-logo-only + .al-title {
  margin-top: 32px;
}

@media (max-width: 575px) {
  #app-loading .al-cube-container { width: 70vw;  height: 70vw; }
  #app-loading .al-face-logo     { width: 40vw;  height: 40vw; }
  #app-loading .al-face::after   { width: 50vw;  height: 50vw; }
  #app-loading .al-title         { font-size: 22px; letter-spacing: 4px; }
}

@media (prefers-reduced-motion: reduce) {
  #app-loading .al-cube { animation: none !important; }
  #app-loading .al-matrix { display: none; }
}
  `;
}

function getLogoSvg(color: string) {
  const logoSvg = `<svg class="al-face-logo" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><path d="M512.896 562.912c63.456 0 104.576-67.968 104.608-101.984 0-21.856-69.632-36.128-111.872-36.416-30.688-0.224-106.912 14.656-98.464 50.048 9.472 39.808 52.512 88.352 105.728 88.352z m-2.048 408.96c-195.552 0-455.552-37.888-455.552-365.472 0-105.536 22.272-210.72 63.232-301.088a130.176 130.176 0 0 1-84.032-121.536 130.08 130.08 0 0 1 129.92-129.92h0.192a129.28 129.28 0 0 1 104.864 53.504l0.256 0.384a391.488 391.488 0 0 1 241.12-81.6c89.248 0 172.224 28.448 242.496 82.72a128.992 128.992 0 0 1 106.24-54.976 130.08 130.08 0 0 1 129.92 129.92 130.112 130.112 0 0 1-86.016 122.272c40.8 90.144 62.944 195.104 62.944 300.352-0.064 327.584-260.032 365.472-455.584 365.472zM224.288 245.408L196.48 296.352c-48.608 89.024-75.36 199.136-75.36 310.016 0 210.08 116.544 299.68 389.728 299.68s389.728-89.632 389.728-299.68c0-110.976-26.816-221.088-75.424-310.144l-28.032-51.328 61.248 2.848c36.608 0 65.28-28.704 65.28-64.032s-28.768-64.096-64.096-64.096a63.68 63.68 0 0 0-62.464 49.888l-12.8 56.704-42.016-40.192c-65.312-62.464-143.168-94.144-231.456-94.144-87.52 0-164.832 31.104-229.76 92.448L240.064 223.136 226.56 168.352a64 64 0 0 0-62.048-48.704h-0.096c-35.328 0-64.096 28.768-64.096 64.096s28.768 64.096 64.096 64.096l1.856-0.16 57.984-2.304zM512 924.832c-197.952 0-301.536-164.096-301.536-326.176 0-51.232 21.728-218.368 301.536-218.368s301.504 167.136 301.504 218.368c0 162.048-103.552 326.176-301.504 326.176z m0-522.624c-65.6 0-279.616 14.144-279.616 196.416 0 151.2 96.032 304.256 279.616 304.256s279.584-153.056 279.584-304.256c0-182.24-213.984-196.416-279.584-196.416z m197.984-111.424a42.24 42.24 0 0 1-84.48 0 42.24 42.24 0 0 1 84.48 0z m-208.96 267.392h21.92v251.296h-21.92v-251.296z m42.464 259.84c-105.76 0-190.368-72.64-223.776-197.952l42.368-11.296c33.536 125.76 123.008 186.656 233.44 158.624l10.752 42.56a257.984 257.984 0 0 1-62.752 8.064zM327.936 265.248h129.504v43.84h-129.504v-43.84z" fill="${color}"/></svg>`;

  return logoSvg;
}
