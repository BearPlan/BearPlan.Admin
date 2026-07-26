<script setup lang="tsx">
import { computed, nextTick, ref, watch } from 'vue';
import { ElCheckbox } from 'element-plus';
import type { VersionEnum } from '@/api/apiEnums';
import type { ApisTreeSelectDTO } from '@/api/globals';
import { VersionDisplay } from '@/api/apiEnumsDisplay';

defineOptions({
  name: 'ApisTree'
});

interface Props {
  version: VersionEnum;
  data?: ApisTreeSelectDTO[];
  loading?: boolean;
}

const { version, data, loading } = defineProps<Props>();
const modelValue = defineModel<Record<string, string[] | null> | null>('modelValue');

// 搜索关键词
const searchKeyword = ref('');

// 当前选中的API ID列表
const selectedIds = ref<string[]>([]);

// 过滤树数据
const filteredData = computed(() => {
  if (!searchKeyword.value || !data) {
    return data || [];
  }

  const keyword = searchKeyword.value.toLowerCase().trim();
  if (!keyword) {
    return data;
  }

  // 递归过滤节点
  const filterNodes = (nodes: ApisTreeSelectDTO[]): ApisTreeSelectDTO[] => {
    return nodes
      .filter(node => {
        // 检查当前节点是否匹配
        const isMatch = node.label?.toLowerCase().includes(keyword);

        // 检查子节点是否匹配
        if (node.children && node.children.length > 0) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            // 如果子节点匹配，保留当前节点
            return true;
          }
        }

        return isMatch;
      })
      .map(node => {
        // 如果有子节点，也需要过滤子节点
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: filterNodes(node.children)
          };
        }
        return node;
      });
  };

  return filterNodes(data);
});

// 监听搜索关键词变化，保持选中状态
watch(searchKeyword, () => {
  nextTick(() => {
    if (treeRef.value && selectedIds.value.length > 0) {
      try {
        // 重新设置选中状态
        selectedIds.value.forEach((id: string) => {
          treeRef.value.setChecked(id, true, false);
        });
      } catch (error) {
        console.warn(`重新设置API树选中状态失败(version: ${VersionDisplay[version]}):`, error);
      }
    }
  });
});

// 监听选中节点变化，更新全选状态
watch(
  selectedIds,
  () => {
    // 触发全选复选框状态更新
    const temp = selectedIds.value.length;
  },
  { deep: true }
);

// 手动触发搜索更新
const updateSearch = () => {
  // 触发计算属性重新计算
  const temp = searchKeyword.value;
  searchKeyword.value = temp;
};

// 设置树的选中状态
const setTreeCheckedState = (ids: string[]) => {
  if (treeRef.value && ids) {
    try {
      // 清除所有选中状态
      treeRef.value.setCheckedKeys([]);
      // 设置新的选中状态
      ids.forEach((id: string) => {
        treeRef.value.setChecked(id, true, false);
      });
    } catch (error) {
      console.warn(`设置API树选中状态失败(version: ${VersionDisplay[version]}):`, error);
    }
  }
};

// 监听数据加载完成
watch(
  () => data,
  newData => {
    if (newData && selectedIds.value.length > 0) {
      nextTick(() => {
        setTreeCheckedState(selectedIds.value);
      });
    }
  }
);

// 监听 modelValue 变化，同步 selectedIds
watch(
  () => modelValue.value?.[version],
  newIds => {
    if (newIds && Array.isArray(newIds)) {
      selectedIds.value = [...newIds];
      nextTick(() => {
        setTreeCheckedState(newIds);
      });
    }
  },
  { immediate: true }
);

const treeRef = ref();

// 节点选中状态变化处理（仅选中叶子节点）
const checkChange = (data: ApisTreeSelectDTO, checked: boolean) => {
  if (!treeRef.value) return;

  try {
    // 只获取叶子节点（没有children的节点）
    const checkedNodes = treeRef.value.getCheckedNodes() || [];
    const leafNodes = checkedNodes.filter((node: ApisTreeSelectDTO) => !node.children || node.children.length === 0);
    const leafIds = leafNodes.map((node: ApisTreeSelectDTO) => node.id);

    selectedIds.value = [...leafIds];

    // 更新 modelValue 中对应版本的数据
    if (modelValue.value) {
      modelValue.value[version] = leafIds;
    }
  } catch (error) {
    console.warn(`处理API树节点选中状态变化失败(version: ${VersionDisplay[version]}):`, error);
  }
};

// 清空选中状态
const close = () => {
  selectedIds.value = [];
  if (treeRef.value) {
    try {
      treeRef.value.setCheckedKeys([]);
    } catch (error) {
      console.warn(`清空API树选中状态失败(version: ${VersionDisplay[version]}):`, error);
    }
  }

  if (modelValue.value) {
    modelValue.value[version] = [];
  }
};

// 手动设置选中的key
const setCheckedKeys = (keys: string[]) => {
  selectedIds.value = [...keys];
  if (treeRef.value) {
    try {
      treeRef.value.setCheckedKeys(keys);
    } catch (error) {
      console.warn(`手动设置API树选中状态失败(version: ${VersionDisplay[version]}):`, error);
    }
  }
};

// 获取选中的keys
const getCheckedKeys = () => {
  if (treeRef.value) {
    try {
      const checkedNodes = treeRef.value.getCheckedNodes() || [];
      const leafNodes = checkedNodes.filter((node: ApisTreeSelectDTO) => !node.children || node.children.length === 0);
      return leafNodes.map((node: ApisTreeSelectDTO) => node.id);
    } catch (error) {
      console.warn(`获取API树选中状态失败(version: ${VersionDisplay[version]}):`, error);
      return [];
    }
  }
  return [];
};

// 全选/取消全选
const toggleSelectAll = (checked: boolean | string | number) => {
  const isChecked = Boolean(checked);
  if (treeRef.value) {
    try {
      if (isChecked) {
        // 全选 - 获取所有过滤后的叶子节点ID
        const getLeafIds = (nodes: ApisTreeSelectDTO[]): string[] => {
          let ids: string[] = [];
          nodes.forEach(node => {
            if (!node.children || node.children.length === 0) {
              // 叶子节点
              ids.push(node.id);
            } else {
              // 非叶子节点，递归处理子节点
              ids = ids.concat(getLeafIds(node.children));
            }
          });
          return ids;
        };
        const leafIds = getLeafIds(filteredData.value);
        selectedIds.value = leafIds;
        // 设置所有叶子节点为选中状态
        leafIds.forEach(id => {
          treeRef.value.setChecked(id, true, false);
        });
      } else {
        // 取消全选
        treeRef.value.setCheckedKeys([]);
        selectedIds.value = [];
      }
      // 更新 modelValue 中对应版本的数据
      if (modelValue.value) {
        modelValue.value[version] = selectedIds.value;
      }
    } catch (error) {
      console.warn(`全选/取消全选失败(version: ${VersionDisplay[version]}):`, error);
    }
  }
};

// 获取所有叶子节点数量
const getLeafNodeCount = (nodes: ApisTreeSelectDTO[]): number => {
  let count = 0;
  if (nodes && nodes.length > 0) {
    nodes.forEach(node => {
      if (!node.children || node.children.length === 0) {
        // 叶子节点
        count++;
      } else {
        // 非叶子节点，递归处理子节点
        count += getLeafNodeCount(node.children);
      }
    });
  }
  return count;
};

// 计算全选状态
const isAllSelected = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return false;
  }
  const leafNodeCount = getLeafNodeCount(filteredData.value);
  return leafNodeCount > 0 && selectedIds.value.length === leafNodeCount;
});

// 计算半选状态
const isIndeterminate = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return false;
  }
  const leafNodeCount = getLeafNodeCount(filteredData.value);
  return selectedIds.value.length > 0 && selectedIds.value.length < leafNodeCount;
});

// 暴露组件方法
defineExpose({
  close,
  setCheckedKeys,
  getCheckedKeys,
  updateSearch
});
</script>

<template>
  <div v-loading="loading" class="apis-tree-container">
    <!-- 搜索框和全选 -->
    <div class="mb-3 flex items-center justify-between gap-2">
      <ElCheckbox :indeterminate="isIndeterminate" :model-value="isAllSelected" @change="toggleSelectAll">
        全选
      </ElCheckbox>
      <div class="flex-1">
        <ElInput v-model="searchKeyword" placeholder="搜索API..." clearable @keyup.enter="updateSearch">
          <template #prefix>
            <i class="i-carbon-search" />
          </template>
        </ElInput>
      </div>
    </div>

    <div v-if="!filteredData || filteredData.length === 0" class="empty-message">
      <ElEmpty
        :description="searchKeyword ? '未找到匹配的API' : `暂无${VersionDisplay[version]}API数据`"
        :image-size="60"
      />
    </div>

    <ElTree
      v-else
      ref="treeRef"
      node-key="id"
      show-checkbox
      :data="filteredData"
      :default-expand-all="true"
      :check-on-click-node="false"
      @check="checkChange"
    >
      <template #default="{ data }">
        <div class="flex items-center gap-2">
          <i v-if="data.children && data.children.length > 0" class="i-carbon-folder-details text-orange-500" />
          <i v-else class="i-carbon-api text-green-500" />
          <span class="api-label">{{ data.label }}</span>
          <ElTag v-if="!data.children || data.children.length === 0" size="small" type="info" class="ml-2">API</ElTag>
        </div>
      </template>
    </ElTree>
  </div>
</template>

<style scoped>
.apis-tree-container {
  height: 100%;
  overflow-y: auto;
}

.apis-tree-container :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 4px;
}

.apis-tree-container :deep(.el-tree-node__content:hover) {
  background-color: var(--el-color-primary-light-9);
}

.apis-tree-container :deep(.el-checkbox) {
  margin-right: 8px;
}

.error-message,
.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.api-label {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.api-label:hover {
  color: var(--el-color-primary);
}
</style>
