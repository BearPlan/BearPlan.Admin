<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useRequest } from 'alova/client';
import Apis from '@/api';
import type { TableView } from '@/api/globals';
import type { SchemaName } from '@/api/apiModels';
const userouter = useRouter();
defineOptions({
  name: 'TableHeaderSetting'
});

interface Props {
  tableof: SchemaName;
  router?: string;
  configId?: string;
}

const { configId = '', tableof, router = '' } = defineProps<Props>();

interface Emits {
  (e: 'loadChange', data: TableView): void;
}

const emit = defineEmits<Emits>();

// const jsonString =
//   '{"name": "example", "renderFunction": "function render(row, submit) { return `<div>${row.isShow ? \'显示\' : \'隐藏\'}</div>`; }"}';
// const parsedObject = JSON.parse(jsonString);
// const renderFunction = new Function(`return ${parsedObject.renderFunction}`)();

const { loading } = useRequest(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  () =>
    Apis.TableView.GetView({
      params: {
        Tableof: tableof,
        ConfigId: configId || '',
        Router: router || ''
      },
      transform: res => {
        emit('loadChange', res.data);
      }
    }),
  {
    force: true,
    immediate: true
  }
);

// 页面跳转
function linkPush() {
  userouter.push({
    name: `configprovider_column`,
    query: {
      configId,
      tableof,
      router
    }
  });
}
</script>

<template>
  <ElButton v-loading="loading" type="danger" @click="linkPush">
    <template #icon>
      <icon-ant-design-setting-outlined class="text-icon" />
    </template>
    主页配置
  </ElButton>
</template>

<style scoped></style>
