<script setup lang="tsx">
import { computed, h, nextTick, ref, watch } from 'vue';
import { ElCheckbox, ElMessage } from 'element-plus';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import { MenuTypeEnum } from '@/api/apiEnums';
import type { RouteTreeSelectDTO } from '@/api/globals';
defineOptions({
  name: 'MenuTree'
});

interface Props {
  modelValue: Array<string> | null;
}

const { modelValue } = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const treeRef = ref();
const loading = ref(false);

// 搜索关键词
const searchKeyword = ref('');

// 当前选中的节点ID列表
const selectedIds = ref<string[]>([]);

// 监听外部值变化
watch(
  () => modelValue,
  newValue => {
    if (newValue && Array.isArray(newValue)) {
      selectedIds.value = [...newValue];
      // 等待树组件渲染完成后设置选中状态
      nextTick(() => {
        setTreeCheckedState(newValue);
      });
    } else {
      selectedIds.value = [];
      nextTick(() => {
        if (treeRef.value) {
          treeRef.value.setCheckedKeys([]);
        }
      });
    }
  },
  { deep: true, immediate: true }
);

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
      console.warn('设置菜单树选中状态失败:', error);
    }
  }
};

/** 获取菜单树数据 */
const { data, loading: dataLoading } = useRequest(
  () =>
    Apis.Menu.GetTree({
      data: [MenuTypeEnum.Menu, MenuTypeEnum.Directory],
      transform: res => {
        return res.data || [];
      }
    }),
  {
    force: true,
    immediate: true
  }
);

// 过滤树数据
const filteredData = computed(() => {
  if (!searchKeyword.value || !data.value) {
    return data.value || [];
  }

  const keyword = searchKeyword.value.toLowerCase().trim();
  if (!keyword) {
    return data.value;
  }

  // 递归过滤节点
  const filterNodes = (nodes: RouteTreeSelectDTO[]): RouteTreeSelectDTO[] => {
    return nodes
      .filter(node => {
        // 检查当前节点是否匹配
        const isMatch = node.title?.toLowerCase().includes(keyword);

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

  return filterNodes(data.value);
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
        console.warn('重新设置菜单树选中状态失败:', error);
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

// 获取所有节点数量
const getAllNodeCount = (nodes: RouteTreeSelectDTO[]): number => {
  let count = 0;
  if (nodes && nodes.length > 0) {
    nodes.forEach(node => {
      count++; // 当前节点
      if (node.children && node.children.length > 0) {
        count += getAllNodeCount(node.children); // 子节点
      }
    });
  }
  return count;
};

// 监听数据加载完成
watch(
  () => data.value,
  newData => {
    if (newData && selectedIds.value.length > 0) {
      nextTick(() => {
        setTreeCheckedState(selectedIds.value);
      });
    }
  }
);

// 节点选中状态变化处理
const checkChange = (data: RouteTreeSelectDTO, checked: boolean) => {
  if (!treeRef.value) return;

  try {
    const node = treeRef.value.getNode(data.id);
    if (node) {
      // 处理节点选中逻辑
      setNode(node);

      // 获取当前所有选中的节点
      const checkedKeys = treeRef.value.getCheckedKeys() || [];
      selectedIds.value = [...checkedKeys];

      // 发送更新事件
      emit('update:modelValue', checkedKeys);
    }
  } catch (error) {
    console.warn('处理菜单树节点选中状态变化失败:', error);
  }
};

// 设置节点状态（处理父子节点联动）
const setNode = (node: any) => {
  if (!node) return;

  if (node.checked) {
    // 如果当前是选中状态，则递归设置父节点选中
    setParentNode(node);
  } else {
    // 当前是取消选中，将所有子节点都取消选中
    setChildenNode(node);
  }
};

// 设置父节点选中状态
const setParentNode = (node: any) => {
  if (node.parent && node.parent.data) {
    try {
      node.parent.checked = true;
      if (treeRef.value) {
        treeRef.value.setChecked(node.parent.data.id, true, false);
      }
      setParentNode(node.parent);
    } catch (error) {
      console.warn('设置父节点状态失败:', error);
    }
  }
};

// 设置子节点选中状态
const setChildenNode = (node: any) => {
  if (node.childNodes && node.childNodes.length > 0) {
    node.childNodes.forEach((childNode: any) => {
      try {
        childNode.checked = false;
        if (treeRef.value && childNode.data) {
          treeRef.value.setChecked(childNode.data.id, false, false);
        }
        setChildenNode(childNode);
      } catch (error) {
        console.warn('设置子节点状态失败:', error);
      }
    });
  }
};

// 清空选中状态
const close = () => {
  selectedIds.value = [];
  if (treeRef.value) {
    try {
      treeRef.value.setCheckedKeys([]);
    } catch (error) {
      console.warn('清空菜单树选中状态失败:', error);
    }
  }
  emit('update:modelValue', []);
};

// 手动设置选中的key
const setCheckedKeys = (keys: string[]) => {
  selectedIds.value = [...keys];
  if (treeRef.value) {
    try {
      treeRef.value.setCheckedKeys(keys);
    } catch (error) {
      console.warn('手动设置菜单树选中状态失败:', error);
    }
  }
};

// 获取选中的keys
const getCheckedKeys = () => {
  if (treeRef.value) {
    try {
      return treeRef.value.getCheckedKeys() || [];
    } catch (error) {
      console.warn('获取菜单树选中状态失败:', error);
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
        // 全选 - 获取所有过滤后的节点ID
        const getAllIds = (nodes: RouteTreeSelectDTO[]): string[] => {
          let ids: string[] = [];
          nodes.forEach(node => {
            ids.push(node.id);
            if (node.children && node.children.length > 0) {
              ids = ids.concat(getAllIds(node.children));
            }
          });
          return ids;
        };
        const allIds = getAllIds(filteredData.value);
        selectedIds.value = allIds;
        // 设置所有节点为选中状态
        allIds.forEach(id => {
          treeRef.value.setChecked(id, true, false);
        });
      } else {
        // 取消全选
        treeRef.value.setCheckedKeys([]);
        selectedIds.value = [];
      }
      // 发送更新事件
      emit('update:modelValue', selectedIds.value);
    } catch (error) {
      console.warn('全选/取消全选失败:', error);
    }
  }
};

// 计算全选状态
const isAllSelected = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return false;
  }
  const allNodeCount = getAllNodeCount(filteredData.value);
  return allNodeCount > 0 && selectedIds.value.length === allNodeCount;
});

// 计算半选状态
const isIndeterminate = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return false;
  }
  const allNodeCount = getAllNodeCount(filteredData.value);
  return selectedIds.value.length > 0 && selectedIds.value.length < allNodeCount;
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
  <div v-loading="dataLoading" class="menu-tree-container">
    <!-- 搜索框和全选 -->
    <div class="mb-3 flex items-center justify-between gap-2">
      <ElCheckbox :indeterminate="isIndeterminate" :model-value="isAllSelected" @change="toggleSelectAll">
        全选
      </ElCheckbox>
      <div class="flex-1">
        <ElInput v-model="searchKeyword" placeholder="搜索菜单..." clearable @keyup.enter="updateSearch">
          <template #prefix>
            <i class="i-carbon-search" />
          </template>
        </ElInput>
      </div>
    </div>

    <ElTree
      ref="treeRef"
      node-key="id"
      show-checkbox
      :data="filteredData"
      :default-expand-all="true"
      :props="{ label: 'title' }"
      check-strictly
      :check-on-click-node="false"
      @check="checkChange"
    >
      <template #default="{ data }">
        <div class="flex items-center gap-2">
          <i v-if="data.menuType === MenuTypeEnum.Directory" class="i-carbon-folder text-yellow-500" />
          <i v-else class="i-carbon-document text-blue-500" />
          <span>{{ data.title }}</span>
        </div>
      </template>
    </ElTree>
  </div>
</template>

<style scoped>
.menu-tree-container {
  height: 100%;
  overflow-y: auto;
}
.menu-tree-container :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 4px;
}

.menu-tree-container :deep(.el-tree-node__content:hover) {
  background-color: var(--el-color-primary-light-9);
}

.menu-tree-container :deep(.el-checkbox) {
  margin-right: 8px;
}
</style>
