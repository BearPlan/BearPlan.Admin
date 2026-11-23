<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateSettingParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'SettingEditForm'
});

type FormType = UpdateSettingParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  name: defaultRequiredRule,
  value: defaultRequiredRule
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
    (form.id ? Apis.Setting.Update : Apis.Setting.Add)({
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
      id: null,
      name: '',
      value: '',
      enabled: true,
      description: ''
    } as unknown as FormType,
    async middleware(ctx, next) {
      // 校验通过才发起提交，完成后复位按钮 loading
      validate().then(async () => {
        await next();
        ctx.proxyStates.loading.v = false;
      });
    }
  }
);
/** 获取详情 */
const { send: getInfo, loading: infoLoading } = useRequest(
  id =>
    Apis.Setting.GetInfo({
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
  <ElDialog v-model="visible" :title="title" preset="card" class="w-900px">
    <ElScrollbar class="h-480px pr-20px">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="formData.name" :placeholder="$t('common.placeholder') + '名称'" />
        </ElFormItem>

        <ElFormItem label="值" prop="value">
          <ElInput v-model="formData.value" :placeholder="$t('common.placeholder') + '值'" />
        </ElFormItem>

        <ElFormItem label="启用状态" prop="enabled">
          <ElRadioGroup v-model="formData.enabled">
            <ElRadio :value="true" label="启用" />
            <ElRadio :value="false" label="禁用" />
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('common.placeholder') + '描述'"
          />
        </ElFormItem>
      </ElForm>
    </ElScrollbar>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.close') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
