<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateYouCertParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'EditForm'
});

type FormType = UpdateYouCertParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  name: [defaultRequiredRule],
  group: [defaultRequiredRule],
  sort: [defaultRequiredRule]
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
  updateForm
} = useForm(
  form =>
    (form.id ? Apis.YouCert.Update : Apis.YouCert.Add)({
      data: form,
      transform: res => {
        updateForm(res.data as unknown as FormType);
        window.$message?.success($t('common.updateSuccess'));
        emit('reload', form);
      }
    }),
  {
    immediate: false,
    resetAfterSubmiting: true,
    initialForm: {
      id: '',
      createBy: null,
      createTime: '',
      updateBy: null,
      updateTime: '',
      isDeleted: false,
      name: null,
      description: null,
      url: null,
      icon: null,
      group: null,
      sort: 0,
      isAudit: null,
      isImages: null,
      isCode: null,
      score: 0
    } as unknown as FormType,
    async middleware(ctx, next) {
      validate().then(async () => {
        await next();
        ctx.proxyStates.loading.v = false;
      });
    }
  }
);

/** 获取详情 */
const { send: getInfo } = useRequest(
  id =>
    Apis.YouCert.GetInfo({
      params: { id },
      transform: res => {
        const data = res.data as unknown as FormType;
        updateForm(data);
      }
    }),
  { force: true, immediate: false }
);

const title = computed(() => {
  return formData.value.id ? $t('common.edit') : $t('common.add');
});

// 处理布尔值的 null 值问题
const isAuditComputed = computed({
  get: () => formData.value.isAudit ?? false,
  set: (value: boolean) => {
    formData.value.isAudit = value;
  }
});

const isImagesComputed = computed({
  get: () => formData.value.isImages ?? false,
  set: (value: boolean) => {
    formData.value.isImages = value;
  }
});

const isCodeComputed = computed({
  get: () => formData.value.isCode ?? false,
  set: (value: boolean) => {
    formData.value.isCode = value;
  }
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
    <ElScrollbar class="h-500px pr-20px">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="120">
        <ElRow :gutter="20">
          <!-- 基本信息 -->
          <ElCol :span="24">
            <div class="mb-12px mt-8px text-16px font-bold">基本信息</div>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="名称" prop="name">
              <ElInput v-model="formData.name" :placeholder="$t('common.placeholder') + '名称'" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分组" prop="group">
              <ElInput v-model="formData.group" :placeholder="$t('common.placeholder') + '分组'" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="排序" prop="sort">
              <ElInputNumber
                v-model="formData.sort"
                :placeholder="$t('common.placeholder') + '排序'"
                class="w-full"
                :min="0"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分数" prop="score">
              <ElInputNumber
                v-model="formData.score"
                :placeholder="$t('common.placeholder') + '分数'"
                class="w-full"
                :min="0"
                :precision="2"
              />
            </ElFormItem>
          </ElCol>

          <!-- 链接信息 -->
          <ElCol :span="24">
            <div class="mb-12px mt-8px text-16px font-bold">链接信息</div>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="链接" prop="url">
              <ElInput v-model="formData.url" :placeholder="$t('common.placeholder') + '链接地址'" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="图标" prop="icon">
              <ElInput v-model="formData.icon" :placeholder="$t('common.placeholder') + '图标地址'" />
            </ElFormItem>
          </ElCol>

          <!-- 设置 -->
          <ElCol :span="24">
            <div class="mb-12px mt-8px text-16px font-bold">设置</div>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否审核" prop="isAudit">
              <ElSwitch v-model="isAuditComputed" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否上传附件" prop="isImages">
              <ElSwitch v-model="isImagesComputed" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="是否需要编码" prop="isCode">
              <ElSwitch v-model="isCodeComputed" />
            </ElFormItem>
          </ElCol>

          <!-- 描述 -->
          <ElCol :span="24">
            <div class="mb-12px mt-8px text-16px font-bold">描述</div>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="描述" prop="description">
              <ElInput
                v-model="formData.description"
                type="textarea"
                :rows="4"
                :placeholder="$t('common.placeholder') + '描述'"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
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
