<script setup lang="tsx">
import { computed, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import type { Sort, TableColumnCtx } from 'element-plus';
import { usePagination, useRequest } from 'alova/client';
import { alovaInstance } from '@/api';
import type { TableColumn, TableView } from '@/api/globals';
import type { OrderTypeEnum } from '@/api/apiEnums';
import type { SchemaName } from '@/api/apiModels';
import { ConditionalType } from '@/api/sqlSugar';
import downloadExcel from '@/utils/downloadExcel';
import { $t } from '@/locales';
import CustomHeader from './modules/customHeader.vue';
import type { Arg } from '~/packages/alova/src';
interface Props {
  // tableof 约束为 swagger schema 名（ide 补全 + 拼错提示）；历史遗留的无效值用 string 兜底，避免阻断编译
  tableof: SchemaName;
  router: string;
  configId: string;
  pageUrl: string;
  addUrl?: string;
  delUrl: string;
  params?: Arg;
  endColumns?: TableColumn[] | (Partial<TableColumnCtx<any>> & { checked?: boolean })[];
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { tableof, router, configId, pageUrl, addUrl, delUrl, params, endColumns } = defineProps<Props>();

interface Emits {
  (e: 'loadChange', tableView: TableView): void;
  (e: 'openForm', formId: string | null): void;
}
const tableRef = useTemplateRef('tableRef');
const emit = defineEmits<Emits>();
const tableView = ref<TableView>();
const columns = ref<Array<TableColumn>>([]);
const dataTableConfig = ref<UI.DataTableConfig>({
  sortList: {}
});
const loadChange = (table: TableView) => {
  tableView.value = table;
  columns.value =
    table?.columns
      ?.filter(item => item.isShow)
      .map(item => {
        return { ...item, checked: true, attrs: item.attrs } as unknown as TableColumn;
      }) || [];

  if (dataTableConfig.value) dataTableConfig.value.sortList = table?.sorts || {};
  // searchData.value = res.data?.tableColumns?.filter(item => item.searchType !== null) || [];
  emit('loadChange', table);
};

const columnData = computed<Array<Partial<TableColumnCtx<TableColumn>> & TableColumn>>(() => {
  const arr = columns.value
    ?.filter(item => item.checked)
    .map(item => {
      return {
        ...item,
        // eslint-disable-next-line no-eval
        ...(item.attrs ? eval(`(${item.attrs})`) : {}),
        className: !item.isExcel ? 'onExcel' : '',
        prop: item.prop,
        label: $t(item.label as string),
        sortable: 'custom'
      } as Partial<TableColumnCtx<TableColumn>> & TableColumn & { checked?: boolean };
    });
  if (endColumns) {
    return [...arr, ...(endColumns as any)];
  }
  return arr;
});

// const { hasAuth } = useAuth();
const route = useRoute();
const keyWord = ref('');
const searchParams = ref<UI.SearchParams>({});
/** 获取数据 */
const {
  data,
  page,
  pageSize,
  total,
  loading,
  send: getData,
  reload
} = usePagination(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  (upPageIndex, upPageSize) =>
    alovaInstance.Get(pageUrl, {
      // Apis.TableColumn.get_page_configid_tableof({
      // pathParams: {
      //   configId: configId.value || '',
      //   tableof: tableof.value || ''
      // },
      params: {
        PageIndex: upPageIndex,
        pageSize: upPageSize,
        sortList: dataTableConfig.value.sortList,
        search: searchParams.value,
        ...params
      }
    }),
  {
    watchingStates: [keyWord, dataTableConfig, searchParams],
    force: false,
    immediate: false,
    initialPage: 1, // 初始页码，默认为1
    initialPageSize: 15, // 初始每页数据条数，默认为10
    preloadPreviousPage: false, // 是否预加载下一页
    preloadNextPage: false, // 是否预加载上一页
    total: (res: any) => res.data?.pagerInfo?.totalRowCount,
    data: (res: any) => res.data?.data as any
  }
);

// 删除
const { send: handleDelete } = useRequest(
  ids =>
    // Apis.TableColumn.delete_delete_configid_tableof({
    alovaInstance.Delete(delUrl, ids, {
      transform: (res: any) => {
        window.$message?.success('删除成功！');
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
const checkedRowKeys = ref<string[]>([]);
// 打开编辑/新增

const openForm = (id: string | null) => {
  emit('openForm', id || '');
};

const handleClose = (prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete searchParams.value[prop];
};
// ====================开始处理动态生成=====================
// 共享函数
defineExpose({
  openForm,
  reload,
  handleDelete,
  tableof,
  configId
});
</script>

<template>
  <div>
    <ElCard class="h-full flex flex-col" body-class="flex-1 overflow-hidden p-0">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t(route.meta.i18nKey || route.meta.title || '') }}</p>
          <TableHeaderOperation
            v-model:columns="columns"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @refresh="reload"
          >
            <template #prefix>
              <slot name="prefix"></slot>

              <TableViewSetting
                :config-id="configId"
                :tableof="tableof"
                :router="router"
                @load-change="loadChange"
              ></TableViewSetting>
            </template>
            <!-- v-if="hasAuth(dbConfig.addUrl)" -->
            <ElButton ghost type="primary" @click="openForm(null)">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </ElButton>
            <!--       -->
            <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(checkedRowKeys)">
              <template #reference>
                <ElButton type="danger" plain :disabled="checkedRowKeys.length == 0">
                  <template #icon>
                    <icon-ic-round-delete class="text-icon" />
                  </template>
                  {{ $t('common.batchDelete') }}
                </ElButton>
              </template>
            </ElPopconfirm>
            <ElButton ghost @click="downloadExcel(tableRef?.$el, $t(route.meta.i18nKey || route.meta.title || ''))">
              <template #icon>
                <icon-charm:download class="text-icon" />
              </template>
              {{ $t('导出') }}
            </ElButton>
          </TableHeaderOperation>
        </div>
      </template>

      <div class="min-h-0 flex flex-col flex-1 p-4">
        <div v-if="Object.keys(searchParams).length > 0" class="mb-3 flex shrink-0 flex-wrap">
          <ElTag v-for="(item, index) in Object.keys(searchParams)" :key="index" closable @close="handleClose(item)">
            {{ columns.find(column => column.prop == item)?.label }}:
            {{ $t('sqlSugar.' + ConditionalType[searchParams[item].searchType || 0]) }}
            {{ searchParams[item].value }}
          </ElTag>
        </div>

        <div class="min-h-0 flex-1">
          <ElTable
            v-bind="$attrs"
            id="table_excel"
            ref="tableRef"
            v-loading="loading"
            height="100%"
            border
            class="w-full"
            sortable
            :data="data"
            row-key="id"
            @sort-change="sortChange"
          >
            <ElTableColumn v-for="(column, index) in columnData" :key="index" v-bind="column">
              <template v-if="column.searchType !== null" #header>
                <CustomHeader v-model="searchParams" :column="column"></CustomHeader>
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
