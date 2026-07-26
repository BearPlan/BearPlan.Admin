<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useRequest } from 'alova/client';
import Apis from '@/api';
import type { TableForm } from '@/api/globals';

defineOptions({
  name: 'FromHeaderSetting'
});
const userouter = useRouter();
interface Props {
  tableof: string;
  router: string;
  configId: string;
}

const { configId, tableof, router } = defineProps<Props>();

interface Emits {
  (e: 'loadChange', data: TableForm): void;
}

const emit = defineEmits<Emits>();

// const jsonString =
//   '{"name": "example", "renderFunction": "function render(row, submit) { return `<div>${row.isShow ? \'显示\' : \'隐藏\'}</div>`; }"}';
// const parsedObject = JSON.parse(jsonString);
// const renderFunction = new Function(`return ${parsedObject.renderFunction}`)();

const { loading } = useRequest(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  () =>
    Apis.TableForm.GetForm({
      params: {
        Tableof: tableof,
        ConfigId: configId,
        Router: router
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
tyept;
// 页面跳转
function linkPush() {
  console.log(userouter, {
    path: `/table/form`,
    query: {
      configId,
      tableof,
      router
    }
  });

  userouter.push({
    path: `/table/form`,
    query: {
      configId,
      tableof,
      router
    }
  });
  // switch (viewType) {
  //   case ViewTypeEnum.主页:
  //     router.push({
  //       path: `/table/view`,
  //       query: {
  //         configId,
  //         tableof,
  //         viewType
  //       }
  //     });
  //     break;

  //   case ViewTypeEnum.详情页:
  //     router.push({
  //       path: `/table/form`,
  //       query: {
  //         configId,
  //         tableof,
  //         viewType
  //       }
  //     });
  //     break;
  //   default:
  //     break;
  // }
}
</script>

<template>
  <ElButton v-loading="loading" type="danger" @click="linkPush">
    <template #icon>
      <icon-ant-design-setting-outlined class="text-icon" />
    </template>
    表单配置
  </ElButton>
</template>

<style scoped></style>
