<script setup lang="tsx">
import { computed, ref } from 'vue';
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
import Apis, { alovaInstance } from '@/api';
import type { FileRecordDTO } from '@/api/globals';
import type { OrderTypeEnum } from '@/api/apiEnums';
import { ConditionalType } from '@/api/sqlSugar';
import downloadExcel from '@/utils/downloadExcel';
import createComponent from '@/utils/createComponent';
import type { TableColumn } from '@/typings/table';
import { $t } from '@/locales';
import CustomHeader from '@/components/advanced/custom-header.vue';
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

// columnData 为生效列数据源（本地 defaultColumns 为唯一列定义），供列设置管理与表格渲染
const columnData = ref<Array<Partial<TableColumnCtx<DataType> & TableColumn>>>(defaultColumns);
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

// 后端真实地址 origin：必须取原始 env 值——createServiceConfig 在 dev 代理模式下返回代理前缀（/proxy-default，相对路径），
// new URL 后会落到管理端自身端口，而 /api 未配置代理导致图片 404；同源部署（baseURL 为相对路径）时回退站点 origin
const backendOrigin = new URL(import.meta.env.VITE_SERVICE_BASE_URL || window.location.origin, window.location.origin)
  .origin;

/** 图片查看地址：Read 接口返回文件流，是系统内查看图片的统一入口（AllowAnonymous，可直接内联打开） */
const getImagePath = (id: string) => `${backendOrigin}/api/FileRecord/Read/${id}`;

/** 复制完整图片路径到剪贴板 */
const handleCopyPath = async (path: string) => {
  await navigator.clipboard.writeText(path);
  window.$message?.success('图片路径已复制');
};

const isImage = (row: DataType) => row.contentType?.startsWith('image/');

/** 下载：拉取文件流，以原文件名落盘（Read 已从 swagger 隐藏，走 alova 实例直连，不经生成 API 层） */
const { send: handleDownload, loading: downloadLoading } = useRequest(
  (row: DataType) =>
    alovaInstance.Get(`/api/FileRecord/Read/${row.id}`, {
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
            <!-- 图片行内缩略图：img 直指 Read 地址（AllowAnonymous 浏览器自行加载），点击放大查看；非图片行显示占位 -->
            <ElTableColumn prop="preview" label="预览" align="center" width="80">
              <template #default="{ row }">
                <ElImage
                  v-if="isImage(row)"
                  :src="getImagePath(row.id)"
                  fit="cover"
                  class="h-40px w-40px rounded-4px"
                  :preview-src-list="[getImagePath(row.id)]"
                  preview-teleported
                  hide-on-click-modal
                />
                <span v-else>—</span>
              </template>
            </ElTableColumn>
            <!-- 图片查看地址：Read 接口 URL，点击复制 -->
            <ElTableColumn prop="filePath" label="图片路径" width="220" show-overflow-tooltip>
              <template #default="{ row }">
                <span
                  class="cursor-pointer color-primary hover:opacity-80"
                  title="点击复制图片路径"
                  @click="handleCopyPath(getImagePath(row.id))"
                >
                  {{ getImagePath(row.id) }}
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
