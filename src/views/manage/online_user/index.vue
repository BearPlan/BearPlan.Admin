<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Sort, TableColumnCtx } from 'element-plus';
import { ElButton, ElCard, ElPagination, ElPopconfirm, ElSpace, ElTable, ElTableColumn, ElTag } from 'element-plus';
import Apis from '@/api';
import type { OnlineUserDTO } from '@/api/globals';
import type { TableColumn } from '@/typings/table';
import type { OrderTypeEnum } from '@/api/apiEnums';
import { ConditionalType } from '@/api/sqlSugar';
import downloadExcel from '@/utils/downloadExcel';
import { $t } from '@/locales';
import CustomHeader from '@/components/advanced/custom-header.vue';
import { usePagination, useRequest } from '~/packages/alova/src/client';

defineOptions({ name: 'OnlineUser' });

const route = useRoute();
// 表格组件引用（导出 Excel 用）
const tableRef = ref();
type DataType = OnlineUserDTO;

// columnData 为生效列数据源（本地 defaultColumns 为唯一列定义），供列设置管理与表格渲染
const columnData = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>([
  { prop: 'userName', label: '登录账号', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'nickName', label: '昵称', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'deptName', label: '部门', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'ip', label: '登录IP', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'address', label: 'IP归属地', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'browserName', label: '浏览器', checked: true },
  { prop: 'apiVersion', label: '客户端类型', checked: true },
  { prop: 'deviceId', label: '设备ID', checked: true },
  { prop: 'loginTime', label: '登录时间', checked: true }
]);
const dataTableConfig = ref<UI.DataTableConfig>({ sortList: {} });
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

/** 获取分页数据 */
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
    Apis.OnlineUser.GetPage({
      params: {
        StartIndex: 0, // 后端实际按 PageIndex 分页，此处占位
        PageIndex: upPageIndex,
        PageSize: upPageSize,
        SortList: dataTableConfig.value.sortList,
        Search: searchParams.value
      }
    }),
  {
    watchingStates: [dataTableConfig, searchParams],
    force: true,
    immediate: true,
    initialPage: 1, // 初始页码，默认为1
    initialPageSize: 15, // 初始每页数据条数
    preloadPreviousPage: false, // 是否预加载上一页
    preloadNextPage: false, // 是否预加载下一页
    total: res => res.data?.pagerInfo?.totalRowCount,
    data: res => res.data?.data || []
  }
);

/** 强制下线单设备：按行数据的 用户ID + 客户端类型 + 设备ID 定位唯一在线会话 */
const { send: handleDropOut, loading: dropLoading } = useRequest(
  (row: DataType) =>
    Apis.OnlineUser.DropOut({
      params: { userId: row.userId, apiVersion: row.apiVersion || '', deviceId: row.deviceId || '' },
      transform: res => {
        window.$message?.success('已强制下线！');
        getData(page.value, pageSize.value);
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

/** 下线该用户所有设备 */
const { send: handleDropOutAll, loading: dropAllLoading } = useRequest(
  (row: DataType) =>
    Apis.OnlineUser.DropOutAll({
      params: { userId: row.userId },
      transform: res => {
        window.$message?.success('已下线该用户所有设备！');
        getData(page.value, pageSize.value);
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

const sortChange = ({ prop, order }: Sort) => {
  dataTableConfig.value.sortList = {};
  dataTableConfig.value.sortList = { [prop]: order?.replace('ending', '') as unknown as OrderTypeEnum };
};

const handleClose = (prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete searchParams.value[prop];
};

// 表格加载与两个强退请求合并，工具栏刷新动画两者都覆盖
const loading = computed<boolean>(() => dropLoading.value || dropAllLoading.value || dataLoading.value);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="h-full flex flex-col" body-class="flex-1 overflow-hidden p-0">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t(route.meta.i18nKey || route.meta.title || '') }}</p>
          <ElSpace direction="horizontal" wrap justify="end" class="lt-sm:w-200px">
            <!-- 在线用户只读：无新增与批量删除，仅保留导出与刷新 -->
            <ElButton size="small" ghost @click="downloadExcel(tableRef?.$el, $t(route.meta.i18nKey || route.meta.title || ''))">
              <template #icon>
                <icon-charm:download class="text-icon" />
              </template>
              {{ $t('导出') }}
            </ElButton>
            <ElButton size="small" @click="reload">
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
            {{ $t('sqlSugar.' + ConditionalType[searchParams[item].searchType || (0 as any)]) }}
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
            row-key="userId"
            @sort-change="sortChange"
          >
            <ElTableColumn v-for="(item, index) in tableColumns" :key="index" v-bind="item">
              <template v-if="item.searchType != null" #header>
                <CustomHeader v-model="searchParams" :column="item" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="use" label="操作" align="center" width="220" fixed="right">
              <template #default="{ row }">
                <div class="flex flex-wrap justify-center gap-8px pr-10px">
                  <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDropOut(row)">
                    <template #reference>
                      <ElButton type="warning" plain size="small">{{ $t('强制下线') }}</ElButton>
                    </template>
                  </ElPopconfirm>
                  <ElPopconfirm :title="$t('确认下线该用户所有设备？')" @confirm="handleDropOutAll(row)">
                    <template #reference>
                      <ElButton type="danger" plain size="small">{{ $t('下线全部设备') }}</ElButton>
                    </template>
                  </ElPopconfirm>
                </div>
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
