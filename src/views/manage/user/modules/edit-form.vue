<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateUserParam } from '@/api/globals';
import { SexEnum } from '@/api/apiEnums';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
defineOptions({
  name: 'UserEditForm'
});
type FormType = UpdateUserParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  userName: defaultRequiredRule,
  deptId: defaultRequiredRule
};

interface Emits {
  (e: 'reload', row: any): any;
}
const emit = defineEmits<Emits>();

/** 提交详情：新增密码由后端统一设置默认值，前端不收集 */
const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  updateForm,
  loading: subLoading
} = useForm(
  form =>
    (form.id ? Apis.User.Update : Apis.User.Add)({
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
      userName: '',
      nickName: '',
      phone: '',
      email: '',
      sex: SexEnum.Man,
      deptId: '',
      roleIds: [],
      jobIds: [],
      enabled: true
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
/** 获取详情：roles/jobs 对象数组映射为表单提交所需的 id 集合 */
const { send: getInfo, loading: infoLoading } = useRequest(
  id =>
    Apis.User.GetInfo({
      params: { id },
      transform: res => {
        const info = res.data as unknown as FormType;
        info.roleIds = info.roles?.map(item => item.id) || [];
        info.jobIds = info.jobs?.map(item => item.id) || [];
        updateForm(info);
      }
    }),
  { force: true, immediate: false }
);
/** 部门候选树 */
const { data: deptTree } = useRequest(
  () =>
    Apis.Dept.GetTree({
      params: { KeyWord: '' },
      transform: res => {
        return res.data || [];
      }
    }),
  { force: true, immediate: true }
);
/** 角色候选 */
const { data: roleList } = useRequest(
  () =>
    Apis.Role.QueryAll({
      transform: res => {
        return res.data || [];
      }
    }),
  { force: true, immediate: true }
);
/** 岗位候选 */
const { data: jobList } = useRequest(
  () =>
    Apis.Job.QueryAll({
      transform: res => {
        return res.data || [];
      }
    }),
  { force: true, immediate: true }
);
const title = computed(() => {
  return formData.value.id ? $t('common.edit') : $t('common.add');
});
// 打开：新增时默认归属列表页左侧选中的部门（deptId），编辑时按 id 回填
const openForm = async (deptId: string | null, id?: string) => {
  visible.value = true;
  if (id) {
    await getInfo(id);
  } else if (deptId) {
    formData.value.deptId = deptId;
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
        <ElFormItem label="用户名" prop="userName">
          <ElInput v-model="formData.userName" :placeholder="$t('common.placeholder') + '用户名'" />
        </ElFormItem>

        <ElFormItem label="昵称" prop="nickName">
          <ElInput v-model="formData.nickName" :placeholder="$t('common.placeholder') + '昵称'" />
        </ElFormItem>

        <ElFormItem label="所属部门" prop="deptId">
          <ElTreeSelect
            v-model="formData.deptId"
            class="w-full"
            node-key="id"
            :data="deptTree"
            :props="{ label: 'name', children: 'children' }"
            check-strictly
            default-expand-all
            :render-after-expand="false"
            :placeholder="$t('common.placeholder') + '所属部门'"
          />
        </ElFormItem>

        <ElFormItem label="性别" prop="sex">
          <ElRadioGroup v-model="formData.sex">
            <ElRadio :value="SexEnum.Man" label="男" />
            <ElRadio :value="SexEnum.Girl" label="女" />
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="手机号" prop="phone">
          <ElInput v-model="formData.phone" :placeholder="$t('common.placeholder') + '手机号'" />
        </ElFormItem>

        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="formData.email" :placeholder="$t('common.placeholder') + '邮箱'" />
        </ElFormItem>

        <ElFormItem label="角色" prop="roleIds">
          <ElSelect
            v-model="formData.roleIds"
            multiple
            clearable
            class="w-full"
            :placeholder="$t('common.placeholder') + '角色'"
          >
            <ElOption v-for="(item, index) in roleList" :key="index" :label="item.name" :value="item.id" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="岗位" prop="jobIds">
          <ElSelect
            v-model="formData.jobIds"
            multiple
            clearable
            class="w-full"
            :placeholder="$t('common.placeholder') + '岗位'"
          >
            <ElOption v-for="(item, index) in jobList" :key="index" :label="item.name" :value="item.id" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="启用状态" prop="enabled">
          <ElRadioGroup v-model="formData.enabled">
            <ElRadio :value="true" label="启用" />
            <ElRadio :value="false" label="禁用" />
          </ElRadioGroup>
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
