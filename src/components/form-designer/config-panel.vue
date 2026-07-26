<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { FormComponent } from '@/api/globals';
import {
  type AttributeMeta,
  type ComponentId,
  ComponentMetaMap
} from '@/views/configprovider/form-designer/crawler/element-plus-components';
import { FORM_COMPONENTS, getDefaultComponent } from '@/views/configprovider/form-designer/component-map';
import IconPicker from './icon-picker.vue';

defineOptions({ name: 'ConfigPanel' });

const visible = defineModel<boolean>('visible', { default: false });
// 单一数据源：受控绑定当前编辑的 FormComponent，与父级双向同步
const value = defineModel<FormComponent>('value');

const activeTab = ref('attrs');

/**
 * 兜底初始化：旧数据 attrs 为 null 时建空对象，并按数据类型反推默认组件名。
 * 仅在打开抽屉且数据缺失时填，不覆盖用户已配置的值。
 */
watch(
  visible,
  open => {
    if (!open || !value.value) return;
    // 兜底初始化 attrs / slots，避免模板里 v-model 写入 null
    if (!value.value.attrs) value.value.attrs = {};
    if (!value.value.slots) value.value.slots = {};
    if (!value.value.attrs.component) {
      value.value.attrs.component = getDefaultComponent(value.value.type);
    }
  },
  { immediate: true }
);

// 当前选中组件的元数据 attributes（驱动属性编辑区动态渲染）
const attributes = computed<AttributeMeta[]>(() => {
  const compName = value.value?.attrs?.component;
  if (!compName) return [];
  return ComponentMetaMap[compName as ComponentId]?.metadata?.attributes ?? [];
});

const slotsMeta = computed(() => {
  const compName = value.value?.attrs?.component;
  if (!compName) return [];
  return ComponentMetaMap[compName as ComponentId]?.metadata?.slots ?? [];
});

const eventsMeta = computed(() => {
  const compName = value.value?.attrs?.component;
  if (!compName) return [];
  return ComponentMetaMap[compName as ComponentId]?.metadata?.events ?? [];
});

/** 切换组件类型时同步重置组件名，保证后续 attributes 跟随刷新 */
function handleComponentChange(name: string) {
  if (!value.value) return;
  if (!value.value.attrs) value.value.attrs = {};
  value.value.attrs.component = name;
}

/**
 * attrs 视图：直接返回 value.attrs 的引用，模板里 v-model="attrs[attr.name]" 即等价于
 * v-model="value.attrs[attr.name]"，写入会落到原对象上。
 * 注意：get 不能返回 `?? {}` 这种新对象，否则 v-model 写入会丢；由 watch(visible) 保证 attrs 非空。
 */
const attrs = computed(() => value.value?.attrs ?? {});

/** slots 视图：同 attrs，由 watch(visible) 保证非空 */
const slots = computed(() => value.value?.slots ?? {});

/** 当前选中组件名（用于顶部下拉的 v-model 绑定） */
const componentName = computed<string>({
  get: () => value.value?.attrs?.component ?? '',
  set: name => handleComponentChange(name)
});
</script>

<template>
  <ElDrawer v-model="visible" direction="rtl" resizable title="配置面板" size="420px">
    <div v-if="value" class="panel-content">
      <ElForm :model="value" label-placement="left" :label-width="100">
        <ElTabs v-model="activeTab" class="config-tabs">
          <!-- 属性 Tab -->
          <ElTabPane label="属性" name="attrs">
            <div class="tab-content">
              <!-- 表单项属性 -->
              <div class="form-section">
                <h5 class="section-title">表单项属性</h5>
                <ElFormItem label="字段名">
                  <ElInput v-model="value.prop" placeholder="请输入字段名" />
                </ElFormItem>
                <ElFormItem label="标签文本">
                  <ElInput v-model="value.label" placeholder="请输入标签文本" />
                </ElFormItem>
                <ElFormItem label="是否必填">
                  <ElSwitch v-model="value.required" />
                </ElFormItem>
              </div>

              <!-- 组件类型选择 -->
              <div class="form-section">
                <h5 class="section-title">组件类型</h5>
                <ElFormItem label="组件">
                  <ElSelect v-model="componentName" placeholder="请选择组件类型">
                    <ElOption v-for="name in FORM_COMPONENTS" :key="name" :label="name" :value="name" />
                  </ElSelect>
                </ElFormItem>
              </div>

              <!-- 组件属性：基于 metadata.attributes 动态生成编辑器 -->
              <div class="attrs-section">
                <h5 class="section-title">组件属性 {{ componentName }}</h5>
                <ElFormItem
                  v-for="(attr, index) in attributes"
                  :key="attr.name + '-' + componentName + '-' + index"
                  :label="attr.description || attr.name"
                  :required="attr.required"
                >
                  <!-- 文本类：ElInput -->
                  <ElInput
                    v-if="attr.editor === 'ElInput'"
                    v-model="attrs[attr.name]"
                    :placeholder="attr.description"
                  />
                  <!-- 布尔类：ElSwitch -->
                  <ElSwitch v-else-if="attr.editor === 'ElSwitch'" v-model="attrs[attr.name]" />
                  <!-- 数字类：ElInputNumber -->
                  <ElInputNumber
                    v-else-if="attr.editor === 'ElInputNumber'"
                    v-model="attrs[attr.name]"
                    controls-position="right"
                    class="w-full"
                  />
                  <!-- 带选项的下拉：ElSelect -->
                  <ElSelect
                    v-else-if="attr.editor === 'ElSelect' && attr.options"
                    v-model="attrs[attr.name]"
                    :placeholder="attr.description"
                  >
                    <ElOption v-for="opt in attr.options" :key="opt" :label="opt" :value="opt" />
                  </ElSelect>
                  <!-- 图标选择器：复用 IconPicker -->
                  <IconPicker v-else-if="attr.editor === 'IconPicker'" v-model="attrs[attr.name]" />
                  <!-- 代码/函数类：MVP 用 textarea 兜底，避免引入 Monaco -->
                  <ElInput
                    v-else-if="attr.editor === 'CodeEditor' || attr.editor === 'JsonEditor'"
                    v-model="attrs[attr.name]"
                    type="textarea"
                    :rows="3"
                    :placeholder="attr.description"
                  />
                  <!-- 其余自定义编辑器（OptionsEditor/StyleEditor/EventEditor 等）暂用文本兜底 -->
                  <ElInput v-else v-model="attrs[attr.name]" :placeholder="attr.description" />
                </ElFormItem>
                <ElEmpty v-if="attributes.length === 0" description="该组件暂无属性配置" :image-size="60" />
              </div>
            </div>
          </ElTabPane>

          <!-- 插槽 Tab -->
          <ElTabPane label="插槽" name="slots">
            <div class="tab-content">
              <ElEmpty v-if="slotsMeta.length === 0" description="该组件暂无插槽配置" :image-size="60" />
              <div v-else class="slots-config">
                <ElFormItem v-for="slot in slotsMeta" :key="slot.name" :label="`${slot.name} (${slot.description})`">
                  <ElInput
                    v-model="slots[slot.name]"
                    type="textarea"
                    :rows="2"
                    :placeholder="`请输入${slot.description}内容`"
                  />
                </ElFormItem>
              </div>
            </div>
          </ElTabPane>

          <!-- 事件 Tab -->
          <ElTabPane label="事件" name="events">
            <div class="tab-content">
              <ElEmpty v-if="eventsMeta.length === 0" description="该组件暂无可配置事件" :image-size="60" />
              <div v-else class="events-config">
                <ElFormItem
                  v-for="event in eventsMeta"
                  :key="event.name"
                  :label="`${event.name} (${event.description})`"
                >
                  <ElInput v-model="attrs[`on${event.name}`]" :placeholder="`请输入${event.description}处理函数`" />
                  <div v-if="event.params" class="event-params">
                    <ElText size="small" type="info">参数: {{ event.params }}</ElText>
                  </div>
                </ElFormItem>
              </div>
            </div>
          </ElTabPane>
        </ElTabs>
      </ElForm>
    </div>
    <ElEmpty v-else description="请选择组件" />
  </ElDrawer>
</template>

<style lang="scss" scoped>
.panel-content {
  padding: 8px 4px;

  .config-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }
  }

  .tab-content {
    .section-title {
      margin: 0 0 12px;
      padding-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-regular);
      border-bottom: 1px solid var(--el-border-color-light);
    }

    .form-section,
    .attrs-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(.el-form-item) {
      margin-bottom: 16px;

      .el-form-item__label {
        font-weight: 500;
      }
    }

    .el-input,
    .el-select,
    .el-input-number {
      width: 100%;
    }

    .events-config {
      .event-params {
        margin-top: 4px;
      }
    }
  }
}
</style>
