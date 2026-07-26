<script setup lang="tsx">
import { ref, useTemplateRef } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElPopconfirm } from 'element-plus';
import type { DeptDTO, TableColumn, TableView } from '@/api/globals';
import DynamicList from '@/views/configprovider/table/dynamic-list.vue';
// import EditForm from '@/views/configprovider/table/edit-form.vue';
import { $t } from '@/locales';

const listRef = useTemplateRef('listRef');

// 打开编辑/新增
// const editFormRef = useTemplateRef("editFormRef");
// const openForm = (id: string | null) => {
//   editFormRef.value?.openForm(id);
// };
// 删除
const handleDelete = (ids: string[]) => {
  listRef.value?.handleDelete(ids);
};
// 刷新
const reload = () => {
  listRef.value?.reload();
};

type DateType = DeptDTO;
const endColumn = ref<UI.TableColumnCheck[] | (Partial<TableColumnCtx<DateType>> & { checked?: boolean })[]>([
  {
    prop: 'use',
    label: '操作',
    align: 'center',
    checked: true,
    width: 150,
    formatter: row => (
      <div class="flex-center pr-10px">
        {/* <ElButton
          type="primary"
          plain
          size="small"
          onClick={() => openForm(row.id)}
        >
          编辑
        </ElButton> */}
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
      tableof="DeptDTO"
      router=""
      config-id=""
      page-url="/api/Dept/GetPage"
      add-url="/api/Dept/Add"
      del-url="/api/Dept/Delete"
      :end-column="endColumn"
    ></DynamicList>

    <!--
  <EditForm
    ref="editFormRef"
    config-id=""
    router=""
    tableof="UpdateDeptParam"
    info-url="/api/Dept/GetInfo"
    submit-url="/api/Dept/Update"
    @refresh="refresh"
  ></EditForm>
-->
  </div>
</template>
