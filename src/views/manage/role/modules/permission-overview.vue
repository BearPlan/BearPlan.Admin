<script setup lang="tsx">
import { computed } from 'vue';
import type { RolePermissionParam } from '@/api/globals';
import { VersionEnum } from '@/api/apiEnums';
import { VersionDisplay } from '@/api/apiEnumsDisplay';

defineOptions({
  name: 'PermissionOverview'
});

interface Props {
  permission: RolePermissionParam;
  roleName?: string;
}

const { permission, roleName } = defineProps<Props>();

// 权限统计
const permissionStats = computed(() => {
  const apiIds = permission.apiIds || {};
  return {
    menu: permission.menuIds?.length || 0,
    pc: apiIds[VersionEnum.Pc.toString()]?.length || 0,
    app: apiIds[VersionEnum.App.toString()]?.length || 0,
    def: apiIds[VersionEnum.Def.toString()]?.length || 0,
    site: apiIds[VersionEnum.Site.toString()]?.length || 0
  };
});

// 总权限数
const totalPermissions = computed(() => {
  return Object.values(permissionStats.value).reduce((sum, count) => sum + count, 0);
});

// 权限分布数据（用于图表）
const chartData = computed(() => {
  const stats = permissionStats.value;
  return [
    { name: '菜单权限', value: stats.menu, color: '#409EFF' },
    { name: `${VersionDisplay[VersionEnum.Pc]}API`, value: stats.pc, color: '#67C23A' },
    { name: `${VersionDisplay[VersionEnum.App]}API`, value: stats.app, color: '#E6A23C' },
    { name: `${VersionDisplay[VersionEnum.Def]}API`, value: stats.def, color: '#F56C6C' },
    { name: `${VersionDisplay[VersionEnum.Site]}API`, value: stats.site, color: '#909399' }
  ].filter(item => item.value > 0);
});

// 权限密度（权限分布的百分比）
const permissionDensity = computed(() => {
  const total = totalPermissions.value;
  if (total === 0) return [];

  return chartData.value.map(item => ({
    ...item,
    percentage: Math.round((item.value / total) * 100)
  }));
});
</script>

<template>
  <div class="permission-overview">
    <!-- 角色信息 -->
    <div class="role-info mb-4">
      <div class="flex items-center gap-3">
        <i class="i-carbon-user-role text-2xl text-blue-500" />
        <div>
          <h3 class="text-lg text-[var(--el-text-color-primary)] font-semibold">{{ roleName || '未知角色' }}</h3>
          <p class="text-sm text-[var(--el-text-color-secondary)]">权限配置概览</p>
        </div>
      </div>
    </div>

    <!-- 权限统计卡片 -->
    <div class="stats-grid mb-6">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="i-carbon-security" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalPermissions }}</div>
          <div class="stat-label">总权限数</div>
        </div>
      </div>

      <div class="stat-card menu">
        <div class="stat-icon">
          <i class="i-carbon-menu" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ permissionStats.menu }}</div>
          <div class="stat-label">菜单权限</div>
        </div>
      </div>

      <div class="stat-card api">
        <div class="stat-icon">
          <i class="i-carbon-api" />
        </div>
        <div class="stat-content">
          <div class="stat-number">
            {{ permissionStats.pc + permissionStats.app + permissionStats.def + permissionStats.site }}
          </div>
          <div class="stat-label">API权限</div>
        </div>
      </div>
    </div>

    <!-- 权限分布 -->
    <div class="permission-distribution">
      <h4 class="section-title">权限分布</h4>

      <div v-if="totalPermissions === 0" class="empty-state">
        <ElEmpty description="暂无权限配置" :image-size="80" />
      </div>

      <div v-else class="distribution-content">
        <!-- 权限条形图 -->
        <div class="permission-bars mb-4">
          <div v-for="item in permissionDensity" :key="item.name" class="permission-bar">
            <div class="bar-info">
              <span class="bar-label">{{ item.name }}</span>
              <span class="bar-value">{{ item.value }} ({{ item.percentage }}%)</span>
            </div>
            <div class="bar-container">
              <div
                class="bar-fill"
                :style="{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color
                }"
              />
            </div>
          </div>
        </div>

        <!-- API版本详情 -->
        <div class="api-details">
          <h5 class="detail-title">API版本详情</h5>
          <div class="api-version-list">
            <div
              v-for="version in [VersionEnum.Pc, VersionEnum.App, VersionEnum.Def, VersionEnum.Site]"
              :key="version"
              class="api-version-item"
              :class="{
                'has-permission': (permission.apiIds?.[version.toString()] || []).length > 0
              }"
            >
              <div class="version-info">
                <i class="i-carbon-api version-icon" />
                <span class="version-name">{{ VersionDisplay[version] }}</span>
              </div>
              <div class="version-count">
                {{ (permission.apiIds?.[version.toString()] || []).length }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.permission-overview {
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.role-info {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  background: linear-gradient(135deg, var(--el-bg-color) 0%, var(--el-bg-color-page) 100%);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.total {
  border-color: var(--el-color-primary-light-7);
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
}

.stat-card.menu {
  border-color: var(--el-color-success-light-7);
  background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, var(--el-color-success-light-8) 100%);
}

.stat-card.api {
  border-color: var(--el-color-warning-light-7);
  background: linear-gradient(135deg, var(--el-color-warning-light-9) 0%, var(--el-color-warning-light-8) 100%);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon i {
  font-size: 20px;
  color: var(--el-color-primary);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.permission-bar {
  margin-bottom: 12px;
}

.bar-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bar-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.bar-value {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.bar-container {
  height: 8px;
  background: var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.detail-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.api-version-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.api-version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-page);
  transition: all 0.3s ease;
}

.api-version-item.has-permission {
  border-color: var(--el-color-success-light-7);
  background: var(--el-color-success-light-9);
}

.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-icon {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.api-version-item.has-permission .version-icon {
  color: var(--el-color-success);
}

.version-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.version-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  padding: 2px 8px;
  background: var(--el-bg-color);
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.api-version-item.has-permission .version-count {
  color: var(--el-color-success);
  background: white;
}
</style>
