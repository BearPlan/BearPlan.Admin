<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useDocumentVisibility } from '@vueuse/core';
import { Refresh } from '@element-plus/icons-vue';
import Apis from '@/api';
import type { ServerResourcesInfo } from '@/api/globals';
import { useEcharts } from '@/hooks/common/echarts';
import type { ECOption } from '@/hooks/common/echarts';
import { useRequest } from '~/packages/alova/src/client';

defineOptions({ name: 'ServerMonitor' });

// 轮询间隔与历史采样窗口长度
const POLL_INTERVAL = 3500;
const MAX_POINTS = 20;

const { data, send } = useRequest(
  () =>
    Apis.ServerResources.GetInfo({
      transform: ({ data: payload }) => payload as ServerResourcesInfo
    }),
  {
    force: false,
    immediate: true
  }
);

// 首次拿到数据后置 true，控制首屏 loading
const ready = ref(false);
// 手动刷新按钮 loading
const refreshing = ref(false);
// 轮询定时器句柄
let pollTimer: number | null = null;

const info = computed<ServerResourcesInfo>(() => data.value ?? ({} as ServerResourcesInfo));

// 安全解析百分比字符串，非法值兜底为 0
const toPercent = (v?: string | null) => {
  const n = Number.parseFloat(v ?? '');
  return Number.isFinite(n) ? n : 0;
};

// 按使用率返回主题色：低绿 / 中黄 / 高红
function rateColor(rate: number) {
  if (rate >= 90) return '#f56c6c';
  if (rate >= 70) return '#e6a23c';
  return '#67c23a';
}

// 系统信息项（顶部概览）
const sysItems = computed(() => [
  { label: '操作系统', value: info.value.sys?.os ?? '-' },
  { label: '主机 IP', value: info.value.sys?.ip ?? '-' },
  { label: '已运行', value: info.value.sys?.day ?? '-' }
]);

// 卡片详情项类型
interface DetailItem {
  label: string;
  value?: string | null;
}
interface StatusCard {
  key: string;
  title: string;
  rate: number;
  footer: string;
  details: DetailItem[];
}

// 容量类资源（内存/磁盘/交换区）共用构造：总量/已使用/空闲 + 已使用 / 总量
function buildCapacityCard(
  key: string,
  title: string,
  target?: { total?: string | null; used?: string | null; available?: string | null; usageRate?: string | null } | null
): StatusCard {
  return {
    key,
    title,
    rate: toPercent(target?.usageRate),
    footer: `${target?.used ?? '-'} / ${target?.total ?? '-'}`,
    details: [
      { label: '总量', value: target?.total },
      { label: '已使用', value: target?.used },
      { label: '空闲', value: target?.available }
    ]
  };
}

// CPU 卡片：型号/封装/物理核/逻辑核 + 物理核·逻辑核摘要
function buildCpuCard(): StatusCard {
  const cpu = info.value.cpu;
  return {
    key: 'cpu',
    title: 'CPU 使用率',
    rate: toPercent(cpu?.used),
    footer: `${cpu?.core ?? '-'} 物理核 · ${cpu?.logic ?? '-'} 逻辑核`,
    details: [
      { label: '型号', value: cpu?.name },
      { label: '封装', value: cpu?.package },
      { label: '物理核', value: cpu?.core },
      { label: '逻辑核', value: cpu?.logic }
    ]
  };
}

// 四个资源状态卡片配置
const statusCards = computed<StatusCard[]>(() => {
  const { memory, disk, swap } = info.value;
  return [
    buildCapacityCard('disk', '磁盘使用率', disk),
    buildCapacityCard('memory', '内存使用率', memory),
    buildCpuCard(),
    buildCapacityCard('swap', '交换区使用率', swap)
  ];
});

// 历史采样数据（定长滑动窗口）
const timeHistory = ref<string[]>([]);
const cpuHistory = ref<number[]>([]);
const memoryHistory = ref<number[]>([]);

// 使用率折线图配置工厂：CPU 与内存仅 name、颜色不同
function createUsageLineChart(name: string, color: string): ECOption {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
      formatter: (params: any) => `${params[0]?.axisValue}<br/>${name}：${params[0]?.data ?? 0}%`
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: [] as string[] },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: { formatter: '{value}%' }
    },
    series: [
      {
        name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [] as number[],
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}99` },
              { offset: 1, color: `${color}05` }
            ]
          }
        },
        lineStyle: { color, width: 2 },
        itemStyle: { color }
      }
    ]
  };
}

const { domRef: cpuChartRef, updateOptions: updateCpuChart } = useEcharts(() =>
  createUsageLineChart('CPU 使用率', '#409eff')
);
const { domRef: memoryChartRef, updateOptions: updateMemoryChart } = useEcharts(() =>
  createUsageLineChart('内存使用率', '#26deca')
);

// 推进一帧历史数据并刷新两张图表
function pushHistory() {
  if (!data.value) return;
  ready.value = true;

  if (timeHistory.value.length >= MAX_POINTS) {
    timeHistory.value.shift();
    cpuHistory.value.shift();
    memoryHistory.value.shift();
  }

  const time = new Date().toLocaleTimeString();
  timeHistory.value.push(time);
  cpuHistory.value.push(toPercent(data.value.cpu?.used));
  memoryHistory.value.push(toPercent(data.value.memory?.usageRate));

  const times = [...timeHistory.value];
  updateCpuChart(opts => {
    opts.xAxis.data = times;
    opts.series[0].data = [...cpuHistory.value];
    return opts;
  });
  updateMemoryChart(opts => {
    opts.xAxis.data = times;
    opts.series[0].data = [...memoryHistory.value];
    return opts;
  });
}

// 数据到达后推进一帧（首帧由 watch 自然触发，无需在 onMounted 重复调用）
watch(data, () => pushHistory());

// 手动刷新：按钮 loading 到请求结束
async function handleRefresh() {
  if (refreshing.value) return;
  refreshing.value = true;
  try {
    await send();
  } finally {
    refreshing.value = false;
  }
}

// 轮询启停：仅页面可见时轮询，避免后台无效请求
function startPolling() {
  if (pollTimer !== null) return;
  pollTimer = window.setInterval(() => {
    send();
  }, POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// 页面可见性变化：可见恢复轮询，隐藏暂停
const visibility = useDocumentVisibility();
watch(visibility, state => {
  if (state === 'visible') startPolling();
  else stopPolling();
});

// 初次挂载即启动轮询（首屏数据由 useRequest immediate 负责）
startPolling();

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div v-loading="!ready" element-loading-text="数据加载中..." :style="!ready ? 'height: 500px' : ''" class="h-full">
    <ElSpace v-if="ready" direction="vertical" fill :size="16" class="w-full">
      <!-- 系统概览 -->
      <ElCard class="card-wrapper" body-style="padding: 16px 20px" shadow="never">
        <div class="flex flex-wrap items-center justify-between gap-12px">
          <div class="flex flex-wrap items-center gap-x-24px gap-y-8px text-14px">
            <span class="inline-flex items-center gap-6px font-500">
              <SvgIcon icon-class="system" />
              {{ sysItems[0].label }}：{{ sysItems[0].value }}
            </span>
            <span v-for="(item, index) in sysItems.slice(1)" :key="index" class="text-[var(--el-text-color-secondary)]">
              {{ item.label }}：{{ item.value }}
            </span>
          </div>
          <ElButton :icon="Refresh" :loading="refreshing" size="small" @click="handleRefresh">刷新</ElButton>
        </div>
      </ElCard>

      <!-- 资源状态 -->
      <ElCard class="card-wrapper" shadow="never">
        <template #header>
          <span class="text-15px font-bold">资源状态</span>
        </template>
        <ElRow :gutter="16">
          <ElCol v-for="(card, index) in statusCards" :key="index" :xs="24" :sm="12" :md="6" class="mb-16px">
            <div class="flex-col-center py-8px">
              <div class="mb-12px text-14px text-[var(--el-text-color-secondary)]">{{ card.title }}</div>
              <ElTooltip placement="top">
                <template #content>
                  <div class="text-12px">
                    <div v-for="(d, i) in card.details" :key="i" class="whitespace-nowrap py-2px">
                      {{ d.label }}：{{ d.value ?? '-' }}
                    </div>
                  </div>
                </template>
                <ElProgress type="dashboard" :percentage="card.rate" :color="rateColor(card.rate)" :width="120">
                  <template #default="{ percentage }">
                    <span class="text-18px font-bold">{{ percentage }}%</span>
                  </template>
                </ElProgress>
              </ElTooltip>
              <div class="mt-8px text-13px text-[var(--el-text-color-secondary)]">{{ card.footer }}</div>
            </div>
          </ElCol>
        </ElRow>
      </ElCard>

      <!-- 监控图表 -->
      <ElRow :gutter="16">
        <ElCol :xs="24" :md="12" class="mb-16px">
          <ElCard class="h-full card-wrapper" shadow="never">
            <template #header>
              <span class="text-15px font-bold">CPU 使用率监控</span>
            </template>
            <div ref="cpuChartRef" class="h-300px"></div>
          </ElCard>
        </ElCol>
        <ElCol :xs="24" :md="12" class="mb-16px">
          <ElCard class="h-full card-wrapper" shadow="never">
            <template #header>
              <span class="text-15px font-bold">内存使用率监控</span>
            </template>
            <div ref="memoryChartRef" class="h-300px"></div>
          </ElCard>
        </ElCol>
      </ElRow>
    </ElSpace>
  </div>
</template>

<style scoped lang="scss">
.flex-col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

// 仪表盘文字尺寸跟随卡片
:deep(.el-progress-dashboard) {
  .el-progress__text {
    font-size: 16px !important;
  }
}
</style>
