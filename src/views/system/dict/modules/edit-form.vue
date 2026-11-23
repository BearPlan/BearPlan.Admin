<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateDictParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DictEditForm'
});

type FormType = UpdateDictParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  dictType: defaultRequiredRule,
  name: defaultRequiredRule
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
    (form.id ? Apis.Dict.Update : Apis.Dict.Add)({
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
    // 只编辑字典主体；dictDetails 明细由后端映射忽略（Dict 实体不含导航属性），不随本表单提交
    initialForm: {
      id: null,
      dictType: 2,
      name: '',
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
    Apis.Dict.GetInfo({
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
const loading = computed<boolean>(() => subLoading.value || infoLoading.value);
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-700px">
    <ElScrollbar class="h-300px pr-20px">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
        <ElFormItem label="字典类型" prop="dictType">
          <ElRadioGroup v-model="formData.dictType">
            <ElRadio :value="1" label="系统" />
            <ElRadio :value="2" label="业务" />
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="名称" prop="name">
          <ElInput v-model="formData.name" :placeholder="$t('common.placeholder') + '名称'" />
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
