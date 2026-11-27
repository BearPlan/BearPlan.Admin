<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Sort, TableColumnCtx } from 'element-plus';
import { ElButton, ElCard, ElPagination, ElPopconfirm, ElSpace, ElTable, ElTableColumn, ElTag } from 'element-plus';
import Apis from '@/api';
import type { QuartzNetDTO } from '@/api/globals';
import type { TableColumn } from '@/typings/table';
import type { OrderTypeEnum } from '@/api/apiEnums';
import { ConditionalType } from '@/api/sqlSugar';
import downloadExcel from '@/utils/downloadExcel';
import createComponent from '@/utils/createComponent';
import { $t } from '@/locales';
import CustomHeader from '@/components/advanced/custom-header.vue';
import EditForm from './modules/edit-form.vue';
import { usePagination, useRequest } from '~/packages/alova/src/client';

defineOptions({ name: 'QuartzNet' });

const route = useRoute();
// 表格组件引用（导出 Excel 用）
const tableRef = ref();
type DataType = QuartzNetDTO;

// columnData 为生效列数据源（本地 defaultColumns 为唯一列定义），供列设置管理与表格渲染
const columnData = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>([
  { prop: 'taskName', label: '任务名称', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'taskGroup', label: '任务分组', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'cron', label: 'Cron表达式', checked: true },
  {
    prop: 'triggerType',
    label: '触发类型',
    checked: true,
    // 枚举列不做表头搜索（SearchWhere 的字符串等值对枚举列有语义坑），formatter 渲染为文本：Cron 表达式 / 间隔
    formatter: row => <span>{row.triggerType === 1 ? 'Cron表达式' : '间隔'}</span>
  },
  { prop: 'runTimes', label: '执行次数', checked: true },
  {
    prop: 'enabled',
    label: '启用状态',
    checked: true,
    // 布尔列不做表头搜索（SearchWhere 的字符串等值对布尔列有语义坑），formatter 渲染为状态色标签：启用绿、禁用红
    formatter: row => (
      <ElTag type={row.enabled ? 'success' : 'danger'} size="small">
        {row.enabled ? '启用' : '禁用'}
      </ElTag>
    )
  }
]);
const dataTableConfig = ref<UI.DataTableConfig>({
  sortList: {}
});
// 表头搜索条件
const searchParams = ref<Record<string, Record<string, string>>>({});
// 多选行（表格 selection 列联动，供批量删除使用）
const checkedRowKeys = ref<string[]>([]);


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
    Apis.QuartzNet.GetPage({
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

/** 删除 */
const { send: handleDelete, loading: delLoading } = useRequest(
  (ids: string[]) =>
    Apis.QuartzNet.Delete({
      data: ids,
      transform: res => {
        window.$message?.success('删除成功！');
        getData(page.value, pageSize.value);
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

/** 立即执行 */
const { send: handleExecute, loading: executeLoading } = useRequest(
  (id: string) =>
    Apis.QuartzNet.Execute({
      params: { id },
      transform: res => {
        window.$message?.success('操作成功！');
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

// 表格加载、删除与执行请求合并，工具栏刷新动画三者都覆盖
const loading = computed<boolean>(() => delLoading.value || executeLoading.value || dataLoading.value);

// 打开编辑/新增：动态挂载编辑表单，提交成功后 reload 列表
const openForm = async (id: string | null) => {
  const { instance, on, unmount } = await createComponent(EditForm, {
    visible: true
  });
  instance?.openForm(null, id);
  on('reload', () => {
    reload();
  });

  on('update:visible', res => {
    if (!res) {
      unmount();
    }
  });
};
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="h-full flex flex-col" body-class="flex-1 overflow-hidden p-0">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t(route.meta.i18nKey || route.meta.title || '') }}</p>
          <ElSpace direction="horizontal" wrap justify="end" class="lt-sm:w-200px">
            <ElButton size="small" ghost type="primary" @click="openForm(null)">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </ElButton>
            <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(checkedRowKeys)">
              <template #reference>
                <ElButton size="small" type="danger" plain :disabled="checkedRowKeys.length === 0">
                  <template #icon>
                    <icon-ic-round-delete class="text-icon" />
                  </template>
                  {{ $t('common.batchDelete') }}
                </ElButton>
              </template>
            </ElPopconfirm>
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
            @selection-change="(val: Array<DataType>) => (checkedRowKeys = val.map(row => row.id))"
          >
            <ElTableColumn type="selection" width="48" />
            <ElTableColumn v-for="(item, index) in tableColumns" :key="index" v-bind="item">
              <template v-if="item.searchType != null" #header>
                <CustomHeader v-model="searchParams" :column="item" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="use" label="操作" align="center" width="260" fixed="right">
              <template #default="{ row }">
                <div class="flex-center pr-10px">
                  <ElButton type="primary" plain size="small" @click="handleExecute(row.id)">执行</ElButton>
                  <ElButton type="primary" plain size="small" @click="openForm(row.id)">
                    {{ $t('common.edit') }}
                  </ElButton>
                  <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete([row.id])">
                    <template #reference>
                      <ElButton type="danger" plain size="small">{{ $t('common.delete') }}</ElButton>
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
