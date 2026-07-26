<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ComponentDesignData } from '@/typings/form-designer';

defineOptions({
  name: 'StyleEditor'
});

// Props
interface Props {
  component: ComponentDesignData;
}

const props = defineProps<Props>();

// Events
const emit = defineEmits<{
  update: [styles: Record<string, any>];
}>();

// 响应式数据
const activeCategories = ref(['layout']);

// 计算属性
const styles = computed(() => props.component.style || {});

// 方法
const updateStyle = (property: string, value: any) => {
  const updatedStyles = { ...styles.value };

  if (value === '' || value === null || value === undefined) {
    delete updatedStyles[property];
  } else {
    updatedStyles[property] = value;
  }

  emit('update', updatedStyles);
};

const parseSpacing = (spacing: string, direction: 'top' | 'right' | 'bottom' | 'left'): number => {
  if (!spacing) return 0;

  const values = spacing.split(' ').map(v => Number.parseInt(v) || 0);

  switch (values.length) {
    case 1:
      return values[0];
    case 2:
      return direction === 'top' || direction === 'bottom' ? values[0] : values[1];
    case 3:
      switch (direction) {
        case 'top':
          return values[0];
        case 'right':
        case 'left':
          return values[1];
        case 'bottom':
          return values[2];
      }
    case 4:
      switch (direction) {
        case 'top':
          return values[0];
        case 'right':
          return values[1];
        case 'bottom':
          return values[2];
        case 'left':
          return values[3];
      }
    default:
      return 0;
  }
};

const updateSpacing = (type: 'margin' | 'padding', direction: 'top' | 'right' | 'bottom' | 'left', value: number) => {
  const currentSpacing = styles.value[type] || '0';
  const values = currentSpacing.split(' ').map(v => Number.parseInt(v) || 0);

  // 补齐为4个值
  while (values.length < 4) {
    if (values.length === 1) values.push(values[0]);
    else if (values.length === 2) values.push(values[0], values[1]);
    else if (values.length === 3) values.push(values[1]);
  }

  // 更新对应方向的值
  const directionIndex = ['top', 'right', 'bottom', 'left'].indexOf(direction);
  values[directionIndex] = value || 0;

  // 优化输出格式
  const newSpacing = optimizeSpacingFormat(values);
  updateStyle(type, newSpacing);
};

const optimizeSpacingFormat = (values: number[]): string => {
  const [top, right, bottom, left] = values;

  if (top === right && right === bottom && bottom === left) {
    return `${top}px`;
  } else if (top === bottom && right === left) {
    return `${top}px ${right}px`;
  } else if (right === left) {
    return `${top}px ${right}px ${bottom}px`;
  }
  return `${top}px ${right}px ${bottom}px ${left}px`;
};
</script>

<template>
  <div class="style-editor">
    <div class="style-categories">
      <ElCollapse v-model="activeCategories" class="style-collapse">
        <!-- 布局样式 -->
        <ElCollapseItem title="布局样式" name="layout">
          <div class="style-group">
            <ElFormItem label="宽度">
              <ElInput
                :model-value="styles.width"
                placeholder="如: 100px, 50%, auto"
                @input="updateStyle('width', $event)"
              />
            </ElFormItem>

            <ElFormItem label="高度">
              <ElInput
                :model-value="styles.height"
                placeholder="如: 100px, auto"
                @input="updateStyle('height', $event)"
              />
            </ElFormItem>

            <ElFormItem label="边距">
              <div class="spacing-control">
                <ElInputNumber
                  :model-value="parseSpacing(styles.margin, 'top')"
                  size="small"
                  :min="0"
                  placeholder="上"
                  @change="updateSpacing('margin', 'top', $event)"
                />
                <ElInputNumber
                  :model-value="parseSpacing(styles.margin, 'right')"
                  size="small"
                  :min="0"
                  placeholder="右"
                  @change="updateSpacing('margin', 'right', $event)"
                />
                <ElInputNumber
                  :model-value="parseSpacing(styles.margin, 'bottom')"
                  size="small"
                  :min="0"
                  placeholder="下"
                  @change="updateSpacing('margin', 'bottom', $event)"
                />
                <ElInputNumber
                  :model-value="parseSpacing(styles.margin, 'left')"
                  size="small"
                  :min="0"
                  placeholder="左"
                  @change="updateSpacing('margin', 'left', $event)"
                />
              </div>
            </ElFormItem>

            <ElFormItem label="内边距">
              <div class="spacing-control">
                <ElInputNumber
                  :model-value="parseSpacing(styles.padding, 'top')"
                  size="small"
                  :min="0"
                  placeholder="上"
                  @change="updateSpacing('padding', 'top', $event)"
                />
                <ElInputNumber
                  :model-value="parseSpacing(styles.padding, 'right')"
                  size="small"
                  :min="0"
                  placeholder="右"
                  @change="updateSpacing('padding', 'right', $event)"
                />
                <ElInputNumber
                  :model-value="parseSpacing(styles.padding, 'bottom')"
                  size="small"
                  :min="0"
                  placeholder="下"
                  @change="updateSpacing('padding', 'bottom', $event)"
                />
                <ElInputNumber
                  :model-value="parseSpacing(styles.padding, 'left')"
                  size="small"
                  :min="0"
                  placeholder="左"
                  @change="updateSpacing('padding', 'left', $event)"
                />
              </div>
            </ElFormItem>
          </div>
        </ElCollapseItem>

        <!-- 外观样式 -->
        <ElCollapseItem title="外观样式" name="appearance">
          <div class="style-group">
            <ElFormItem label="背景色">
              <ElColorPicker :model-value="styles.backgroundColor" @change="updateStyle('backgroundColor', $event)" />
            </ElFormItem>

            <ElFormItem label="文字颜色">
              <ElColorPicker :model-value="styles.color" @change="updateStyle('color', $event)" />
            </ElFormItem>

            <ElFormItem label="边框颜色">
              <ElColorPicker :model-value="styles.borderColor" @change="updateStyle('borderColor', $event)" />
            </ElFormItem>

            <ElFormItem label="边框宽度">
              <ElInputNumber
                :model-value="parseInt(styles.borderWidth) || 0"
                :min="0"
                :max="10"
                @change="updateStyle('borderWidth', $event + 'px')"
              />
            </ElFormItem>

            <ElFormItem label="边框样式">
              <ElSelect
                :model-value="styles.borderStyle"
                placeholder="请选择"
                @change="updateStyle('borderStyle', $event)"
              >
                <ElOption label="实线" value="solid" />
                <ElOption label="虚线" value="dashed" />
                <ElOption label="点线" value="dotted" />
                <ElOption label="无边框" value="none" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="圆角">
              <ElInputNumber
                :model-value="parseInt(styles.borderRadius) || 0"
                :min="0"
                :max="50"
                @change="updateStyle('borderRadius', $event + 'px')"
              />
            </ElFormItem>
          </div>
        </ElCollapseItem>

        <!-- 文字样式 -->
        <ElCollapseItem title="文字样式" name="typography">
          <div class="style-group">
            <ElFormItem label="字体大小">
              <ElInputNumber
                :model-value="parseInt(styles.fontSize) || 14"
                :min="8"
                :max="72"
                @change="updateStyle('fontSize', $event + 'px')"
              />
            </ElFormItem>

            <ElFormItem label="字体粗细">
              <ElSelect
                :model-value="styles.fontWeight"
                placeholder="请选择"
                @change="updateStyle('fontWeight', $event)"
              >
                <ElOption label="正常" value="normal" />
                <ElOption label="粗体" value="bold" />
                <ElOption label="更粗" value="bolder" />
                <ElOption label="更细" value="lighter" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="文本对齐">
              <ElSelect :model-value="styles.textAlign" placeholder="请选择" @change="updateStyle('textAlign', $event)">
                <ElOption label="左对齐" value="left" />
                <ElOption label="居中" value="center" />
                <ElOption label="右对齐" value="right" />
                <ElOption label="两端对齐" value="justify" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="行高">
              <ElInputNumber
                :model-value="parseFloat(styles.lineHeight) || 1.5"
                :min="1"
                :max="3"
                :step="0.1"
                :precision="1"
                @change="updateStyle('lineHeight', $event)"
              />
            </ElFormItem>
          </div>
        </ElCollapseItem>
      </ElCollapse>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.style-editor {
  .style-categories {
    .style-collapse {
      :deep(.el-collapse-item) {
        border-bottom: 1px solid #ebeef5;

        .el-collapse-item__header {
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }

        .el-collapse-item__content {
          padding: 16px;
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .style-group {
      :deep(.el-form-item) {
        margin-bottom: 16px;

        .el-form-item__label {
          font-weight: 500;
          color: #606266;
        }

        .el-form-item__content {
          .spacing-control {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 4px;

            :deep(.el-input-number) {
              .el-input-number__decrease,
              .el-input-number__increase {
                width: 20px;
              }

              .el-input__inner {
                padding-left: 24px;
                padding-right: 24px;
                text-align: center;
              }
            }
          }

          .el-color-picker {
            vertical-align: top;
          }

          .el-select,
          .el-input-number {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
