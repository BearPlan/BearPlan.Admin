<script setup lang="tsx">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Sort, TableColumnCtx } from 'element-plus';
import {
  ElButton,
  ElCard,
  ElImage,
  ElPagination,
  ElPopconfirm,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag
} from 'element-plus';
import Apis from '@/api';
import type { FileRecordDTO, TableColumn, TableView } from '@/api/globals';
import type { OrderTypeEnum } from '@/api/apiEnums';
import { ConditionalType } from '@/api/sqlSugar';
import downloadExcel from '@/utils/downloadExcel';
import createComponent from '@/utils/createComponent';
import { $t } from '@/locales';
import CustomHeader from '@/views/configprovider/table/modules/customHeader.vue';
import EditForm from './modules/edit-form.vue';
import { usePagination, useRequest } from '~/packages/alova/src/client';

const route = useRoute();
// 表格组件引用（导出 Excel 用）
const tableRef = ref();
type DataType = FileRecordDTO;

// 默认列表字段（文本列 + 表头搜索），进入列设置面板供勾选/排序；其余字段缺省时消费方按 falsy 兜底。
// newName/filePath 为技术字段，默认不勾选，需要时在列设置中开启
const defaultColumns: Array<Partial<TableColumnCtx<DataType> & TableColumn>> = [
  { prop: 'originalName', label: '文件原名称', searchType: ConditionalType.Like, checked: true },
  { prop: 'description', label: '文件描述', searchType: ConditionalType.Like, checked: true },
  { prop: 'contentTypeName', label: '文件类别', checked: true },
  { prop: 'size', label: '文件大小', checked: true },
  { prop: 'contentType', label: '文件类型', checked: false },
  { prop: 'newName', label: '文件新名称', checked: false },
  { prop: 'filePath', label: '存储路径', checked: false }
];

// columns 仅接受后端返回的原始列配置；columnData 为生效列（初始默认列，loadChange 后合并后端列），供列设置管理与表格渲染
const columns = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>([]);
// 列设置候选：初始为默认列，loadChange 后合并为「后端配置列 + 默认列」
const columnData = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>(defaultColumns);
const dataTableConfig = ref<UI.DataTableConfig>({
  sortList: {}
});
// 表头搜索条件
const searchParams = ref<Record<string, Record<string, string>>>({});
// 多选行（表格 selection 列联动，供批量删除使用）
const checkedRowKeys = ref<string[]>([]);

// 表格视图配置加载回调；dataTableConfig 被 deep watch，赋值后触发分页请求
const loadChange = (table: TableView) => {
  columns.value = (table?.columns || []) as Array<Partial<TableColumnCtx<DataType> & TableColumn>>;

  // 后端列与默认列按 prop 去重合并进 columnData：后端配置优先，checked 跟随后端 isShow，默认列补充后端未配置的字段
  const backendProps = new Set(columns.value.map(item => item.prop));
  columnData.value = [...columns.value, ...defaultColumns.filter(item => !backendProps.has(item.prop as string))];

  if (dataTableConfig.value) dataTableConfig.value.sortList = table?.sorts || {};
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
        label: $t(item.label as string),
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
    Apis.FileRecord.GetPage({
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

/** 删除 */
const { send: handleDelete, loading: delLoading } = useRequest(
  (ids: string[]) =>
    Apis.FileRecord.Delete({
      data: ids,
      transform: res => {
        window.$message?.success('删除成功！');
        getData(page.value, pageSize.value);
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

// 行内缩略图缓存：记录 id → blob objectURL（仅图片类型按需拉取，翻页返回命中缓存不重复拉取）
const previewSrcMap = ref<Record<string, string>>({});

/** 复制记录 id 到剪贴板 */
const handleCopyId = async (id: string) => {
  await navigator.clipboard.writeText(id);
  window.$message?.success('记录 Id 已复制');
};

const isImage = (row: DataType) => row.contentType?.startsWith('image/');

/** 拉取行内图片缩略图 */
const { send: fetchPreviewSrc } = useRequest(
  (row: DataType) =>
    Apis.FileRecord.Read({
      params: { id: row.id },
      responseType: 'blob',
      transform: res => {
        previewSrcMap.value[row.id] = URL.createObjectURL(res as unknown as Blob);
        return res;
      }
    }),
  { force: true, immediate: false }
);

// 分页数据变化后，为图片类型行补拉缩略图
watch(data, list => {
  list.forEach(row => {
    if (isImage(row) && !previewSrcMap.value[row.id]) {
      fetchPreviewSrc(row);
    }
  });
});

// 卸载时释放全部缩略图 blob URL
onUnmounted(() => {
  Object.values(previewSrcMap.value).forEach(url => URL.revokeObjectURL(url));
});

/** 下载：带 token 拉取文件流，以原文件名落盘 */
const { send: handleDownload, loading: downloadLoading } = useRequest(
  (row: DataType) =>
    Apis.FileRecord.Read({
      params: { id: row.id },
      responseType: 'blob',
      transform: res => {
        const blob = res as unknown as Blob;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = row.originalName || row.newName || 'file';
        link.click();
        // 下载触发后延迟释放 blob URL，避免内存泄漏
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 60000);
        return blob;
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

// 打开上传弹窗：动态挂载编辑表单，上传成功后刷新列表
const openUpload = async () => {
  const { on, unmount } = await createComponent(EditForm, {
    visible: true
  });
  on('uploaded', () => {
    getData(page.value, pageSize.value);
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
            <ElButton type="primary" @click="openUpload()">
              <template #icon>
                <icon-mdi-upload class="text-icon" />
              </template>
              上传
            </ElButton>
            <TableViewSetting tableof="FileRecordDTO" router="" config-id="" @load-change="loadChange" />
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
            <!-- 图片行内缩略图：blob 懒加载，点击放大查看；非图片行显示占位 -->
            <ElTableColumn prop="preview" label="预览" align="center" width="80">
              <template #default="{ row }">
                <ElImage
                  v-if="previewSrcMap[row.id]"
                  :src="previewSrcMap[row.id]"
                  fit="cover"
                  class="h-40px w-40px rounded-4px"
                  :preview-src-list="[previewSrcMap[row.id]]"
                  preview-teleported
                  hide-on-click-modal
                />
                <icon-mdi-loading v-else-if="isImage(row)" class="animate-spin text-icon" />
                <span v-else>—</span>
              </template>
            </ElTableColumn>
            <!-- 记录 Id：点击复制到剪贴板 -->
            <ElTableColumn prop="id" label="Id" width="180" show-overflow-tooltip>
              <template #default="{ row }">
                <span
                  class="cursor-pointer color-primary hover:opacity-80"
                  title="点击复制"
                  @click="handleCopyId(row.id)"
                >
                  {{ row.id }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn v-for="(item, index) in tableColumns" :key="index" v-bind="item">
              <template v-if="item.searchType != null" #header>
                <CustomHeader v-model="searchParams" :column="item" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="use" label="操作" align="center" width="140" fixed="right">
              <template #default="{ row }">
                <div class="flex-center pr-10px">
                  <ElButton type="primary" plain size="small" :loading="downloadLoading" @click="handleDownload(row)">
                    下载
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
