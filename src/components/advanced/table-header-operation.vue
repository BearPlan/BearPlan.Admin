<script setup lang="ts">
import type { TableColumnCtx } from 'element-plus';
import type { TableColumn } from '@/typings/table';
import { $t } from '@/locales';

defineOptions({ name: 'TableHeaderOperation' });

interface Props {
  disabledDelete?: boolean;
  loading?: boolean;
}

defineProps<Props>();

interface Emits {
  (e: 'add'): void;
  (e: 'delete'): void;
  (e: 'refresh'): void;
}

const emit = defineEmits<Emits>();

const columns = defineModel<Array<Partial<TableColumnCtx<TableColumn>>>>('columns', {
  default: () => []
});

function add() {
  emit('add');
}

function batchDelete() {
  emit('delete');
}

function refresh() {
  emit('refresh');
}
</script>

<template>
  <ElSpace direction="horizontal" wrap justify="end" class="lt-sm:w-200px">
    <slot name="prefix"></slot>
    <slot name="default">
      <ElButton plain type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        {{ $t('common.add') }}
      </ElButton>
      <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="batchDelete">
        <template #reference>
          <ElButton type="danger" plain :disabled="disabledDelete">
            <template #icon>
              <icon-ic-round-delete class="text-icon" />
            </template>
            {{ $t('common.batchDelete') }}
          </ElButton>
        </template>
      </ElPopconfirm>
    </slot>
    <ElButton @click="refresh">
      <template #icon>
        <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      {{ $t('common.refresh') }}
    </ElButton>
    <TableColumnSetting v-model:columns="columns" />
    <slot name="suffix"></slot>
  </ElSpace>
</template>

<style scoped></style>
