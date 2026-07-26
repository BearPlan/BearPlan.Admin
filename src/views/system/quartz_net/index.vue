<script setup lang="tsx">
import { ref } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElPopconfirm } from 'element-plus';
import Apis from '@/api';
import { type QuartzNetDTO } from '@/api/globals';
import createComponent from '@/utils/createComponent';
import { $t } from '@/locales';
import DynamicList from '@/views/configprovider/table/dynamic-list.vue';
import EditForm from './modules/edit-form.vue';
import { useRequest } from '~/packages/alova/src/client';
const listRef = ref();

const reload = () => {
  listRef.value?.reload();
};

// 打开编辑/新增
const openForm = async (id: string) => {
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

/** 获取详情 */
const { send: execute } = useRequest(
  id =>
    Apis.QuartzNet.Execute({
      params: { id },
      transform: res => {
        window.$message?.success('操作成功！');
      }
    }),
  { force: true, immediate: false }
);

const endColumns = ref<UI.TableColumnCheck[] | (Partial<TableColumnCtx<QuartzNetDTO>> & { checked?: boolean })[]>([
  {
    prop: 'use',
    label: '操作',
    align: 'center',
    checked: true,
    width: 200,
    formatter: row => (
      <div class="flex-center pr-10px">
        <ElButton type="primary" plain size="small" onClick={() => execute(row.id)}>
          执行
        </ElButton>
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
      tableof="QuartzNetDTO"
      router=""
      config-id=""
      page-url="/api/QuartzNet/GetPage"
      del-url="/api/QuartzNet/Delete"
      :end-columns="endColumns"
    ></DynamicList>
  </div>
</template>
