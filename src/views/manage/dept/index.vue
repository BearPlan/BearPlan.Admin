<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElCard, ElPopconfirm, ElSpace, ElTable, ElTableColumn, ElTag } from 'element-plus';
import Apis from '@/api';
import type { DeptTreeDTO, TableColumn, TableView } from '@/api/globals';
import { ConditionalType } from '@/api/sqlSugar';
import downloadExcel from '@/utils/downloadExcel';
import createComponent from '@/utils/createComponent';
import { $t } from '@/locales';
import CustomHeader from '@/views/configprovider/table/modules/customHeader.vue';
import EditForm from './modules/edit-form.vue';
import { useRequest } from '~/packages/alova/src/client';

const route = useRoute();
// 表格组件引用（导出 Excel 用）
const tableRef = ref();
type DataType = DeptTreeDTO;

// 默认列表字段（文本列 + 表头搜索），进入列设置面板供勾选/排序；其余字段缺省时消费方按 falsy 兜底
const defaultColumns: Array<Partial<TableColumnCtx<DataType> & TableColumn>> = [
  { prop: 'name', label: '部门名称', searchType: ConditionalType.Like, checked: true },
  { prop: 'sort', label: '排序', searchType: ConditionalType.Equal, checked: true },
  {
    prop: 'enabled',
    label: '启用状态',
    checked: true,
    // 布尔列不做表头搜索（字符串条件对布尔列有语义坑），formatter 渲染为状态色标签：启用绿、禁用红
    formatter: row => (
      <ElTag type={row.enabled ? 'success' : 'danger'} size="small">
        {row.enabled ? '启用' : '禁用'}
      </ElTag>
    )
  }
];

// columns 仅接受后端返回的原始列配置；columnData 为生效列（初始默认列，loadChange 后合并后端列），供列设置管理与表格渲染
const columns = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>([]);
// 列设置候选：初始为默认列，loadChange 后合并为「后端配置列 + 默认列」
const columnData = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>(defaultColumns);
// 表头搜索条件
const searchParams = ref<Record<string, Record<string, string>>>({});
// 多选行（表格 selection 列联动，供批量删除使用）
const checkedRowKeys = ref<string[]>([]);

// 表格视图配置加载回调：后端列与默认列按 prop 去重合并进 columnData，后端配置优先，默认列补充后端未配置的字段
const loadChange = (table: TableView) => {
  columns.value = (table?.columns || []) as Array<Partial<TableColumnCtx<DataType> & TableColumn>>;

  const backendProps = new Set(columns.value.map(item => item.prop));
  columnData.value = [...columns.value, ...defaultColumns.filter(item => !backendProps.has(item.prop as string))];
};

// 渲染列：按列设置勾选过滤（全不勾选即空表）；attrs 中的渲染函数展开为 Element Plus 列属性
const tableColumns = computed<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>(() => {
  return columnData.value
    .filter(item => item.checked)
    .map(item => {
      return {
        ...item,
        // eslint-disable-next-line no-eval
        ...(item.attrs ? eval(`(${item.attrs})`) : {}),
        className: !item.isExcel ? 'onExcel' : '',
        prop: item.prop,
        label: $t(item.label as string)
      } as Partial<TableColumnCtx<DataType> & TableColumn>;
    });
});

/** 获取部门树（整树返回，树形表格展示，不分页） */
const {
  data,
  loading: dataLoading,
  send: getData
} = useRequest(
  () =>
    Apis.Dept.GetTree({
      params: { KeyWord: '' },
      transform: res => {
        return res.data || [];
      }
    }),
  { initialData: [], force: true, immediate: true }
);

// 按表头搜索条件前端过滤树（GetTree 无 SearchWhere 条件参数），命中节点保留其祖先链路
const filteredTree = computed<DataType[]>(() => {
  const conds = Object.keys(searchParams.value);
  if (conds.length === 0) return data.value;

  const match = (row: DataType) =>
    conds.every(prop => {
      const cond = searchParams.value[prop];
      const raw = (row as Record<string, unknown>)[prop];
      if (raw === null || raw === undefined) return false;
      // 与后端 SearchWhere 的字符串条件语义对齐：Like 模糊、其余按等值
      return cond.searchType === ConditionalType.Like
        ? String(raw)
            .toLowerCase()
            .includes(String(cond.value ?? '').toLowerCase())
        : String(raw) === String(cond.value ?? '');
    });

  const filter = (list: DataType[]): DataType[] => {
    const result: DataType[] = [];
    list.forEach(item => {
      const children = item.children ? filter(item.children) : [];
      // 自身命中或子孙命中才保留；父节点不命中但子孙命中时作为层级链路保留
      if (match(item) || children.length > 0) {
        result.push({ ...item, children: children.length > 0 ? children : null });
      }
    });
    return result;
  };
  return filter(data.value);
});

/** 删除 */
const { send: handleDelete, loading: delLoading } = useRequest(
  (ids: string[]) =>
    Apis.Dept.Delete({
      data: ids,
      transform: res => {
        window.$message?.success('删除成功！');
        getData();
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

const handleClose = (prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete searchParams.value[prop];
};

// 表格加载与删除请求合并，工具栏刷新动画两者都覆盖
const loading = computed<boolean>(() => delLoading.value || dataLoading.value);

// 打开编辑/新增：动态挂载编辑表单，提交成功后 reload 列表
const openForm = async (id: string | null) => {
  const { instance, on, unmount } = await createComponent(EditForm, {
    visible: true
  });
  instance?.openForm(null, id);
  on('reload', () => {
    getData();
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
            <TableViewSetting tableof="DeptDTO" router="" config-id="" @load-change="loadChange" />
            <ElButton ghost type="primary" @click="openForm(null)">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </ElButton>
            <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(checkedRowKeys)">
              <template #reference>
                <ElButton type="danger" plain :disabled="checkedRowKeys.length === 0">
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
            <ElButton @click="getData">
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
            :data="filteredTree"
            row-key="id"
            default-expand-all
            :tree-props="{ children: 'children' }"
            @selection-change="(val: Array<DataType>) => (checkedRowKeys = val.map(row => row.id))"
          >
            <ElTableColumn type="selection" width="48" />
            <ElTableColumn v-for="(item, index) in tableColumns" :key="index" v-bind="item">
              <template v-if="item.searchType != null" #header>
                <CustomHeader v-model="searchParams" :column="item" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="use" label="操作" align="center" width="200" fixed="right">
              <template #default="{ row }">
                <div class="flex-center pr-10px">
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
