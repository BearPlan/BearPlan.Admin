<script setup lang="tsx">
import { computed, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import type { Sort, TableColumnCtx } from 'element-plus';
import { ElButton, ElPopconfirm } from 'element-plus';
import { usePagination, useRequest } from 'alova/client';
import Apis from '@/api';
import type { OnlineUserDTO, TableColumn, TableView } from '@/api/globals';
import type { OrderTypeEnum } from '@/api/apiEnums';
import { ConditionalType } from '@/api/sqlSugar';
import type { SchemaName } from '@/api/apiModels.js';
import downloadExcel from '@/utils/downloadExcel';
import { $t } from '@/locales';
import CustomHeader from '@/views/configprovider/table/modules/customHeader.vue';

defineOptions({ name: 'OnlineUser' });

const route = useRoute();

// 列配置上下文：供 TableViewSetting 加载/跳转使用
const tableof: SchemaName = 'OnlineUserDTO';

const tableRef = useTemplateRef('tableRef');
const tableView = ref<TableView>();
// 列配置独立为单一数据源：供 TableHeaderOperation 列显隐设置与表格渲染共用
const tableColumns = ref<Array<TableColumn>>([]);
const dataTableConfig = ref<UI.DataTableConfig>({ sortList: {} });
const keyWord = ref('');
const searchParams = ref<UI.SearchParams>({});

// TableViewSetting 加载完成后填充 columns 与默认排序
const loadChange = (table: TableView) => {
  tableView.value = table;
  tableColumns.value =
    table?.columns
      ?.filter(item => item.isShow)
      .map(item => {
        return { ...item, checked: true, attrs: item.attrs };
      }) || [];
  if (dataTableConfig.value) dataTableConfig.value.sortList = table?.sorts || {};
};

type DateType = OnlineUserDTO;

// 后端列配置：解析 attrs、标记导出列；行尾操作列在模板中单独声明，避免混入后端 DTO 类型
const columnData = computed<
  Array<Partial<TableColumnCtx<DateType>> & TableColumn & { checked?: boolean; isExcel?: boolean }>
>(() => {
  return tableColumns.value
    .filter(item => item.checked)
    .map(item => {
      return {
        ...item,
        // eslint-disable-next-line no-eval
        ...(item.attrs ? eval(`(${item.attrs})`) : {}),
        className: !item.isExcel ? 'onExcel' : '',
        prop: item.prop,
        label: $t(item.label as string),
        sortable: 'custom'
      } as Partial<TableColumnCtx<DateType>> & TableColumn;
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
        // swagger 推断为嵌套字典，实际 customHeader 写入的是 { key, value, searchType }，做断言对齐类型
        Search: searchParams.value as unknown as Record<string, Record<string, string>>
      }
    }),
  {
    watchingStates: [keyWord, dataTableConfig, searchParams],
    force: false,
    immediate: false,
    initialPage: 1,
    initialPageSize: 15,
    preloadPreviousPage: false,
    preloadNextPage: false,
    total: res => res.data?.pagerInfo?.totalRowCount,
    data: res => res.data?.data || []
  }
);

/** 强制下线（踢出）：在线用户无删除接口，用 DropOut 替代 */
const { send: handleDropOut, loading: dropLoading } = useRequest(
  (ids: string[]) =>
    Apis.OnlineUser.DropOut({
      data: { idArray: ids },
      transform: res => {
        window.$message?.success('已强制下线！');
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

const loading = computed<boolean>(() => dropLoading.value || dataLoading.value);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="h-full flex flex-col" body-class="flex-1 overflow-hidden p-0">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t(route.meta.i18nKey || route.meta.title || '') }}</p>
          <TableHeaderOperation v-model:columns="tableColumns" :loading="loading" @refresh="reload">
            <template #prefix>
              <TableViewSetting :tableof="tableof" @load-change="loadChange"></TableViewSetting>
            </template>
            <!-- 覆盖默认插槽：在线用户只读，移除"新增"与"批量删除"，仅保留导出 -->
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
            {{ tableColumns.find(column => column.prop == item)?.label }}:
            {{ $t('sqlSugar.' + ConditionalType[searchParams[item].searchType || 0]) }}
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
            <ElTableColumn prop="use" label="操作" align="center" width="120" fixed="right">
              <template #default="{ row }">
                <div class="flex-center pr-10px">
                  <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDropOut([row.id])">
                    <template #reference>
                      <ElButton type="warning" plain size="small">{{ $t('强制下线') }}</ElButton>
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
