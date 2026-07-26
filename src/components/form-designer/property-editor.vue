<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentDesignData, PropertyConfig } from '@/typings/form-designer';
import IconPicker from './icon-picker.vue';
import JsonEditor from './json-editor.vue';

defineOptions({
  name: 'PropertyEditor'
});

// Props
interface Props {
  component: ComponentDesignData;
  properties: Record<string, any>;
  propertyConfigs: PropertyConfig[];
}

const props = defineProps<Props>();

// Events
const emit = defineEmits<{
  update: [properties: Record<string, any>];
}>();

// 计算属性
const groupedConfigs = computed(() => {
  const groups: Array<{ name: string; title: string; configs: PropertyConfig[] }> = [];
  const groupMap = new Map<string, PropertyConfig[]>();

  // 按组分类配置
  props.propertyConfigs.forEach(config => {
    const groupName = config.group || 'default';
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
    }
    groupMap.get(groupName)!.push(config);
  });

  // 转换为数组格式
  groupMap.forEach((configs, groupName) => {
    groups.push({
      name: groupName,
      title: getGroupTitle(groupName),
      configs: configs.filter(config => isPropertyVisible(config))
    });
  });

  return groups.filter(group => group.configs.length > 0);
});

// 方法
const getGroupTitle = (groupName: string): string => {
  const titleMap: Record<string, string> = {
    default: '基础属性',
    size: '尺寸设置',
    style: '样式设置',
    behavior: '行为设置',
    validation: '验证设置',
    data: '数据设置',
    display: '显示设置',
    interaction: '交互设置'
  };

  return titleMap[groupName] || groupName;
};

const getPropertyValue = (prop: string): any => {
  const value = props.properties[prop];

  // 如果值为 undefined，尝试获取默认值
  if (value === undefined) {
    const config = props.propertyConfigs.find(c => c.prop === prop);
    return config?.defaultValue;
  }

  return value;
};

const isPropertyVisible = (config: PropertyConfig): boolean => {
  if (config.visible === false) return false;

  if (typeof config.visible === 'function') {
    return config.visible(props.component as any, props.component);
  }

  // 检查依赖条件
  if (config.dependsOn && config.dependsOn.length > 0) {
    return config.dependsOn.every(dep => {
      const depValue = getPropertyValue(dep.prop);
      return depValue === dep.value;
    });
  }

  return true;
};

const handlePropertyChange = (prop: string, value: any) => {
  const updatedProperties = { ...props.properties };

  // 特殊值处理
  if (value === '' || value === null) {
    delete updatedProperties[prop];
  } else {
    updatedProperties[prop] = value;
  }

  emit('update', updatedProperties);
};

// 验证属性值
const validatePropertyValue = (config: PropertyConfig, value: any): boolean => {
  if (config.required && (value === undefined || value === null || value === '')) {
    return false;
  }

  if (config.type === 'number') {
    if (config.min !== undefined && value < config.min) return false;
    if (config.max !== undefined && value > config.max) return false;
  }

  return true;
};
</script>

<template>
  <div class="property-editor">
    <div v-if="groupedConfigs.length === 0" class="no-properties">
      <ElEmpty description="该组件暂无可配置属性" :image-size="60" />
    </div>

    <div v-else class="properties-list">
      <div v-for="group in groupedConfigs" :key="group.name" class="property-group">
        <h5 v-if="group.name !== 'default'" class="group-title">
          {{ group.title }}
        </h5>

        <div class="group-properties">
          <ElFormItem
            v-for="config in group.configs"
            :key="config.prop"
            :label="config.label"
            :required="config.required"
            class="property-item"
          >
            <template #label>
              <div class="property-label">
                <span>{{ config.label }}</span>
                <ElTooltip v-if="config.tooltip" :content="config.tooltip" placement="top">
                  <SvgIcon icon="mdi:help-circle-outline" class="help-icon" />
                </ElTooltip>
              </div>
            </template>

            <!-- 输入框 -->
            <ElInput
              v-if="config.type === 'input'"
              :model-value="getPropertyValue(config.prop)"
              :placeholder="config.placeholder"
              :disabled="!isPropertyVisible(config)"
              @input="handlePropertyChange(config.prop, $event)"
            />

            <!-- 多行文本 -->
            <ElInput
              v-else-if="config.type === 'textarea'"
              :model-value="getPropertyValue(config.prop)"
              type="textarea"
              :rows="3"
              :placeholder="config.placeholder"
              :disabled="!isPropertyVisible(config)"
              @input="handlePropertyChange(config.prop, $event)"
            />

            <!-- 数字输入 -->
            <ElInputNumber
              v-else-if="config.type === 'number'"
              :model-value="getPropertyValue(config.prop)"
              :min="config.min"
              :max="config.max"
              :step="config.step || 1"
              :placeholder="config.placeholder"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            />

            <!-- 选择器 -->
            <ElSelect
              v-else-if="config.type === 'select'"
              :model-value="getPropertyValue(config.prop)"
              :placeholder="config.placeholder || '请选择'"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            >
              <ElOption
                v-for="option in config.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>

            <!-- 开关 -->
            <ElSwitch
              v-else-if="config.type === 'switch'"
              :model-value="getPropertyValue(config.prop)"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            />

            <!-- 滑块 -->
            <ElSlider
              v-else-if="config.type === 'slider'"
              :model-value="getPropertyValue(config.prop)"
              :min="config.min || 0"
              :max="config.max || 100"
              :step="config.step || 1"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            />

            <!-- 颜色选择器 -->
            <ElColorPicker
              v-else-if="config.type === 'color'"
              :model-value="getPropertyValue(config.prop)"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            />

            <!-- 单选框组 -->
            <ElRadioGroup
              v-else-if="config.type === 'radio'"
              :model-value="getPropertyValue(config.prop)"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            >
              <ElRadio v-for="option in config.options" :key="option.value" :label="option.value">
                {{ option.label }}
              </ElRadio>
            </ElRadioGroup>

            <!-- 复选框组 -->
            <ElCheckboxGroup
              v-else-if="config.type === 'checkbox'"
              :model-value="getPropertyValue(config.prop)"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            >
              <ElCheckbox v-for="option in config.options" :key="option.value" :label="option.value">
                {{ option.label }}
              </ElCheckbox>
            </ElCheckboxGroup>

            <!-- 图标选择器 -->
            <IconPicker
              v-else-if="config.type === 'icon'"
              :model-value="getPropertyValue(config.prop)"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            />

            <!-- JSON 编辑器 -->
            <JsonEditor
              v-else-if="config.type === 'json'"
              :model-value="getPropertyValue(config.prop)"
              :disabled="!isPropertyVisible(config)"
              @change="handlePropertyChange(config.prop, $event)"
            />

            <!-- 默认输入框 -->
            <ElInput
              v-else
              :model-value="getPropertyValue(config.prop)"
              :placeholder="config.placeholder"
              :disabled="!isPropertyVisible(config)"
              @input="handlePropertyChange(config.prop, $event)"
            />
          </ElFormItem>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.property-editor {
  .no-properties {
    :deep(.el-empty) {
      padding: 32px 0;
    }
  }

  .properties-list {
    .property-group {
      margin-bottom: 24px;

      .group-title {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        padding-bottom: 4px;
        border-bottom: 1px solid #ebeef5;
      }

      .group-properties {
        .property-item {
          margin-bottom: 16px;

          :deep(.el-form-item__label) {
            font-weight: 500;
            color: #606266;
            display: flex;
            align-items: center;

            .property-label {
              display: flex;
              justify-content: center;
              align-items: center;

              .help-icon {
                margin-left: 4px;
                font-size: 14px;
                color: #909399;
                cursor: help;
              }
            }
          }

          :deep(.el-form-item__content) {
            .el-input,
            .el-select,
            .el-slider,
            .el-color-picker {
              width: 100%;
            }

            .el-radio-group,
            .el-checkbox-group {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
            }

            .el-textarea {
              .el-textarea__inner {
                min-height: 80px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
