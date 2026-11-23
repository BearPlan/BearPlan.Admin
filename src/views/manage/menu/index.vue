<script setup lang="tsx">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElPopconfirm, ElTag } from 'element-plus';
import { useRequest } from 'alova/client';
import { VueDraggable } from 'vue-draggable-plus';
import Apis from '@/api';
import type { MenuTreeDTO } from '@/api/globals';
import { IconTypeEnum, MenuTypeEnum } from '@/api/apiEnums';
import createComponent from '@/utils/createComponent';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import { MenuTypeEl } from '../../../api/apiEnumEls';
import EditForm from './modules/edit-form.vue';
const route = useRoute();
defineOptions({ name: 'MenuComponent' });

/** 获取数据 */
const {
  send: getData,
  data,
  loading
} = useRequest(
  () =>
    Apis.Menu.GetTree({
      transform: res => {
        // const forch = (item: MenuTreeDTO, parent?: MenuTreeDTO) => {
        //   item.path = `/${item.name}`;
        //   item.name = parent ? `${parent?.name}_${item.name}` : item.name;
        //   item.routePath = parent ? parent?.path + item?.path : item.path;
        //   if (item.children) {
        //     item.children.forEach((child: MenuTreeDTO) => {
        //       forch(child, item);
        //     });
        //   }
        // };
        // res.data.forEach((item: MenuTreeDTO) => {
        //   forch(item, undefined);
        // });
        return res.data;
      }
    }),
  {
    force: true,
    immediate: true
  }
);
// 删除
const { send: handleDelete } = useRequest(
  ids =>
    Apis.Menu.Delete({
      data: ids,
      transform: res => {
        window.$message?.success('删除成功！');
        getData();
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

const checkedRowKeys = ref<string[]>([]);

const openForm = async (id?: string | null) => {
  const { instance, on, unmount } = await createComponent(EditForm, { visible: true });
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

const handleAddChildMenu = async (row: MenuTreeDTO) => {
  const { instance, on, unmount } = await createComponent(EditForm, { visible: true });
  instance?.openForm(row.id, null);
  on('refresh', () => {
    getData();
  });

  on('update:visible', res => {
    if (!res) {
      unmount();
    }
  });
};

// 拖拽排序 - 简化版本，只是视觉排序，不调用后端
function onDragEnd(evt: any) {
  if (!data.value || evt.oldIndex === evt.newIndex) {
    return;
  }

  console.log('拖拽结束:', {
    oldIndex: evt.oldIndex,
    newIndex: evt.newIndex,
    movedItem: data.value[evt.newIndex]?.title
  });

  // 更新本地排序显示
  data.value.forEach((item, index) => {
    item.order = index + 1;
  });

  window.$message?.success(`菜单 "${data.value[evt.newIndex]?.title}" 已移动至位置 ${evt.newIndex + 1}`);

  // TODO: 如果需要保存到后端，可以在这里添加API调用
  // 暂时只做视觉反馈，不调用后端API
}

const columns = ref<TableColumn[] | (Partial<TableColumnCtx<MenuTreeDTO>> & { checked?: boolean })[]>([
  { type: 'selection', width: 48, checked: true, label: $t('table.selection') },
  { prop: 'title', label: $t('menu.menuName'), checked: true, minWidth: 120, align: 'left' },
  {
    prop: 'icon',
    label: '图标',
    width: 80,
    checked: true,
    align: 'center',
    formatter: (row, column, cellValue, index) => {
      const menuRow = row as MenuTreeDTO & { localIcon?: string };

      // Debug logging for iconify icons
      if (menuRow.iconType === IconTypeEnum.iconify && menuRow.icon) {
        console.log('Iconify icon data:', {
          iconType: menuRow.iconType,
          icon: menuRow.icon,
          IconTypeEnum
        });
      }

      if (menuRow.iconType === IconTypeEnum.local && menuRow.localIcon) {
        return (
          <div class="flex-center">
            <SvgIcon local-icon={menuRow.localIcon} class="text-icon" />
          </div>
        );
      } else if (menuRow.iconType === IconTypeEnum.iconify && menuRow.icon) {
        return (
          <div class="flex-center">
            <SvgIcon icon={menuRow.icon} class="text-icon" />
          </div>
        );
      }
      return <span class="text-gray-400">-</span>;
    }
  },
  { prop: 'name', label: $t('menu.routeName'), checked: true, minWidth: 120 },
  {
    prop: 'menuType',
    label: $t('menu.menuType'),
    width: 90,
    checked: true,
    formatter: row => {
      return <ElTag type={MenuTypeEl[row.menuType]}>{MenuTypeEnum[row.menuType]}</ElTag>;
    }
  },

  { prop: 'path', label: $t('menu.routePath'), checked: true, minWidth: 120 },
  {
    prop: 'status',
    label: $t('menu.menuStatus'),
    width: 80,
    checked: true,
    formatter: row => {
      if (row.status === undefined) {
        return '';
      }
      return <ElTag type={row.status ? 'success' : 'danger'}>{row.status ? '启用' : '禁用'}</ElTag>;
    }
  },
  {
    prop: 'hideInMenu',
    label: $t('menu.hideInMenu'),
    width: 80,
    checked: true,
    formatter: row => {
      return <ElTag type={row.hideInMenu ? 'danger' : 'success'}>{row.hideInMenu ? '是' : '否'}</ElTag>;
    }
  },
  {
    prop: 'drag',
    label: `拖拽${$t('menu.order')}`,
    width: 80,
    checked: true,
    formatter: row => (
      <div class="drag-handle flex cursor-move items-center justify-center hover:text-gray-600">
        <icon-ic-baseline-drag-indicator class="text-icon" />
        {row.order}
      </div>
    )
  },
  {
    prop: 'use',
    label: '操作',
    align: 'center',
    checked: true,
    width: 230,
    formatter: row => (
      <div class="flex-center justify-end pr-10px">
        {row.menuType === MenuTypeEnum.Directory ? (
          <ElButton type="primary" plain size="small" onClick={() => handleAddChildMenu(row)}>
            {$t('menu.addChildren')}
          </ElButton>
        ) : null}
        {row.menuType === MenuTypeEnum.Directory || row.menuType === MenuTypeEnum.Menu ? (
          <ElButton type="primary" plain size="small" onClick={() => openForm(row.id)}>
            {$t('common.edit')}
          </ElButton>
        ) : null}

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
    <ElCard class="card-wrapper sm:flex-1-hidden" body-class="ht50">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t(route.meta.i18nKey || route.meta.title || '') }}</p>

          <TableHeaderOperation
            v-model:columns="columns"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @refresh="getData"
          >
            <!-- v-if="hasAuth(dbConfig.addUrl)" -->
            <ElButton ghost type="primary" @click="openForm(null)">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('common.add') }}
            </ElButton>
            <!--       -->
            <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(checkedRowKeys)">
              <template #reference>
                <ElButton type="danger" plain :disabled="checkedRowKeys.length == 0">
                  <template #icon>
                    <icon-ic-round-delete class="text-icon" />
                  </template>
                  {{ $t('common.batchDelete') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-50px)]">
        <VueDraggable
          v-model="data"
          class="h-[calc(100%-50px)]"
          target="tbody"
          handle=".drag-handle"
          :animation="200"
          ghost-class="sortable-ghost"
          chosen-class="sortable-chosen"
          drag-class="sortable-drag"
          :disabled="false"
          @end="onDragEnd"
        >
          <ElTable
            v-loading="loading"
            height="100%"
            border
            class="sm:h-full"
            sortable
            :data="data"
            row-key="id"
            default-expand-all
          >
            <ElTableColumn v-for="(col, index) in columns.filter(item => item.checked)" :key="index" v-bind="col" />
          </ElTable>
        </VueDraggable>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.drag-handle {
  cursor: move !important;
  user-select: none;
}

.drag-handle:hover {
  color: #409eff;
  background-color: #f0f9ff;
  border-radius: 4px;
}

/* Disable dragging for other elements */
:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row .el-table__cell:not(.drag-handle)) {
  cursor: default;
}

.sortable-ghost {
  opacity: 0.5;
  background: #f0f0f0;
}

.sortable-chosen {
  background: #e6f7ff;
}

.sortable-drag {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.sortable-ghost .el-table__cell) {
  background: #f0f0f0 !important;
}
</style>
