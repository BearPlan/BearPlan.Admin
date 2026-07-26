<script setup lang="tsx">
import { ref } from 'vue';
import { ElButton, ElCard, ElCol, ElInput, ElRow, ElTree } from 'element-plus';
import Apis from '@/api';
import type { DeptDTO } from '@/api/globals';
import DynamicList from '@/views/configprovider/table/dynamic-list.vue';
import { useRequest } from '~/packages/alova/src/client';

// 搜索关键词
const searchKeyword = ref('');
// 当前选中的部门ID
const selectedDeptId = ref<string | null>(null);

const { send: getDeptTree, data: deptTree } = useRequest(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  (keyWord: string = '') =>
    Apis.Dept.GetTree({
      params: {
        KeyWord: keyWord
      },
      transform: res => {
        return res.data;
      }
    }),
  {
    force: true,
    immediate: true
  }
);

// 树组件引用
const treeRef = ref();
const listRef = ref();

// 打开编辑/新增
const editFormRef = ref();
const openForm = (id: string | null) => {
  editFormRef.value?.openForm(id);
};

// 树节点点击处理
const handleNodeClick = (data: DeptDTO) => {
  // 切换选中状态
  if (selectedDeptId.value === data.id) {
    // 如果点击的是已选中的节点，则取消选择
    selectedDeptId.value = null;
    listRef.value?.reload();
  } else {
    // 选择新的部门
    selectedDeptId.value = data.id;
    listRef.value?.reload();
  }
};

// 搜索部门
const handleSearch = () => {
  getDeptTree(searchKeyword.value);
};

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = '';
  getDeptTree('');
};

// 展开/收起所有节点
const expandAll = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = true;
    });
  }
};

const collapseAll = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = false;
    });
  }
};

const reload = () => {
  listRef.value?.reload();
};
</script>

<template>
  <div class="h-screen overflow-hidden">
    <ElRow class="h-full">
      <ElCol :span="4" class="h-full">
        <ElCard class="h-full flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">部门</span>
              <div class="flex gap-2">
                <ElButton size="small" @click="expandAll">展开</ElButton>
                <ElButton size="small" @click="collapseAll">收起</ElButton>
              </div>
            </div>
          </template>

          <!-- 搜索框 -->
          <div class="mb-4 shrink-0">
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索部门名称"
              clearable
              @keyup.enter="handleSearch"
              @clear="clearSearch"
            >
              <template #append>
                <ElButton @click="handleSearch">
                  <icon-ant-design-search-outlined />
                </ElButton>
              </template>
            </ElInput>
          </div>

          <!-- 部门树 -->
          <div class="min-h-0 flex-1 overflow-auto">
            <ElTree
              ref="treeRef"
              node-key="id"
              :data="deptTree"
              :default-expand-all="true"
              :props="{ label: 'name', children: 'children' }"
              :expand-on-click-node="false"
              class="dept-tree"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="w-full flex items-center justify-between">
                  <span
                    class="flex-1 truncate"
                    :title="data.name"
                    :class="{
                      'text-primary font-medium': selectedDeptId === data.id
                    }"
                  >
                    {{ data.name }}
                  </span>
                  <span v-if="data.users?.length" class="ml-2 text-xs text-gray-400">({{ data.users.length }})</span>
                </div>
              </template>
            </ElTree>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="20" class="h-full">
        <DynamicList
          ref="listRef"
          tableof="UserDTO"
          router=""
          config-id=""
          page-url="/api/User/GetPage"
          add-url="/api/User/Add"
          del-url="/api/User/Delete"
          :params="{ DeptId: selectedDeptId }"
        ></DynamicList>
      </ElCol>
    </ElRow>
  </div>
</template>

<style scoped>
.dept-tree :deep(.el-tree-node__content) {
  height: 36px;
  line-height: 36px;
  cursor: pointer;
}

.dept-tree :deep(.el-tree-node__content:hover) {
  background-color: var(--el-color-primary-light-9);
}

.dept-tree :deep(.el-tree-node__expand-icon) {
  color: var(--el-color-primary);
}

.dept-tree :deep(.el-tree-node__label) {
  font-size: 14px;
}

.text-primary {
  color: var(--el-color-primary) !important;
}

/* Ensure proper height inheritance for full viewport usage */
.h-screen {
  height: 100vh;
}

.h-full {
  height: 100%;
}

/* Ensure ElCard takes full remaining height */
:deep(.el-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__header) {
  flex-shrink: 0;
}

:deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Ensure ElRow and ElCol use full height */
:deep(.el-row) {
  height: 100%;
}

:deep(.el-col) {
  height: 100%;
}
</style>
