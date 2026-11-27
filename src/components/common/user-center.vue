<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadRawFile } from 'element-plus';
import { ElAvatar, ElButton, ElInput, ElRadio, ElRadioGroup, ElScrollbar, ElTag } from 'element-plus';
import Apis from '@/api';
import type { UpdateUserCenterParam, UserInfo } from '@/api/globals';
import { SexEnum } from '@/api/apiEnums';
import { useRequest } from '~/packages/alova/src/client';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { getBackendOrigin, toBackendUrl } from '@/utils/file';
import { localStg } from '@/utils/storage';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'UserCenter' });

// visible 经 open 内部控制：父组件（右上角下拉）只调 open，无需传 v-model
const visible = defineModel<boolean>('visible', {
  default: false
});

const authStore = useAuthStore();

const { formRef, validate, restoreValidation } = useCommonForm();
const { defaultRequiredRule } = useFormRules();

const rules = {
  nickName: defaultRequiredRule
};

// 当前登录用户详情（打开时按 store 中的用户 id 拉最新，避免展示陈旧值）
const info = ref<UserInfo>();

/** 获取详情 */
const { send: getInfo, loading: infoLoading } = useRequest(
  (id: string) =>
    Apis.User.GetInfo({
      params: { id },
      transform: res => {
        info.value = res.data;
        return res.data;
      }
    }),
  { force: true, immediate: false }
);

/** 保存个人中心信息：整表提交 UpdateCenter，成功后刷新本地 GetInfo 同步全局展示 */
const { send: updateCenter, loading: updateCenterLoading } = useRequest(
  (data: UpdateUserCenterParam) =>
    Apis.User.UpdateCenter({
      data,
      transform: async () => {
        window.$message?.success('保存成功');
        await authStore.refreshUserInfo();
        // 重拉详情回填，展示后端落库后的最终值
        await getInfo(String(authStore.userInfo.user.id || ''));
        return true;
      }
    }),
  { force: true, immediate: false }
);

/** 保存：校验通过后整表提交 */
const handleSave = () => {
  validate().then(() => {
    if (!info.value) {
      return;
    }
    updateCenter({
      nickName: info.value.nickName ?? '',
      signature: info.value.signature ?? '',
      sex: info.value.sex,
      phone: info.value.phone ?? '',
      email: info.value.email ?? ''
    });
  });
};

/** 取消：还原为已保存值（重新拉取详情） */
const handleCancel = () => {
  restoreValidation();
  const id = String(authStore.userInfo.user.id || '');
  if (id) {
    getInfo(id);
  }
};

// ==================== 头像上传 ====================
/** el-upload 直传：action 用后端真实地址（dev 代理下相对 /api 不通），鉴权与版本头对齐 alova 出站契约 */
const uploadAction = `${getBackendOrigin()}/api/Upload/Avatar`;
const uploadHeaders = {
  Authorization: localStg.get('token') || '',
  'api-version': '1.0'
};

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

/** 上传成功后刷新 GetInfo（后端已落库并清理旧文件，响应为 { code, data, msg, success } 包装） */
const handleAvatarSuccess = async (response: { success: boolean; data?: string; msg?: string }) => {
  if (response.success && response.data) {
    if (info.value) {
      info.value.avatar = response.data;
    }
    window.$message?.success('头像已更新');
    await authStore.refreshUserInfo();
  } else {
    window.$message?.error(response.msg || '上传失败');
  }
};

/** 直传不经 alova 拦截器，HTTP 级失败（401/500 等）在此兜底提示 */
const handleAvatarError = () => {
  window.$message?.error('上传失败');
};

const loading = computed<boolean>(() => infoLoading.value || updateCenterLoading.value);

/** 打开弹窗并拉取最新用户信息 */
const open = () => {
  visible.value = true;
  const id = String(authStore.userInfo.user.id || '');
  if (id) {
    getInfo(id);
  }
};

defineExpose({
  open
});
</script>

<template>
  <ElDialog v-model="visible" title="个人中心" preset="card" class="w-820px">
    <div class="flex gap-24px">
      <!-- 左侧：头像与身份信息 -->
      <div class="w-200px shrink-0 flex flex-col items-center gap-12px py-8px">
        <ElUpload
          class="avatar-uploader"
          accept=".jpg,.jpeg,.png,.gif"
          :action="uploadAction"
          name="avatar"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :on-error="handleAvatarError"
          :before-upload="beforeAvatarUpload"
        >
          <ElAvatar :size="96" :src="toBackendUrl(info?.avatar || '')">
            {{ info?.nickName?.charAt(0) || info?.userName?.charAt(0) || '—' }}
          </ElAvatar>
        </ElUpload>

        <div class="text-18px font-medium">{{ info?.nickName || info?.userName || '—' }}</div>
        <div class="text-14px text-gray-400">@{{ info?.userName || '—' }}</div>

        <ElTag v-if="info?.signature" type="info" class="max-w-full">
          <span class="truncate">{{ info.signature }}</span>
        </ElTag>

        <div class="w-full text-left">
          <div class="mb-4px text-14px text-gray-400">所属部门</div>
          <div>{{ info?.dept?.name || '—' }}</div>
        </div>

        <div v-if="info?.roles?.length" class="w-full text-left">
          <div class="mb-4px text-14px text-gray-400">角色</div>
          <div class="flex flex-wrap gap-4px">
            <ElTag v-for="(item, index) in info.roles" :key="index" size="small">{{ item.name }}</ElTag>
          </div>
        </div>
      </div>

      <!-- 右侧：整表编辑，底部统一保存/取消 -->
      <div class="flex min-h-360px flex-1 flex-col">
        <ElScrollbar class="flex-1 pr-8px">
          <ElForm
            v-if="info"
            ref="formRef"
            v-loading="loading"
            :model="info"
            :rules="rules"
            label-placement="left"
            :label-width="90"
          >
            <ElFormItem label="用户名">
              <!-- 用户名为登录账号，不允许修改 -->
              <ElInput :model-value="info.userName || ''" disabled />
            </ElFormItem>

            <ElFormItem label="昵称" prop="nickName">
              <ElInput v-model="info.nickName" placeholder="请输入昵称" />
            </ElFormItem>

            <ElFormItem label="个性签名">
              <ElInput v-model="info.signature" type="textarea" :rows="3" placeholder="请输入个性签名" />
            </ElFormItem>

            <ElFormItem label="性别">
              <ElRadioGroup v-model="info.sex">
                <ElRadio :value="SexEnum.Man" label="男" />
                <ElRadio :value="SexEnum.Girl" label="女" />
              </ElRadioGroup>
            </ElFormItem>

            <ElFormItem label="手机号">
              <ElInput v-model="info.phone" placeholder="请输入手机号" />
            </ElFormItem>

            <ElFormItem label="邮箱">
              <ElInput v-model="info.email" placeholder="请输入邮箱" />
            </ElFormItem>
          </ElForm>
        </ElScrollbar>

        <div class="mt-12px flex shrink-0 justify-end gap-8px">
          <ElButton :disabled="loading" @click="handleCancel">取消</ElButton>
          <ElButton type="primary" :loading="loading" @click="handleSave">保存</ElButton>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<style scoped>
/* EP avatar-uploader 官方样式：圆形头像 96px，hover 提示可换；ElUpload 内部节点须 :deep() 穿透 */
.avatar-uploader :deep(.el-upload) {
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
  box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
}
</style>
