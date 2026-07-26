<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useFormDesignerStore } from '@/store/modules/form-designer';
import type { ComponentDesignData } from '@/typings/form-designer';
import CodeEditor from './code-editor.vue';

defineOptions({
  name: 'EventEditor'
});

// Store
const formDesignerStore = useFormDesignerStore();

// 响应式数据
const activeCollapse = ref(['global', 'component']);
const addEventDialogVisible = ref(false);

const newEvent = ref({
  name: '',
  trigger: '',
  description: '',
  handler: ''
});

// 全局事件数据
const globalEvents = ref([
  {
    id: 'global_1',
    name: '表单提交前验证',
    trigger: 'beforeSubmit',
    handler: `function beforeSubmitHandler(formData) {
  // 表单提交前的验证逻辑
  console.log('表单数据:', formData);

  // 返回 true 继续提交，返回 false 阻止提交
  return true;
}`
  }
]);

// 全局触发条件
const globalTriggers = [
  { label: '表单初始化', value: 'formInit' },
  { label: '表单提交前', value: 'beforeSubmit' },
  { label: '表单提交后', value: 'afterSubmit' },
  { label: '表单重置', value: 'formReset' },
  { label: '数据变化', value: 'dataChange' },
  { label: '页面加载完成', value: 'pageLoaded' }
];

// 预定义动作
const predefinedActions = [
  { label: '显示消息提示', value: 'showMessage' },
  { label: '跳转页面', value: 'navigate' },
  { label: '刷新页面', value: 'reload' },
  { label: '重置表单', value: 'resetForm' },
  { label: '提交表单', value: 'submitForm' },
  { label: '保存数据', value: 'saveData' },
  { label: '删除数据', value: 'deleteData' }
];

// 组件事件映射
const componentEventMap: Record<string, Record<string, string>> = {
  ElInput: {
    input: '输入时触发',
    change: '值改变时触发',
    focus: '获得焦点时触发',
    blur: '失去焦点时触发',
    clear: '清空时触发'
  },
  ElButton: {
    click: '点击时触发'
  },
  ElSelect: {
    change: '选中值发生变化时触发',
    visibleChange: '下拉框出现/隐藏时触发',
    removeTag: '多选模式下移除tag时触发',
    clear: '可清空的单选模式下用户点击清空按钮时触发',
    blur: '当input失去焦点时触发',
    focus: '当input获得焦点时触发'
  },
  ElDatePicker: {
    change: '用户确认选定的值时触发',
    blur: '当input失去焦点时触发',
    focus: '当input获得焦点时触发'
  },
  ElSwitch: {
    change: 'switch 状态发生变化时的回调函数'
  },
  ElRadioGroup: {
    change: '绑定值变化时触发的事件'
  }
};

// 计算属性
const selectedComponent = computed(() => formDesignerStore.selectedComponent);

const componentEvents = computed(() => {
  if (!selectedComponent.value) return {};

  const events = selectedComponent.value.events || {};
  const componentType = selectedComponent.value.type;
  const availableEvents = componentEventMap[componentType] || {};

  // 合并可用事件和已配置事件
  const mergedEvents: Record<string, any> = {};

  Object.keys(availableEvents).forEach(eventName => {
    mergedEvents[eventName] = {
      enabled: Boolean(events[eventName]),
      type: events[eventName]?.type || 'custom',
      handler: events[eventName]?.handler || '',
      action: events[eventName]?.action || ''
    };
  });

  return mergedEvents;
});

// 方法
const getComponentIcon = () => {
  if (!selectedComponent.value) return 'mdi:cube-outline';

  const iconMap: Record<string, string> = {
    ElInput: 'mdi:form-textbox',
    ElButton: 'mdi:button-cursor',
    ElSelect: 'mdi:form-select',
    ElDatePicker: 'mdi:calendar',
    ElSwitch: 'mdi:toggle-switch',
    ElRadioGroup: 'mdi:radiobox-marked'
  };

  return iconMap[selectedComponent.value.type] || 'mdi:cube-outline';
};

const getEventCount = () => {
  return Object.values(componentEvents.value).filter(event => event.enabled).length;
};

const getEventDescription = (eventName: string) => {
  if (!selectedComponent.value) return '';
  const componentType = selectedComponent.value.type;
  return componentEventMap[componentType]?.[eventName] || '事件描述';
};

const updateComponentEvent = (eventName: string, updates: any) => {
  if (!selectedComponent.value) return;

  const currentEvents = selectedComponent.value.events || {};
  const updatedEvents = {
    ...currentEvents,
    [eventName]: {
      ...currentEvents[eventName],
      ...updates
    }
  };

  // 如果事件被禁用，移除该事件
  if (!updates.enabled) {
    delete updatedEvents[eventName];
  }

  // 更新组件事件
  formDesignerStore.updateComponent(selectedComponent.value.id, {
    events: updatedEvents
  });
};

const addEvent = () => {
  addEventDialogVisible.value = true;
};

const addGlobalEvent = () => {
  addEventDialogVisible.value = true;
};

const confirmAddEvent = () => {
  if (!newEvent.value.name || !newEvent.value.trigger) {
    ElMessage.error('请填写完整的事件信息');
    return;
  }

  const event = {
    id: `global_${Date.now()}`,
    name: newEvent.value.name,
    trigger: newEvent.value.trigger,
    description: newEvent.value.description,
    handler: `function ${newEvent.value.name.replace(/\s+/g, '')}Handler(event, formData) {
  // ${newEvent.value.description || '事件处理逻辑'}
  console.log('事件触发:', event);
  console.log('表单数据:', formData);
}`
  };

  globalEvents.value.push(event);

  // 重置表单
  newEvent.value = {
    name: '',
    trigger: '',
    description: '',
    handler: ''
  };

  addEventDialogVisible.value = false;
  ElMessage.success('全局事件添加成功');
};

const removeGlobalEvent = (index: number) => {
  globalEvents.value.splice(index, 1);
  ElMessage.success('全局事件删除成功');
};

// 监听组件选择变化
watch(selectedComponent, newComponent => {
  if (newComponent) {
    // 确保组件有events属性
    if (!newComponent.events) {
      formDesignerStore.updateComponent(newComponent.id, {
        events: {}
      });
    }
  }
});
</script>

<template>
  <div class="event-editor">
    <div class="editor-header">
      <h4 class="editor-title">事件配置</h4>
      <ElButton size="small" type="primary" :disabled="!selectedComponent" @click="addEvent">
        <SvgIcon icon="mdi:plus" class="mr-1" />
        添加事件
      </ElButton>
    </div>

    <div class="editor-content">
      <!-- 全局事件配置 -->
      <ElCollapse v-model="activeCollapse" class="event-collapse">
        <ElCollapseItem title="全局事件" name="global">
          <div class="global-events">
            <div v-if="globalEvents.length === 0" class="empty-state">
              <SvgIcon icon="mdi:flash-outline" class="empty-icon" />
              <span class="empty-text">暂无全局事件</span>
            </div>

            <div v-for="(event, index) in globalEvents" :key="event.id" class="event-item global-event">
              <div class="event-header">
                <SvgIcon icon="mdi:earth" class="event-type-icon global" />
                <span class="event-name">{{ event.name }}</span>
                <ElTag size="small" type="success">全局</ElTag>
                <ElButton size="small" type="danger" text @click="removeGlobalEvent(index)">
                  <SvgIcon icon="mdi:delete" />
                </ElButton>
              </div>

              <div class="event-details">
                <ElForm label-width="80px" size="small">
                  <ElFormItem label="事件名称">
                    <ElInput v-model="event.name" placeholder="请输入事件名称" />
                  </ElFormItem>

                  <ElFormItem label="触发条件">
                    <ElSelect v-model="event.trigger" placeholder="选择触发条件">
                      <ElOption
                        v-for="trigger in globalTriggers"
                        :key="trigger.value"
                        :label="trigger.label"
                        :value="trigger.value"
                      />
                    </ElSelect>
                  </ElFormItem>

                  <ElFormItem label="处理函数">
                    <CodeEditor
                      v-model="event.handler"
                      language="javascript"
                      :height="120"
                      placeholder="// 编写事件处理函数&#10;function handler(event, formData) {&#10;  // 处理逻辑&#10;}"
                    />
                  </ElFormItem>
                </ElForm>
              </div>
            </div>

            <ElButton
              v-if="globalEvents.length === 0"
              type="dashed"
              class="add-global-event-btn"
              @click="addGlobalEvent"
            >
              <SvgIcon icon="mdi:plus" class="mr-1" />
              添加全局事件
            </ElButton>
          </div>
        </ElCollapseItem>

        <!-- 组件事件配置 -->
        <ElCollapseItem title="组件事件" name="component">
          <div class="component-events">
            <div v-if="!selectedComponent" class="no-selection">
              <SvgIcon icon="mdi:cursor-default-click-outline" class="empty-icon" />
              <span class="empty-text">请先选择组件</span>
            </div>

            <div v-else-if="componentEvents.length === 0" class="empty-state">
              <SvgIcon icon="mdi:flash-outline" class="empty-icon" />
              <span class="empty-text">该组件暂无事件</span>
            </div>

            <div v-else>
              <div class="selected-component-info">
                <SvgIcon :icon="getComponentIcon()" class="component-icon" />
                <span class="component-name">{{ selectedComponent.type }}</span>
                <ElTag size="small">{{ getEventCount() }}个事件</ElTag>
              </div>

              <div v-for="(event, eventName) in componentEvents" :key="eventName" class="event-item component-event">
                <div class="event-header">
                  <SvgIcon icon="mdi:flash" class="event-type-icon component" />
                  <span class="event-name">{{ eventName }}</span>
                  <ElTag size="small" type="primary">组件</ElTag>
                  <ElSwitch
                    v-model="event.enabled"
                    size="small"
                    @change="updateComponentEvent(eventName, { enabled: event.enabled })"
                  />
                </div>

                <div v-if="event.enabled" class="event-details">
                  <ElForm label-width="80px" size="small">
                    <ElFormItem label="事件描述">
                      <span class="event-description">{{ getEventDescription(eventName) }}</span>
                    </ElFormItem>

                    <ElFormItem label="处理方式">
                      <ElRadioGroup
                        v-model="event.type"
                        @change="updateComponentEvent(eventName, { type: event.type })"
                      >
                        <ElRadio label="custom">自定义函数</ElRadio>
                        <ElRadio label="action">预定义动作</ElRadio>
                      </ElRadioGroup>
                    </ElFormItem>

                    <ElFormItem v-if="event.type === 'custom'" label="处理函数">
                      <CodeEditor
                        :model-value="event.handler"
                        language="javascript"
                        :height="120"
                        :placeholder="`// ${eventName} 事件处理函数&#10;function ${eventName}Handler(event, component, formData) {&#10;  // 处理逻辑&#10;}`"
                        @update:model-value="updateComponentEvent(eventName, { handler: $event })"
                      />
                    </ElFormItem>

                    <ElFormItem v-else label="预定义动作">
                      <ElSelect
                        :model-value="event.action"
                        placeholder="选择预定义动作"
                        @update:model-value="updateComponentEvent(eventName, { action: $event })"
                      >
                        <ElOption
                          v-for="action in predefinedActions"
                          :key="action.value"
                          :label="action.label"
                          :value="action.value"
                        />
                      </ElSelect>
                    </ElFormItem>
                  </ElForm>
                </div>
              </div>
            </div>
          </div>
        </ElCollapseItem>
      </ElCollapse>
    </div>

    <!-- 添加事件对话框 -->
    <ElDialog v-model="addEventDialogVisible" title="添加全局事件" width="500px" :close-on-click-modal="false">
      <ElForm :model="newEvent" label-width="100px">
        <ElFormItem label="事件名称" required>
          <ElInput v-model="newEvent.name" placeholder="请输入事件名称" />
        </ElFormItem>

        <ElFormItem label="触发条件" required>
          <ElSelect v-model="newEvent.trigger" placeholder="选择触发条件">
            <ElOption
              v-for="trigger in globalTriggers"
              :key="trigger.value"
              :label="trigger.label"
              :value="trigger.value"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="事件描述">
          <ElInput v-model="newEvent.description" type="textarea" :rows="2" placeholder="请输入事件描述" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <ElButton @click="addEventDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :disabled="!newEvent.name || !newEvent.trigger" @click="confirmAddEvent">
          确定
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="scss" scoped>
.event-editor {
  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .editor-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    :deep(.el-button) {
      padding: 6px 12px;
    }
  }

  .editor-content {
    .event-collapse {
      :deep(.el-collapse-item) {
        border-bottom: 1px solid #ebeef5;

        .el-collapse-item__header {
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }

        .el-collapse-item__content {
          padding: 0;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .global-events,
    .component-events {
      padding: 16px;

      .empty-state,
      .no-selection {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 32px 0;
        color: #909399;

        .empty-icon {
          font-size: 32px;
          margin-bottom: 12px;
          color: #c0c4cc;
        }

        .empty-text {
          font-size: 14px;
        }
      }

      .selected-component-info {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px;
        background-color: #f5f7fa;
        border-radius: 6px;

        .component-icon {
          margin-right: 12px;
          font-size: 16px;
          color: #606266;
        }

        .component-name {
          flex: 1;
          font-weight: 500;
          color: #303133;
        }

        :deep(.el-tag) {
          font-size: 12px;
        }
      }

      .event-item {
        border: 1px solid #ebeef5;
        border-radius: 6px;
        margin-bottom: 16px;
        background-color: #ffffff;

        .event-header {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #ebeef5;
          background-color: #f5f7fa;

          .event-type-icon {
            margin-right: 12px;
            font-size: 16px;

            &.global {
              color: #67c23a;
            }

            &.component {
              color: #409eff;
            }
          }

          .event-name {
            flex: 1;
            font-weight: 500;
            color: #303133;
          }

          :deep(.el-tag) {
            margin: 0 12px;
            font-size: 12px;
          }

          :deep(.el-button) {
            padding: 4px;
          }

          :deep(.el-switch) {
            height: auto;
          }
        }

        .event-details {
          padding: 16px;

          :deep(.el-form) {
            .el-form-item {
              margin-bottom: 16px;

              .el-form-item__label {
                font-weight: 500;
                color: #606266;
              }

              .event-description {
                color: #606266;
              }

              .el-radio-group {
                display: flex;
                gap: 16px;
              }
            }
          }
        }
      }

      .add-global-event-btn {
        width: 100%;
        margin-top: 16px;

        :deep(.el-button) {
          width: 100%;
          border-style: dashed;
        }
      }
    }
  }
}
</style>
