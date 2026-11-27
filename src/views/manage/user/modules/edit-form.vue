<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { UploadRawFile } from 'element-plus';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateUserParam } from '@/api/globals';
import { SexEnum } from '@/api/apiEnums';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { getBackendOrigin, getReadFilePath, toBackendUrl } from '@/utils/file';
import { localStg } from '@/utils/storage';
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

// 上传成功后仅暂存记录 id，不写入表单 Avatar；预览经 Read 流接口，落库统一在表单提交时
const avatarRecordId = ref('');

/** 提交详情：新增密码由后端统一设置默认值，前端不收集 */
const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  updateForm,
  loading: subLoading
} = useForm(
  form => {
    // 统一提交：上传暂存的记录 id 此刻才写入 Avatar（存相对 Read 流地址，不把环境 origin 固化进库）
    if (avatarRecordId.value) {
      form.avatar = `/api/FileRecord/Read/${avatarRecordId.value}`;
    }
    return (form.id ? Apis.User.Update : Apis.User.Add)({
      data: form,
      transform: _ => {
        window.$message?.success($t('common.updateSuccess'));
        visible.value = false;
        emit('reload', form);
      }
    });
  },
  {
    immediate: false,
    resetAfterSubmiting: true,
    initialForm: {
      id: 0,
      userName: '',
      nickName: '',
      signature: '',
      avatar: '',
      phone: '',
      email: '',
      sex: SexEnum.Man,
      deptId: '',
      roleIds: [],
      jobIds: [],
      enabled: true
    } as unknown as FormType,
    async middleware(_, next) {
      // 校验通过才发起提交；promise 链必须 await 透传给 alova，请求无论成败它都会自动复位 loading
      await validate();
      await next();
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

/** el-upload 直传：action 用后端真实地址（dev 代理下相对 /api 不通），鉴权与版本头对齐 alova 出站契约 */
const uploadAction = `${getBackendOrigin()}/api/FileRecord/Upload`;
const uploadHeaders = {
  Authorization: localStg.get('token') || '',
  'api-version': '1.0'
};

// 预览地址：新上传走 Read 流地址；已有 Avatar 为相对路径，拼 origin（dev 代理下相对路径无法直连）
const avatarSrc = computed(() => {
  if (avatarRecordId.value) {
    return getReadFilePath(avatarRecordId.value);
  }
  return toBackendUrl(formData.value.avatar);
});

/** EP avatar-uploader 标准前置校验：类型/大小不符返回 false 中止上传（与后端头像规则一致） */
const beforeAvatarUpload = (rawFile: UploadRawFile) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(rawFile.type)) {
    window.$message?.error('仅支持 jpg / png / gif 格式图片');
    return false;
  }
  if (rawFile.size > 5 * 1024 * 1024) {
    window.$message?.error('图片大小不能超过 5MB');
    return false;
  }
  return true;
};

/** 上传成功仅暂存记录 id 供预览，Avatar 统一在表单提交时写入（响应为 { code, data, msg, success } 包装） */
const handleAvatarSuccess = (response: { success: boolean; data?: string; msg?: string }) => {
  if (response.success && response.data) {
    avatarRecordId.value = response.data;
  } else {
    window.$message?.error(response.msg || '上传失败');
  }
};

/** 直传不经 alova 拦截器，HTTP 级失败（401/500 等）在此兜底提示 */
const handleAvatarError = () => {
  window.$message?.error('上传失败');
};

/** 移除头像：清掉暂存上传与已存值，提交即保存为空 */
const handleAvatarRemove = () => {
  avatarRecordId.value = '';
  formData.value.avatar = '';
};

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
  <ElDialog v-model="visible" :title="title" preset="card" class="w-800px" @close="closeForm">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
      <ElFormItem label="头像" prop="avatar">
        <div class="flex items-center gap-12px">
          <ElUpload
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif"
            :action="uploadAction"
            :data="{ scene: 'avatar' }"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="avatarSrc" :src="avatarSrc" class="avatar" />
            <ElIcon v-else class="avatar-uploader-icon"><icon-ic-round-plus /></ElIcon>
          </ElUpload>
          <ElButton v-if="avatarSrc" size="small" @click="handleAvatarRemove">移除</ElButton>
        </div>
      </ElFormItem>

      <ElFormItem label="用户名" prop="userName">
        <ElInput v-model="formData.userName" :placeholder="$t('common.placeholder') + '用户名'" />
      </ElFormItem>

      <ElFormItem label="昵称" prop="nickName">
        <ElInput v-model="formData.nickName" :placeholder="$t('common.placeholder') + '昵称'" />
      </ElFormItem>

      <ElFormItem label="个性签名" prop="signature">
        <ElInput
          v-model="formData.signature"
          type="textarea"
          :rows="3"
          :placeholder="$t('common.placeholder') + '个性签名'"
        />
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
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.close') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped>
/* EP avatar-uploader 官方样式，尺寸 80px 适配表单；图标色走语义变量随深色主题切换 */
/* .el-upload 在 ElUpload 内部（scoped 属性选不中），须经 :deep() 穿透 */
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: var(--el-text-color-placeholder);
  width: 80px;
  height: 80px;
  text-align: center;
}

.avatar {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: cover;
}
</style>
