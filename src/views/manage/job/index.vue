<script setup lang="tsx">
import { ref, useTemplateRef } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElPopconfirm } from 'element-plus';
import type { JobDTO, TableColumn, TableView } from '@/api/globals';
import createComponent from '@/utils/createComponent';
import DynamicList from '@/views/configprovider/table/dynamic-list.vue';
import { $t } from '@/locales';
import EditForm from './modules/edit-form.vue';
const searchData = ref<TableColumn[]>([]);
const listRef = useTemplateRef('listRef');
const loadChange = (table: TableView) => {
  searchData.value = table?.columns?.filter(item => item.searchType !== null) || [];
};
const searchParams = ref<UI.SearchParams>({});

// 打开编辑/新增
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

const handleDelete = (ids: string[]) => {
  listRef.value?.handleDelete(ids);
};
// 刷新
const reload = () => {
  listRef.value?.reload();
};

type DateType = JobDTO;

const endColumns = ref<UI.TableColumnCheck[] | (Partial<TableColumnCtx<DateType>> & { checked?: boolean })[]>([
  {
    prop: 'use',
    label: '操作',
    align: 'center',
    checked: true,
    width: 200,
    formatter: row => (
      <div class="flex-center pr-10px">
        <ElButton type="primary" plain size="small" onClick={() => openForm(row.id)}>
          {$t('common.edit')}
        </ElButton>
        <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete([row.id])}>
          {{
            reference: () => (
              <ElButton type="danger" plain size="small">
                {$t('common.delete')}
              </ElButton>
            )
          }}
        </ElPopconfirm>
      </div>
    )
  }
]);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DynamicList
      ref="listRef"
      tableof="JobDTO"
      router=""
      config-id=""
      page-url="/api/Job/GetPage"
      add-url="/api/Job/Add"
      del-url="/api/Job/Delete"
      :search-params="searchParams"
      :end-columns="endColumns"
    ></DynamicList>
  </div>
</template>
