<script lang="ts" setup>
import { useRequest } from '@sa/alova/client';
import Apis from '@/api';
defineOptions({
  name: 'DetailDetailSelect',
  inheritAttrs: false
});
interface Props {
  dictId: string;
}

const props = defineProps<Props>();
const { loading, data } = useRequest(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  () =>
    Apis.Dept.GetInfo({
      params: {
        dictId: props.dictId
      },
      transform: res => {
        return res.data?.map(item => {
          return {
            label: item.label || '',
            value: item.value
          };
        });
      }
    }),
  {
    force: true,
    immediate: true,
    async middleware(ctx, next) {
      if (props.dictId) {
        await next();
        ctx.proxyStates.loading.v = false;
      }
    }
  }
);
const value = defineModel<string>('value', {
  required: true
});
</script>

<template>
  <ElSelect v-model="value" v-bind="$attrs" :placeholder="$t('common.placeholder')" clearable :loading="loading">
    <ElOption v-for="item in data" :key="item.value" :label="item.label" :value="item.value" />
  </ElSelect>
</template>
