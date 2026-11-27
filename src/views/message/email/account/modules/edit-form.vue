<script setup lang="ts">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateEmailAccountParam } from '@/api/globals';
import { useForm as useCommonForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'EmailAccountEditForm' });
type FormType = UpdateEmailAccountParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();

type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  email: { required: true, message: `${$t('common.placeholder')}邮箱地址` },
  host: { required: true, message: `${$t('common.placeholder')}SMTP 主机` },
  userName: { required: true, message: `${$t('common.placeholder')}用户名` }
};

interface Emits {
  (e: 'reload'): any;
}
const emit = defineEmits<Emits>();

/** 提交：根据 id 自动切换新增/修改 */
const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  updateForm,
  loading: subLoading
} = useForm(
  form =>
    (form.id ? Apis.EmailAccount.Update : Apis.EmailAccount.Add)({
      data: form,
      transform: () => {
        visible.value = false;
        window.$message?.success($t('common.updateSuccess'));
        emit('reload');
      }
    }),
  {
    immediate: false,
    resetAfterSubmiting: true,
    initialForm: {
      id: 0,
      email: null,
      displayName: null,
      host: null,
      port: 25,
      userName: null,
      password: null,
      enableSsl: true,
      useDefaultCredentials: false
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
    Apis.EmailAccount.GetInfo({
      params: { id },
      transform: res => {
        updateForm(res.data as unknown as FormType);
      }
    }),
  { force: true, immediate: false }
);

const title = computed(() => (formData.value.id ? $t('common.edit') : $t('common.add')));

/** 打开：有 id 走详情回填，无 id 走新增 */
const openForm = async (id?: string | null) => {
  if (id) {
    await getInfo(id);
  }
};

const closeForm = () => {
  visible.value = false;
  restoreValidation();
  resetFrom();
};

defineExpose({ openForm });
const loading = computed<boolean>(() => subLoading.value || infoLoading.value);
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-800px" @close="closeForm">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="120">
      <ElRow>
        <ElCol :span="24">
          <ElFormItem label="邮箱地址" prop="email">
            <ElInput v-model="formData.email" :placeholder="$t('common.placeholder') + '邮箱地址'" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="显示名称" prop="displayName">
            <ElInput v-model="formData.displayName" :placeholder="$t('common.placeholder') + '显示名称'" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="SMTP 主机" prop="host">
            <ElInput v-model="formData.host" :placeholder="$t('common.placeholder') + 'SMTP 主机'" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="端口" prop="port">
            <ElInputNumber v-model="formData.port" class="w-full" :min="1" :max="65535" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="用户名" prop="userName">
            <ElInput v-model="formData.userName" :placeholder="$t('common.placeholder') + '用户名'" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="密码" prop="password">
            <ElInput
              v-model="formData.password"
              type="password"
              show-password
              :placeholder="$t('common.placeholder') + '密码'"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="启用 SSL" prop="enableSsl">
            <ElRadioGroup v-model="formData.enableSsl">
              <ElRadio :value="true" label="是" />
              <ElRadio :value="false" label="否" />
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="默认凭据" prop="useDefaultCredentials">
            <ElRadioGroup v-model="formData.useDefaultCredentials">
              <ElRadio :value="true" label="是" />
              <ElRadio :value="false" label="否" />
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
