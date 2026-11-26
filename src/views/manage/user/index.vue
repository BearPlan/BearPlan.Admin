<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { Sort, TableColumnCtx } from 'element-plus';
import {
  ElButton,
  ElCard,
  ElCol,
  ElInput,
  ElPagination,
  ElPopconfirm,
  ElRow,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTree
} from 'element-plus';
import Apis from '@/api';
import type { DeptDTO, UserDTO } from '@/api/globals';
import type { OrderTypeEnum } from '@/api/apiEnums';
import { ConditionalType } from '@/api/sqlSugar';
import downloadExcel from '@/utils/downloadExcel';
import createComponent from '@/utils/createComponent';
import type { TableColumn } from '@/typings/table';
import { $t } from '@/locales';
import CustomHeader from '@/components/advanced/custom-header.vue';
import EditForm from './modules/edit-form.vue';
import { usePagination, useRequest } from '~/packages/alova/src/client';

// 搜索关键词
const searchKeyword = ref('');
// 当前选中的部门ID
const selectedDeptId = ref<string | null>(null);

const { send: getDeptTree, data: deptTree } = useRequest(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  (keyWord: string = '') =>
    Apis.Dept.GetTree({
      params: {
        KeyWord: keyWord
      },
      transform: res => {
        return res.data;
      }
    }),
  {
    force: true,
    immediate: true
  }
);

// 树组件引用
const treeRef = ref();

// ==================== 用户列表（与 job 标准列表页同构，保留左树右表布局） ====================
const route = useRoute();
// 表格组件引用（导出 Excel 用）
const tableRef = ref();
type DataType = UserDTO;

// columnData 为生效列数据源（本地 defaultColumns 为唯一列定义），供列设置管理与表格渲染
const columnData = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>([
  { prop: 'userName', label: '用户名', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'nickName', label: '昵称', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'phone', label: '手机号', searchType: String(ConditionalType.Like), checked: true },
  { prop: 'email', label: '邮箱', searchType: String(ConditionalType.Like), checked: true }
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
    Apis.User.GetPage({
      params: {
        StartIndex: 0, // 后端实际按 PageIndex 分页，此处占位
        PageIndex: upPageIndex,
        PageSize: upPageSize,
        SortList: dataTableConfig.value.sortList,
        Search: searchParams.value,
        // 跟随左侧选中部门过滤
        DeptId: selectedDeptId.value
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
    Apis.User.Delete({
      data: ids,
      transform: res => {
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

const handleClose = (prop: string) => {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete searchParams.value[prop];
};

// 表格加载与删除请求合并，工具栏刷新动画两者都覆盖
const loading = computed<boolean>(() => delLoading.value || dataLoading.value);

// ==================== 页面操作 ====================
// 打开编辑/新增：动态挂载编辑表单，提交成功后 reload 列表；新增时带入左侧选中部门作为默认归属
const openForm = async (deptId: string | null, id?: string) => {
  const { instance, on, unmount } = await createComponent(EditForm, {
    visible: true
  });
  instance?.openForm(deptId, id);
  on('reload', () => {
    reload();
  });

  on('update:visible', res => {
    if (!res) {
      unmount();
    }
  });
};

// 树节点点击处理
const handleNodeClick = (node: DeptDTO) => {
  // 点击已选中的节点则取消选择，否则切换为新部门
  selectedDeptId.value = selectedDeptId.value === node.id ? null : node.id;
  reload();
};

// 搜索部门
const handleSearch = () => {
  getDeptTree(searchKeyword.value);
};

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = '';
  getDeptTree('');
};

// 展开/收起所有节点
const expandAll = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = true;
    });
  }
};

const collapseAll = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = false;
    });
  }
};
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElRow class="min-h-0 flex-1">
      <ElCol :span="4" class="h-full">
        <ElCard class="h-full flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">部门</span>
              <div class="flex gap-2">
                <ElButton size="small" @click="expandAll">展开</ElButton>
                <ElButton size="small" @click="collapseAll">收起</ElButton>
              </div>
            </div>
          </template>

          <!-- 搜索框 -->
          <div class="mb-4 shrink-0">
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索部门名称"
              clearable
              @keyup.enter="handleSearch"
              @clear="clearSearch"
            >
              <template #append>
                <ElButton @click="handleSearch">
                  <icon-ant-design-search-outlined />
                </ElButton>
              </template>
            </ElInput>
          </div>

          <!-- 部门树 -->
          <div class="min-h-0 flex-1 overflow-auto">
            <ElTree
              ref="treeRef"
              node-key="id"
              :data="deptTree"
              :default-expand-all="true"
              :props="{ label: 'name', children: 'children' }"
              :expand-on-click-node="false"
              class="dept-tree"
              @node-click="handleNodeClick"
            >
              <template #default="{ data: nodeData }">
                <div class="w-full flex items-center justify-between">
                  <span
                    class="flex-1 truncate"
                    :title="nodeData.name"
                    :class="{
                      'text-primary font-medium': selectedDeptId === nodeData.id
                    }"
                  >
                    {{ nodeData.name }}
                  </span>
                  <span v-if="nodeData.users?.length" class="ml-2 text-xs text-gray-400">
                    ({{ nodeData.users.length }})
                  </span>
                </div>
              </template>
            </ElTree>
          </div>
        </ElCard>
      </ElCol>

      <ElCol :span="20" class="h-full">
        <ElCard class="h-full flex flex-col" body-class="flex-1 overflow-hidden p-0">
          <template #header>
            <div class="flex items-center justify-between">
              <p>{{ $t(route.meta.i18nKey || route.meta.title || '') }}</p>
              <ElSpace direction="horizontal" wrap justify="end" class="lt-sm:w-200px">
                <ElButton ghost type="primary" @click="openForm(selectedDeptId)">
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
              <ElTag
                v-for="(item, index) in Object.keys(searchParams)"
                :key="index"
                closable
                @close="handleClose(item)"
              >
                {{ columnData.find(column => column.prop == item)?.label }}:
                {{ $t('sqlSugar.' + ConditionalType[(searchParams[item].searchType || 0) as any]) }}
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
                <ElTableColumn prop="use" label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <div class="flex-center pr-10px">
                      <ElButton type="primary" plain size="small" @click="openForm(null, row.id)">
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
      </ElCol>
    </ElRow>
  </div>
</template>

<style scoped>
.dept-tree :deep(.el-tree-node__content) {
  height: 36px;
  line-height: 36px;
  cursor: pointer;
}

.dept-tree :deep(.el-tree-node__content:hover) {
  background-color: var(--el-color-primary-light-9);
}

.dept-tree :deep(.el-tree-node__expand-icon) {
  color: var(--el-color-primary);
}

.dept-tree :deep(.el-tree-node__label) {
  font-size: 14px;
}

.text-primary {
  color: var(--el-color-primary) !important;
}

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

/* 双卡片共用：body 参与 flex 拉伸；右侧列表卡片经 body-class 显式 p-0，左侧部门树卡片保留默认内边距 */
:deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
