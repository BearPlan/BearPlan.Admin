<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Sort, TableColumnCtx } from 'element-plus';
import { ElButton, ElCard, ElPagination, ElSpace, ElTabPane, ElTable, ElTableColumn, ElTabs } from 'element-plus';
import Apis from '@/api';
import type { ApisDTO } from '@/api/globals';
import type { TableColumn } from '@/typings/table';
import type { OrderTypeEnum } from '@/api/apiEnums';
import { VersionEnum } from '@/api/apiEnums';
import { ConditionalType } from '@/api/sqlSugar';
import { getEnumValue } from '@/utils/common';
import downloadExcel from '@/utils/downloadExcel';
import { $t } from '@/locales';
import CustomHeader from '@/components/advanced/custom-header.vue';
import { usePagination, useRequest } from '~/packages/alova/src/client';

defineOptions({ name: 'Apis' });

const route = useRoute();
// 表格组件引用（导出 Excel 用）
const tableRef = ref();
type DataType = ApisDTO;

// 当前版本 Tab（API 路由按前端版本分组扫描）
const activeName = ref(VersionEnum.Pc);

// 默认列表字段（文本列 + 表头搜索），进入列设置面板供勾选/排序；其余字段缺省时消费方按 falsy 兜底
const defaultColumns: Array<Partial<TableColumnCtx<DataType> & TableColumn>> = [
  { prop: 'group', label: '分组', searchType: ConditionalType.Like, checked: true },
  { prop: 'url', label: '路径', searchType: ConditionalType.Like, checked: true },
  { prop: 'method', label: '请求方式', searchType: ConditionalType.Equal, checked: true },
  { prop: 'description', label: '描述', searchType: ConditionalType.Like, checked: true }
];

// columnData 为生效列数据源（本地 defaultColumns 为唯一列定义），供列设置管理与表格渲染
const columnData = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>(defaultColumns);
const dataTableConfig = ref<UI.DataTableConfig>({
  sortList: {}
});
// 表头搜索条件
const searchParams = ref<Record<string, Record<string, string>>>({});


// 渲染列：按列设置勾选过滤（全不勾选即空表）
const tableColumns = computed<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>(() => {
  return columnData.value
    .filter(item => item.checked)
    .map(item => {
      return {
        ...item,
        className: item.isExcel === false ? 'onExcel' : '',
        prop: item.prop,
        label: item.label as string,
        sortable: 'custom'
      } as Partial<TableColumnCtx<DataType> & TableColumn>;
    });
});

/** 获取分页数据；版本过滤并入 Search（后端 SearchWhere 按字段名拼接条件），不进 searchParams 避免渲染为搜索标签 */
const {
  data,
  page,
  pageSize,
  total,
  loading: dataLoading,
  send: getData,
  reload
} = usePagination(
  (upPageIndex, upPageSize) =>
    Apis.Apis.GetPage({
      params: {
        StartIndex: 0, // 后端实际按 PageIndex 分页，此处占位
        PageIndex: upPageIndex,
        PageSize: upPageSize,
        SortList: dataTableConfig.value.sortList,
        Search: {
          ...searchParams.value,
          version: { key: 'version', searchType: ConditionalType.Equal, value: String(activeName.value) }
        }
      }
    }),
  {
    watchingStates: [dataTableConfig, searchParams],
    force: false,
    immediate: false,
    initialPage: 1, // 初始页码，默认为1
    initialPageSize: 15, // 初始每页数据条数
    preloadPreviousPage: false, // 是否预加载上一页
    preloadNextPage: false, // 是否预加载下一页
    total: res => res.data?.pagerInfo?.totalRowCount,
    data: res => res.data?.data || []
  }
);

/** 更新API（重新扫描接口路由写入数据库） */
const { send: refreshApis, loading: refreshLoading } = useRequest(
  () =>
    Apis.Apis.Refresh({
      transform: res => {
        window.$message?.success('操作成功！');
        getData(page.value, pageSize.value);
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

const tabschange = () => {
  // 版本 Tab 切换后回到第一页拉取：version 已并入请求闭包，切换即取最新值
  if (page.value === 1) {
    reload();
  } else {
    page.value = 1;
  }
};

const sortChange = ({ prop, order }: Sort) => {
  dataTableConfig.value.sortList = {};
  dataTableConfig.value.sortList = { [prop]: order?.replace('ending', '') as unknown as OrderTypeEnum };
};

const handleClose = (prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete searchParams.value[prop];
};

// 表格加载与更新API请求合并，工具栏刷新动画两者都覆盖
const loading = computed<boolean>(() => refreshLoading.value || dataLoading.value);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElTabs v-model="activeName" @tab-change="tabschange">
      <ElTabPane
        v-for="(item, index) in getEnumValue(VersionEnum)"
        :key="index"
        :label="VersionEnum[item]"
        :name="item"
      ></ElTabPane>
    </ElTabs>

    <ElCard class="h-full flex flex-col" body-class="flex-1 overflow-hidden p-0">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t(route.meta.i18nKey || route.meta.title || '') }}</p>
          <ElSpace direction="horizontal" wrap justify="end" class="lt-sm:w-200px">
            <!-- API 路由由后端扫描生成，仅提供更新入口，无新增/删除 -->
            <ElButton ghost type="primary" @click="refreshApis">
              <template #icon>
                <icon-mdi-refresh class="text-icon" />
              </template>
              更新API
            </ElButton>
            <ElButton ghost @click="downloadExcel(tableRef?.$el, $t(route.meta.i18nKey || route.meta.title || ''))">
              <template #icon>
                <icon-charm:download class="text-icon" />
              </template>
              {{ $t('导出') }}
            </ElButton>
            <ElButton @click="reload">
              <template #icon>
                <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
              </template>
              {{ $t('common.refresh') }}
            </ElButton>
            <TableColumnSetting v-model:columns="columnData" />
          </ElSpace>
        </div>
      </template>

      <div class="min-h-0 flex flex-col flex-1 p-4">
        <div v-if="Object.keys(searchParams).length > 0" class="mb-3 flex shrink-0 flex-wrap">
          <ElTag v-for="(item, index) in Object.keys(searchParams)" :key="index" closable @close="handleClose(item)">
            {{ columnData.find(column => column.prop == item)?.label }}:
            {{ $t('sqlSugar.' + ConditionalType[searchParams[item].searchType || 0 as any]) }}
            {{ searchParams[item].value }}
          </ElTag>
        </div>

        <div class="min-h-0 flex-1">
          <ElTable
            id="table_excel"
            ref="tableRef"
            v-loading="loading"
            height="100%"
            border
            class="w-full"
            :data="data"
            row-key="id"
            @sort-change="sortChange"
          >
            <ElTableColumn v-for="(item, index) in tableColumns" :key="index" v-bind="item">
              <template v-if="item.searchType != null" #header>
                <CustomHeader v-model="searchParams" :column="item" />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div v-if="total" class="mt-4 flex shrink-0 justify-end">
          <ElPagination
            layout="total,prev,pager,next,sizes"
            :current-page="page"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[15, 50, 200, 500, total || 1000].sort((a, b) => a - b)"
            :page-count="page"
            @current-change="
              val => {
                page = val;
              }
            "
            @size-change="
              val => {
                pageSize = val;
                page = 1;
              }
            "
          />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
/* Ensure proper flexbox layout for ElCard to use remaining viewport height */
:deep(.el-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  flex-shrink: 0;
  padding: 18px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

:deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

/* Ensure table takes remaining height */
:deep(.el-table) {
  height: 100% !important;
}

:deep(.el-table__body-wrapper) {
  flex: 1;
  overflow: auto;
}
</style>
