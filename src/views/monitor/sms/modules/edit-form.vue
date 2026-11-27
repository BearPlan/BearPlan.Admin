<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateSmsParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'SmsEditForm'
});

type FormType = UpdateSmsParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  phone: defaultRequiredRule
};

interface Emits {
  (e: 'reload', row: any): any;
}
const emit = defineEmits<Emits>();

/** 提交详情 */
const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  updateForm,
  loading: subLoading
} = useForm(
  form =>
    (form.id ? Apis.Sms.Update : Apis.Sms.Add)({
      data: form,
      transform: _ => {
        window.$message?.success($t('common.updateSuccess'));
        visible.value = false;
        emit('reload', form);
      }
    }),
  {
    immediate: false,
    resetAfterSubmiting: true,
    initialForm: {
      id: 0,
      phone: '',
      content: '',
      templateId: '',
      smsOperator: '',
      isSuccess: true
    } as unknown as FormType,
    async middleware(_, next) {
      // 校验通过才发起提交；promise 链必须 await 透传给 alova，请求无论成败它都会自动复位 loading
      await validate();
      await next();
    }
  }
);
/** 获取详情 */
const { send: getInfo, loading: infoLoading } = useRequest(
  id =>
    Apis.Sms.GetInfo({
      params: { id },
      transform: res => {
        updateForm(res.data as unknown as FormType);
      }
    }),
  { force: true, immediate: false }
);
const title = computed(() => {
  return formData.value.id ? $t('common.edit') : $t('common.add');
});
// 打开
const openForm = async (_parentId: string | null, id?: string) => {
  visible.value = true;
  if (id) {
    await getInfo(id);
  } else {
    //
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
const loading = computed<boolean>(() => subLoading.value || infoLoading.value);
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-800px" @close="closeForm">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" :placeholder="$t('common.placeholder') + '手机号'" />
      </ElFormItem>

      <ElFormItem label="模板编号" prop="templateId">
        <ElInput v-model="formData.templateId" :placeholder="$t('common.placeholder') + '模板编号'" />
      </ElFormItem>

      <ElFormItem label="服务商" prop="smsOperator">
        <ElInput v-model="formData.smsOperator" :placeholder="$t('common.placeholder') + '服务商'" />
      </ElFormItem>

      <ElFormItem label="短信内容" prop="content">
        <ElInput
          v-model="formData.content"
          type="textarea"
          :rows="3"
          :placeholder="$t('common.placeholder') + '短信内容'"
        />
      </ElFormItem>

      <ElFormItem label="发送状态" prop="isSuccess">
        <ElRadioGroup v-model="formData.isSuccess">
          <ElRadio :value="true" label="成功" />
          <ElRadio :value="false" label="失败" />
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.close') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
