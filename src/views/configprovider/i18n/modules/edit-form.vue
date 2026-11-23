<script setup lang="ts">
import { computed } from 'vue';
import { useForm } from 'alova/client';
import Apis from '@/api';
import type { I18nDTO, UpdateI18nParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
defineOptions({
  name: 'I18nEditForm'
});
type FormType = UpdateI18nParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  key: defaultRequiredRule
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
    (form.id ? Apis.I18n.Update : Apis.I18n.Add)({
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
      key: '',
      zhCn: '',
      enUs: '',
      source: '',
      count: 0
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
const title = computed(() => {
  return formData.value.id ? $t('common.edit') : $t('common.add');
});
// 打开：I18n 无 GetInfo 接口，编辑时直接用列表行数据回填；后端 UpdateAsync 默认忽略空字段，审计字段不会被覆盖
const openForm = async (row: I18nDTO | null) => {
  visible.value = true;
  if (row) {
    updateForm(row as unknown as FormType);
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
  <ElDialog v-model="visible" :title="title" preset="card" class="w-900px">
    <ElScrollbar class="h-480px pr-20px">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
        <ElFormItem label="键名" prop="key">
          <ElInput v-model="formData.key" :placeholder="$t('common.placeholder') + '键名'" />
        </ElFormItem>

        <ElFormItem label="中文" prop="zhCn">
          <ElInput v-model="formData.zhCn" :placeholder="$t('common.placeholder') + '中文'" />
        </ElFormItem>

        <ElFormItem label="英文" prop="enUs">
          <ElInput v-model="formData.enUs" :placeholder="$t('common.placeholder') + '英文'" />
        </ElFormItem>

        <ElFormItem label="来源" prop="source">
          <ElInput v-model="formData.source" :placeholder="$t('common.placeholder') + '来源'" />
        </ElFormItem>

        <ElFormItem label="使用次数" prop="count">
          <ElInputNumber v-model="formData.count" class="w-full" :placeholder="$t('common.placeholder') + '使用次数'" />
        </ElFormItem>
      </ElForm>
    </ElScrollbar>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.close') }}</ElButton>
        <ElButton type="primary" :loading="subLoading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
