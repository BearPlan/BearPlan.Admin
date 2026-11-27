<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { DataScopeType, UpdateRoleParam } from '@/api/globals';
import { VersionEnum } from '@/api/apiEnums';
import { VersionDisplay } from '@/api/apiEnumsDisplay';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { getEnumValue } from '@/utils/common';
import { $t } from '@/locales';
defineOptions({
  name: 'RoleEditForm'
});
type FormType = UpdateRoleParam;

// 数据范围选项（与列表页显示映射一致，后端枚举无前端运行时副本）
const dataScopes: Array<{ value: DataScopeType; label: string }> = [
  { value: 0, label: '无' },
  { value: 1, label: '全部' },
  { value: 2, label: '本人' },
  { value: 3, label: '本部门' },
  { value: 4, label: '本部门及以下' },
  { value: 5, label: '自定义' }
];

// 权限作用范围选项（端集合，与权限配置页端选项同源）
const versionOptions = getEnumValue(VersionEnum);

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
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
    (form.id ? Apis.Role.Update : Apis.Role.Add)({
      data: {
        ...form,
        // VersionString 为后端落库真身（Newtonsoft 对 List 计算属性填充不回写），
        // 提交时把选中的端数组同步为 JSON 字符串
        versionString: JSON.stringify(form.versions ?? [])
      },
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
      name: '',
      authCode: '',
      level: 0,
      dataScopeType: 0,
      versions: [],
      description: ''
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
    Apis.Role.GetInfo({
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
      <ElFormItem label="角色名称" prop="name">
        <ElInput v-model="formData.name" :placeholder="$t('common.placeholder') + '角色名称'" />
      </ElFormItem>

      <ElFormItem label="角色级别" prop="level">
        <ElInputNumber v-model="formData.level" class="w-full" :placeholder="$t('common.placeholder') + '角色级别'" />
      </ElFormItem>

      <ElFormItem label="数据范围" prop="dataScopeType">
        <ElSelect v-model="formData.dataScopeType">
          <ElOption v-for="(item, index) in dataScopes" :key="index" :value="item.value" :label="item.label" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="端范围" prop="versions">
        <ElSelect
          v-model="formData.versions"
          class="w-full"
          multiple
          clearable
          placeholder="选择角色可访问的端，留空表示未配置"
        >
          <ElOption
            v-for="(item, index) in versionOptions"
            :key="index"
            :value="item"
            :label="VersionDisplay[item as VersionEnum]"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="授权码" prop="authCode">
        <ElInput v-model="formData.authCode" :placeholder="$t('common.placeholder') + '授权码'" />
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput v-model="formData.description" type="textarea" :placeholder="$t('common.placeholder') + '描述'" />
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
