<script setup lang="ts">
import { computed, ref } from 'vue';
import { useForm } from 'alova/client';
import Apis from '@/api';
import { encrypt } from '@/utils/rsaEncrypt';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'UserEditPwd' });

// visible 经 openForm 内部控制：右上角静态挂载与列表动态挂载都只调 openForm，父组件无需传 v-model
const visible = defineModel<boolean>('visible', {
  default: false
});

const authStore = useAuthStore();

// 目标用户 id：为空即本人模式（需原密码走 UpdateMyPwd），有值为管理员模式（无须原密码走 UpdatePwd）
const targetId = ref('');

const isSelfMode = computed(() => !targetId.value);

const { formRef, validate, restoreValidation } = useCommonForm();
const { formRules, defaultRequiredRule, createConfirmPwdRule } = useFormRules();

type FormType = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  loading: subLoading
} = useForm(
  form => {
    // 密码统一 RSA 加密传输（与登录同口径），后端解密后 BCrypt 落库
    if (isSelfMode.value) {
      return Apis.User.UpdateMyPwd({
        data: {
          oldPassword: encrypt(form.oldPassword),
          newPassword: encrypt(form.newPassword),
          confirmPassword: encrypt(form.confirmPassword)
        },
        transform: async () => {
          window.$message?.success('密码修改成功，请重新登录');
          visible.value = false;
          // 改密后端已清在线缓存，当前会话强制重新登录
          await authStore.logout();
        }
      });
    }
    return Apis.User.UpdatePwd({
      data: { id: targetId.value, newPassword: encrypt(form.newPassword) },
      transform: () => {
        window.$message?.success('密码修改成功');
        visible.value = false;
      }
    });
  },
  {
    immediate: false,
    resetAfterSubmiting: true,
    initialForm: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    } as FormType,
    async middleware(_, next) {
      // 校验通过才发起提交；promise 链必须 await 透传给 alova，请求无论成败它都会自动复位 loading
      await validate();
      await next();
    }
  }
);

const rules = computed(() => ({
  oldPassword: defaultRequiredRule,
  newPassword: [
    ...formRules.pwd,
    {
      validator: (_rule: unknown, value: string) => {
        if (isSelfMode.value && value && value === formData.value.oldPassword) {
          return new Error('新密码不能与原密码相同');
        }
        return true;
      },
      trigger: ['blur', 'change']
    }
  ],
  confirmPassword: createConfirmPwdRule(computed(() => formData.value.newPassword))
}));

const title = computed(() => (isSelfMode.value ? '修改密码' : '重置密码'));

/** 打开弹窗：不传 id 为本人修改密码，传 id 为管理员重置目标用户密码 */
const openForm = (id?: string) => {
  targetId.value = id || '';
  visible.value = true;
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
  <ElDialog v-model="visible" :title="title" preset="card" class="w-460px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="90">
      <ElFormItem v-if="isSelfMode" label="原密码" prop="oldPassword">
        <ElInput v-model="formData.oldPassword" type="password" show-password placeholder="请输入原密码" />
      </ElFormItem>

      <ElFormItem label="新密码" prop="newPassword">
        <ElInput v-model="formData.newPassword" type="password" show-password placeholder="请输入新密码" />
      </ElFormItem>

      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput v-model="formData.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">关闭</ElButton>
        <ElButton type="primary" :loading="subLoading" @click="handleSubmit">确认</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
