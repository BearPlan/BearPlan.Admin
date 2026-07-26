<script setup lang="tsx">
import { computed, watch } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateJobParam } from '@/api/globals';
import { useForm as useCommonForm } from '@/hooks/common/form';
import { getEnumValue } from '@/utils/common';
import createComponent from '@/utils/createComponent';
import { $t } from '@/locales';
defineOptions({
  name: 'JobEditForm'
});
type FormType = UpdateJobParam & { path: string };

// interface Props {
//   tableof: string;
//   router: string;
//   configId: string;
//   endColumns?: UI.TableColumnCheck[] | (Partial<TableColumnCtx<any>> & { checked?: boolean })[];
// }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const { tableof, router, configId, pageUrl, addUrl, delUrl, params , endColumns} = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
// const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {};

interface Emits {
  (e: 'reload', row: any): any;
}
const emit = defineEmits<Emits>();

/** 提交详情 */
const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  updateForm
} = useForm(
  form =>
    (form.id ? Apis.Job.Update : Apis.Job.Add)({
      data: form,
      transform: () => {
        visible.value = false;
        window.$message?.success($t('common.updateSuccess'));
        emit('reload', form);
      }
    }),
  {
    immediate: false,
    resetAfterSubmiting: true,
    initialForm: {
      id: null
    } as unknown as FormType
    // async middleware(_, next) {
    //   validate().then(async () => {
    //     await next();
    //   });
    // }
  }
);
/** 获取详情 */
const { send: getInfo } = useRequest(
  id =>
    Apis.Job.GetInfo({
      params: { id },
      transform: res => {
        // Ensure proper icon field mapping based on iconType

        updateForm(res.data);
      }
    }),
  { force: true, immediate: false }
);
const title = computed(() => {
  return formData.value.id ? $t('common.edit') : $t('common.add');
});
// 打开
const openForm = async (id?: string) => {
  if (id) {
    await getInfo(id);
  } else {
  }
};

const closeForm = () => {
  visible.value = false;
  restoreValidation();
  resetFrom();
};

defineExpose({
  openForm
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-800px">
    <template #header>
      {{ title }}
    </template>

    <ElScrollbar class="h-480px pr-20px"></ElScrollbar>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
