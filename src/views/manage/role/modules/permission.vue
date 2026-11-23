<script setup lang="tsx">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { RolePermissionParam } from '@/api/globals';
import { VersionEnum } from '@/api/apiEnums';
import { VersionDisplay } from '@/api/apiEnumsDisplay';
import { getEnumValue } from '@/utils/common';
import { $t } from '@/locales';
import MenuTree from './menu-tree.vue';
import ApisTree from './apis-tree.vue';
import PermissionOverview from './permission-overview.vue';
defineOptions({
  name: 'PermissionRef'
});

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});
const currentRoleName = ref<string>('');

type FormType = RolePermissionParam;

const title = computed(() => {
  return `角色权限配置${currentRoleName.value ? ` - ${currentRoleName.value}` : ''}`;
});
// 活动标签页
const activeName = ref('overview');

// 树组件引用
const menuTreeRef = ref();
/** 提交权限设置 */
const {
  send: handleSubmit,
  updateForm,
  form: formData,
  reset: resetFrom
} = useForm(
  form => {
    return Apis.Role.SetApis({
      data: form,
      transform: () => {
        ElMessage.success($t('common.updateSuccess'));
        visible.value = false;
      }
    });
  },
  {
    immediate: false,
    resetAfterSubmiting: true,
    initialForm: {} as FormType
  }
);
/** 获取角色权限数据 */
const { send: getData, loading } = useRequest(
  roleId =>
    Apis.Role.GetApis({
      params: { roleId },
      transform: res => {
        menuTreeRef.value.setCheckedKeys(res.data.menuIds);
        updateForm(res.data);
      }
    }),
  {
    force: true,
    immediate: false
  }
);

// 获取所有API树数据
const {
  data: allApiData,
  loading: apiDataLoading,
  send: refreshApiData
} = useRequest(
  () =>
    Apis.Apis.TreeSelect({
      transform: res => {
        // 返回的是Dictionary结构，包含所有版本的API数据
        return res.data || {};
      }
    }),
  {
    force: true,
    immediate: true
  }
);

const { loading: loadingRefreshApis, send: refreshApis } = useRequest(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  () =>
    Apis.Apis.Refresh({
      transform: res => {
        window.$message?.success('操作成功！');
        refreshApiData();
        return res;
      }
    }),
  {
    force: true,
    immediate: false
  }
);

// 打开权限配置对话框
const openForm = async (id?: string | null, roleName?: string) => {
  if (!id) {
    ElMessage.warning('请选择要配置权限的角色');
    return;
  }
  currentRoleName.value = roleName || '';
  visible.value = true;
  await getData(id);
};

// 关闭对话框
const closeForm = () => {
  visible.value = false;
  resetFrom();
};

defineExpose({
  openForm
});
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="90%"
    max-width="1400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="closeForm"
  >
    <div v-loading="loading && apiDataLoading && loadingRefreshApis" class="permission-content">
      <!-- 权限统计概览 -->
      <div class="permission-stats mb-4">
        <div class="flex items-center justify-between rounded-lg bg-[var(--el-fill-color-light)] p-4">
          <div class="flex items-center gap-4">
            <div class="stat-item">
              <span class="text-sm text-[var(--el-text-color-regular)]">菜单权限:</span>
              <span class="text-blue-600 font-semibold">{{ formData.menuIds?.length }}</span>
            </div>
            <div v-for="(version, index) in getEnumValue(VersionEnum)" :key="index" class="stat-item">
              <span class="text-sm text-[var(--el-text-color-regular)]">
                {{ VersionDisplay[version as VersionEnum]  }}API:
              </span>
              <span class="text-blue-600 font-semibold">
                {{  formData.apiIds? formData.apiIds[version as VersionEnum]?.length :0}}
              </span>
            </div>
          </div>
          <ElButton type="primary" @click="refreshApis">
            <icon-mdi-refresh class="text-icon" />
            更新API
          </ElButton>
        </div>
      </div>
      <!-- 权限配置标签页 -->
      <ElTabs v-model="activeName" class="permission-tabs">
        <!-- 权限概览 -->
        <ElTabPane name="overview">
          <template #label>
            <div class="flex items-center gap-2">
              <i class="i-carbon-dashboard" />
              <span>权限概览</span>
            </div>
          </template>
          <div class="overview-container">
            <PermissionOverview :permission="formData" :role-name="currentRoleName" />
          </div>
        </ElTabPane>
        <!-- 菜单权限 -->
        <ElTabPane name="menu">
          <template #label>
            <div class="flex items-center gap-2">
              <i class="i-carbon-menu" />
              <span>菜单权限</span>
              <ElBadge :value="formData.menuIds?.length || 0" type="primary" class="ml-1" />
            </div>
          </template>
          <div class="tree-container">
            <MenuTree ref="menuTreeRef" v-model="formData.menuIds" />
          </div>
        </ElTabPane>
        <!-- 动态API版本标签页 -->
        <ElTabPane v-for="(version, index) in getEnumValue(VersionEnum)" :key="index" :name="version.toString()">
          <template #label>
            <div class="flex items-center gap-2">
              <span>{{ VersionDisplay[version as VersionEnum] }}API</span>
              <ElBadge :value="formData.apiIds ? formData.apiIds[version]?.length : 0" type="primary" class="ml-1" />
            </div>
          </template>
          <div v-if="activeName === version.toString()" class="tree-container">
            <ApisTree
              v-model="formData.apiIds"
              :version="version"
              :data="allApiData[version]"
              :loading="apiDataLoading"
            />
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped>
.permission-content {
  min-height: 600px;
}

.permission-stats {
  border-bottom: 1px solid var(--el-border-color-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.permission-tabs {
  height: 100%;
}

.permission-tabs :deep(.el-tabs__content) {
  height: calc(100% - 40px);
}

.tree-container {
  height: 500px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 16px;
  background: var(--el-bg-color-page);
}

.tree-container :deep(.el-tree) {
  background: transparent;
}

.tree-container :deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 4px;
}

.tree-container :deep(.el-tree-node__content:hover) {
  background-color: var(--el-color-primary-light-9);
}

/* 标签页徽章样式 */
:deep(.el-badge__content) {
  border: none;
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  min-width: 16px;
  padding: 0 4px;
}

/* 概览容器样式 */
.overview-container {
  height: 500px;
  overflow-y: auto;
  padding: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .permission-content {
    min-height: 400px;
  }

  .permission-stats {
    margin-bottom: 16px;
  }

  .stat-item {
    padding: 6px 8px;
    font-size: 12px;
  }

  .tree-container {
    height: 400px;
  }

  .overview-container {
    height: 400px;
  }
}

/* 加载状态样式 */
:deep(.el-loading-mask) {
  border-radius: 6px;
}

/* 标签页激活状态 */
:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}

/* 权限统计样式优化 */
.permission-stats .stat-item {
  transition: all 0.3s ease;
}

.permission-stats .stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
