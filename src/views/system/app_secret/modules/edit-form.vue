<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateAppSecretParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'AppSecretEditForm'
});

type FormType = UpdateAppSecretParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  appId: defaultRequiredRule,
  appSecretKey: defaultRequiredRule
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
    (form.id ? Apis.AppSecret.Update : Apis.AppSecret.Add)({
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
      appId: '',
      appSecretKey: '',
      appName: '',
      remark: ''
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
    Apis.AppSecret.GetInfo({
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

/** 生成随机 UUID 填入指定字段 */
const generateUuid = (key: 'appId' | 'appSecretKey') => {
  formData.value[key] = crypto.randomUUID();
};

defineExpose({
  openForm
});
const loading = computed<boolean>(() => subLoading.value || infoLoading.value);
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-800px" @close="closeForm">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
      <ElFormItem label="应用名称" prop="appName">
        <ElInput v-model="formData.appName" :placeholder="$t('common.placeholder') + '应用名称'" />
      </ElFormItem>

      <ElFormItem label="应用ID" prop="appId">
        <ElInput v-model="formData.appId" :placeholder="$t('common.placeholder') + '应用ID'">
          <template #append>
            <ElButton @click="generateUuid('appId')">生成</ElButton>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem label="应用秘钥" prop="appSecretKey">
        <ElInput v-model="formData.appSecretKey" :placeholder="$t('common.placeholder') + '应用秘钥'">
          <template #append>
            <ElButton @click="generateUuid('appSecretKey')">生成</ElButton>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          :placeholder="$t('common.placeholder') + '备注'"
        />
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
