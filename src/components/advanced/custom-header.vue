<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { TableColumnCtx } from 'element-plus';
import { ConditionalType } from '@/api/sqlSugar';
import type { TableColumn } from '@/typings/table';
defineOptions({ name: 'CustomHeader', inheritAttrs: false });
type Props = {
  column: Partial<TableColumnCtx<any> & TableColumn>;
};
const { column } = defineProps<Props>();
const searchValue = ref<string>();
const searchParams = defineModel<Record<string, Record<string, string>>>({
  type: Object,
  required: true
});

watch(
  () => searchParams.value,
  () => {
    searchValue.value = searchParams.value[column.prop as string]?.value;
  },
  { deep: true }
);
const confirm = () => {
  if (searchValue.value) {
    searchParams.value[column.prop as string] = {
      key: column.prop as string,
      value: searchValue.value as unknown as string,
      searchType: column.searchType as unknown as string
    };
  } else {
    // 删除
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete searchParams.value[column.prop as string];
  }
};
</script>

<template>
  <!-- 注意：逻辑部分尽量不好写到这个组件内，因为这个组件是根据外面table循环创建的，在这里写逻辑会非常影响性能 -->
  <div class="inline-block" @click.stop>
    <ElPopover
      v-if="column.prop"
      placement="bottom"
      :title="'查询条件：' + $t(`sqlSugar.${ConditionalType[column.searchType as ConditionalType]}`)"
      width="300"
      trigger="click"
    >
      <!-- 动态传入组件 -->
      <ElInput
        :ref="`${column?.prop}Ref`"
        v-model="searchValue"
        :placeholder="$t('common.placeholder') + column.label"
        v-bind="$attrs"
      ></ElInput>
      <!-- confirm 确定框-->
      <div class="flex justify-end">
        <ElButton @click="confirm">清空</ElButton>
        <ElButton type="primary" @click="confirm">搜索</ElButton>
      </div>
      <!-- label 标题显示-->
      <template #reference>
        <div>
          <IconIcRoundSearch />
          <span :class="searchValue ? 'text-primary' : ''">{{ column.label }}</span>
        </div>
      </template>
    </ElPopover>
    <span v-else>{{ column.label }}</span>
  </div>
</template>

<style scoped></style>
