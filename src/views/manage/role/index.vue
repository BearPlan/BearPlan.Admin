<script setup lang="tsx">
import { ref } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElPopconfirm } from 'element-plus';
import type { RoleDTO } from '@/api/globals';
import createComponent from '@/utils/createComponent';
import DynamicList from '@/views/configprovider/table/dynamic-list.vue';
import { $t } from '@/locales';
// import EditForm from '@/views/configprovider/table/edit-form.vue';
import Permission from './modules/permission.vue';
const listRef = ref();

// // 打开编辑/新增
// const editFormRef = ref();
// const openForm = (id: string | null) => {
//   editFormRef.value?.openForm(id);
// };
// 删除
const handleDelete = (ids: string[]) => {
  listRef.value?.handleDelete(ids);
};

const reload = () => {
  listRef.value?.reload();
};

type DateType = RoleDTO;
const endColumns = ref<UI.TableColumnCheck[] | (Partial<TableColumnCtx<DateType>> & { checked?: boolean })[]>([
  {
    prop: 'use',
    label: '操作',
    align: 'center',
    checked: true,
    width: 200,
    formatter: row => (
      <div class="flex-center gap-2">
        <ElButton type="primary" plain size="small" onClick={() => openTreeForm(row)}>
          权限配置
        </ElButton>

        {/* <ElButton type="primary" plain size="small" onClick={() => openForm(row.id)}>
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

// 打开权限配置
const openTreeForm = async (row: RoleDTO) => {
  const { instance, on, unmount } = await createComponent(Permission, { visible: true });
  instance?.openForm(row.id, row.name);
  on('refresh', () => {
    listRef.value?.reload();
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
    <DynamicList
      ref="listRef"
      tableof="RoleDTO"
      router=""
      config-id=""
      page-url="/api/Role/GetPage"
      add-url="/api/Role/Add"
      del-url="/api/Role/Delete"
      :end-columns="endColumns"
    ></DynamicList>
    <!--
 @load-change="loadChange"
      @open-form="openForm"
-->

    <!--
 <EditForm
      ref="editFormRef"
      config-id=""
      router=""
      tableof="UpdateRoleParam"
      info-url="/api/Role/GetInfo"
      submit-url="/api/Role/Update"
      @reload="reload"
    ></EditForm>
-->
  </div>
</template>
