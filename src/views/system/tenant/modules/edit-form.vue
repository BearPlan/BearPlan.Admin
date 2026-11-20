<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateTenantParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
import { dbTypeOptions } from './constants';

defineOptions({
  name: 'TenantEditForm'
});

type FormType = UpdateTenantParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();

/** 提交详情 */
const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  updateForm
} = useForm(
  form =>
    (form.id ? Apis.Tenant.Update : Apis.Tenant.Add)({
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
    // 只维护业务字段；审计字段（createId/createTime 等）由 GetInfo 回填后随表单提交
    initialForm: {
      id: null,
      tenantId: null,
      name: '',
      tenantType: 1,
      description: '',
      configId: '',
      dbType: null,
      connectionString: ''
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

type RuleKey = keyof FormType;
// 库隔离（tenantType=2）时库配置三项必填，切回 Id 隔离自动解除；rules 随租户类型动态生成
const rules = computed<Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>>>(() => {
  const dbRequiredRule: App.Global.FormRule = { required: true, message: $t('form.required') };
  return {
    tenantId: defaultRequiredRule,
    name: defaultRequiredRule,
    ...(formData.value.tenantType === 2
      ? { configId: dbRequiredRule, dbType: dbRequiredRule, connectionString: dbRequiredRule }
      : {})
  };
});

/** 获取详情 */
const { send: getInfo } = useRequest(
  id =>
    Apis.Tenant.GetInfo({
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
  <ElDialog v-model="visible" :title="title" preset="card" class="w-700px">
    <ElScrollbar class="h-300px pr-20px">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
        <ElFormItem label="租户Id" prop="tenantId">
          <ElInputNumber v-model="formData.tenantId" :min="1" :controls="false" class="!w-full" />
        </ElFormItem>

        <ElFormItem label="名称" prop="name">
          <ElInput v-model="formData.name" :placeholder="$t('common.placeholder') + '名称'" />
        </ElFormItem>

        <ElFormItem label="租户类型" prop="tenantType">
          <ElRadioGroup v-model="formData.tenantType">
            <ElRadio :value="1" label="Id隔离" />
            <ElRadio :value="2" label="库隔离" />
          </ElRadioGroup>
        </ElFormItem>

        <template v-if="formData.tenantType === 2">
          <ElFormItem label="库Id" prop="configId">
            <ElInput v-model="formData.configId" :placeholder="$t('common.placeholder') + '库Id'" />
          </ElFormItem>

          <ElFormItem label="数据库类型" prop="dbType">
            <ElSelect v-model="formData.dbType" class="w-full">
              <ElOption
                v-for="option in dbTypeOptions"
                :key="option.value"
                :value="option.value"
                :label="option.label"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="数据库连接" prop="connectionString">
            <ElInput
              v-model="formData.connectionString"
              type="textarea"
              :rows="3"
              :placeholder="$t('common.placeholder') + '数据库连接串'"
            />
          </ElFormItem>
        </template>

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
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
