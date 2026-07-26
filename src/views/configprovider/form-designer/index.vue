<script setup lang="tsx">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { TableColumnCtx } from 'element-plus';
import { ElButton, ElInput, ElOption, ElPopconfirm, ElSelect, ElSwitch } from 'element-plus';
import { useForm, useRequest } from '@sa/alova/client';
import { VueDraggable } from 'vue-draggable-plus';
import { Hide, View } from '@element-plus/icons-vue';
import Apis from '@/api';
import { ColumnTypeEnum } from '@/api/apiEnums';
import type { FormComponent, UpdateTableFormParam } from '@/api/globals';
import createComponent from '@/utils/createComponent';
import I18nDrawer from '@/components/i18n/i18n-drawer.vue';
import { $t } from '@/locales';
import ConfigPanel from '@/components/form-designer/config-panel.vue';
import type { ComponentApi } from '../../table/types';
import ComponentPalette from './component-palette.vue';
import DesignerCanvas from './designer-canvas.vue';
import { FORM_COMPONENTS, getDefaultComponent } from './component-map';
defineOptions({ name: 'FormDesigner' });

const route = useRoute();
const configId = ref<string>((route.query.configId as string) || '');
const tableof = ref<string>((route.query.tableof as string) || 'UserDTO');
const routerUrl = ref<string>((route.query.router as string) || '');

let getTableHeader: () => void;

// 初始化表单
const {
  form: formData,
  send: submit,
  loading: submitLoading,
  updateForm
} = useForm(
  from =>
    Apis.TableForm.SetEdit({
      data: from,
      transform: res => {
        window.$message?.success('保存成功！');
        formData.value.id = res.data;
        getTableHeader();
      }
    }),
  {
    immediate: false,
    resetAfterSubmiting: false,
    initialForm: {
      configId: configId.value,
      tableof: tableof.value,
      router: routerUrl.value
    } as UpdateTableFormParam,
    async middleware(ctx, next) {
      await next();
      ctx.proxyStates.loading.v = false;
    }
  }
);

// 初始化表头数据获取
const { loading, send: fetchTableHeader } = useRequest(
  () =>
    Apis.TableForm.GetEdit({
      params: {
        ConfigId: configId.value || '',
        Tableof: tableof.value || '',
        Router: routerUrl.value || ''
      },
      transform: res => {
        const data = res.data as UpdateTableFormParam;
        // 兜底：每个组件若未指定 EP 组件名，按数据类型反推，保证画布能渲染
        data.components?.forEach(item => {
          if (!item.attrs) item.attrs = {};
          if (!item.attrs.component) {
            item.attrs.component = getDefaultComponent(item.type);
          }
        });
        updateForm(data);
      }
    }),
  {
    force: true,
    immediate: true
  }
);

// 赋值给全局函数
getTableHeader = fetchTableHeader;

// #region ConfigPanel 受控接入：画布选中 / 第一步「配置」按钮共用此入口
const configPaneVisible = ref(false);
const selectedComponent = ref<FormComponent>();

/** 第一步表格「配置」按钮：以指定行打开抽屉 */
function openConfig(row: FormComponent) {
  selectedComponent.value = row;
  configPaneVisible.value = true;
}

/** 第二步画布选中：与表格入口共用同一份 selectedComponent */
function handleCanvasSelect(component: FormComponent) {
  selectedComponent.value = component;
  configPaneVisible.value = true;
}

/**
 * 左侧组件库面板点击（非拖拽场景）：把 clone 出的 FormComponent 追加到画布末尾并选中。
 * 拖拽场景由 VueDraggable 的 clone 直接落入 formData.components，不走这里。
 */
function handlePaletteSelect(component: FormComponent) {
  formData.value.components?.push(component);
  selectedComponent.value = component;
  configPaneVisible.value = true;
}

const selectedId = computed(() => selectedComponent.value?.prop ?? null);
// #endregion

// #region 组件函数
const openI180n = async () => {
  const { on, unmount } = await createComponent(I18nDrawer, { visible: true });
  on('update:visible', res => {
    if (!res) {
      unmount();
    }
  });
};

// 添加新组件：补全必要字段，isShow=true 保证在画布可见
function handleAdd() {
  formData.value?.components?.push({
    label: '新字段',
    prop: `field_${Math.random().toString(36).slice(2, 8)}`,
    type: ColumnTypeEnum.自定义,
    required: false,
    isCustom: true,
    sort: 0,
    isEditDel: false,
    isShow: true,
    slots: null,
    attrs: { component: 'ElInput', placeholder: '请输入' },
    metadata: null,
    children: null
  } as FormComponent);
}

// 设置行样式
const rowClassName = ({ row }: { row: FormComponent; rowIndex: number }) => {
  if (row.isEditDel) return 'info-row';
  return '';
};
// #endregion

// #region 表格列配置
const columns = ref<Array<Partial<TableColumnCtx<FormComponent>> & { headAttrs?: ComponentApi; checked?: boolean }>>([
  {
    prop: 'sort',
    label: $t('table.dragsort'),
    align: 'center',
    checked: true,
    width: 80,
    formatter: row => {
      return (
        <div class="handle">
          <icon-mdi-drag class="mr-8px h-full cursor-move text-icon" />
          {row.sort}
        </div>
      );
    }
  },
  {
    prop: 'prop',
    label: '字段',
    align: 'center',
    checked: true,
    width: 150
  },
  {
    prop: 'label',
    label: '标签',
    align: 'center',
    checked: true,
    width: 200,
    formatter: row => {
      return (
        <div class="flex items-center justify-between">
          <ElInput
            class="flex-1"
            v-model={row.label}
            onChange={() => {
              row.isEditDel = false;
            }}
          ></ElInput>
          <el-text type="primary" onClick={() => openI180n()} class="ml-8px">
            国际化
          </el-text>
        </div>
      );
    }
  },
  {
    prop: 'type',
    label: '组件类型',
    align: 'center',
    width: 150,
    checked: true,
    formatter: row => {
      // 确保 attrs 存在；组件名统一存到 attrs.component（type 字段保留为后端 ColumnTypeEnum 数据类型）
      if (!row.attrs) row.attrs = {};
      if (!row.attrs.component) {
        row.attrs.component = getDefaultComponent(row.type);
      }
      return (
        <ElSelect
          v-model={row.attrs.component}
          placeholder="请选择组件类型"
          clearable
          onChange={() => {
            row.isEditDel = false;
          }}
        >
          {FORM_COMPONENTS.map(name => (
            <ElOption key={name} label={name} value={name} />
          ))}
        </ElSelect>
      );
    }
  },
  {
    prop: 'isShow',
    label: $t('table.table'),
    align: 'center',
    width: 80,
    checked: true,
    formatter: row => {
      return (
        <ElSwitch
          v-model={row.isShow}
          active-action-icon={View}
          inactive-action-icon={Hide}
          active-value={true}
          inactive-value={false}
          onChange={() => {
            row.isEditDel = false;
          }}
        />
      );
    }
  },
  {
    prop: 'required',
    label: '必填',
    align: 'center',
    width: 80,
    checked: true,
    formatter: row => {
      return (
        <ElSwitch
          v-model={row.required}
          active-value={true}
          inactive-value={false}
          onChange={() => {
            row.isEditDel = false;
          }}
        />
      );
    }
  },
  {
    prop: 'attrs',
    label: '属性配置',
    align: 'center',
    width: 120,
    checked: true,
    formatter: row => {
      return (
        <div class="flex flex-center">
          <ElButton type="primary" onClick={() => openConfig(row)} plain={!row.attrs} loading={loading.value}>
            配置
          </ElButton>
        </div>
      );
    }
  },
  {
    prop: 'use',
    label: '操作',
    align: 'center',
    width: 100,
    checked: true,
    formatter: row => (
      <div class="flex-center gap-8px">
        {!row.isEditDel ? (
          <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => (row.isEditDel = true)}>
            {{
              reference: () => (
                <ElButton type="danger" plain size="small">
                  {$t('common.delete')}
                </ElButton>
              )
            }}
          </ElPopconfirm>
        ) : (
          <ElButton type="primary" plain size="small" onClick={() => (row.isEditDel = false)}>
            {$t('common.add')}
          </ElButton>
        )}
      </div>
    )
  }
]);
// #endregion
const active = ref(0);
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden" body-class="ht50 flex flex-col">
      <template #header>
        <div class="flex items-center gap-16px">
          <p class="shrink-0">表单设计器</p>
          <ElSteps class="step-text-only shrink-0" :active="active" finish-status="success">
            <ElStep @click="active = 0">
              <template #icon><span>基础字段</span></template>
            </ElStep>
            <ElStep @click="active = 1">
              <template #icon><span>设计器</span></template>
            </ElStep>
            <ElStep @click="active = 2">
              <template #icon><span>完成</span></template>
            </ElStep>
          </ElSteps>
          <div class="flex-1"></div>
          <TableHeaderOperation
            id="FormDesigner"
            v-model:columns="columns"
            tableof="FormDesignerDTO"
            :loading="loading"
            class="shrink-0"
            @refresh="getTableHeader"
          >
            <ElButton type="primary" @click="handleAdd()">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              添加组件
            </ElButton>

            <template #suffix>
              <ElButton>{{ $t('预览') }}</ElButton>
              <ElButton>{{ $t('查看json') }}</ElButton>
              <ElButton type="primary" @click="submit">{{ $t('common.confirm') }}</ElButton>
            </template>
          </TableHeaderOperation>
        </div>
      </template>

      <ConfigPanel v-model:visible="configPaneVisible" v-model:value="selectedComponent" />

      <!-- 内容区：占剩余高度 -->
      <div v-if="active == 0" class="min-h-0 flex-1">
        <VueDraggable
          v-model="formData.components as FormComponent[]"
          class="h-full"
          target="tbody"
          filter=".handle"
          :animation="150"
        >
          <ElTable
            v-loading="submitLoading || loading"
            height="100%"
            border
            class="sm:h-full"
            :data="formData.components || []"
            :row-class-name="rowClassName"
            row-key="prop"
          >
            <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
          </ElTable>
        </VueDraggable>
      </div>
      <div v-if="active == 1" class="min-h-0 flex flex-1 gap-12px">
        <!-- 左侧组件库面板 -->
        <div class="w-240px shrink-0">
          <ComponentPalette @select="handlePaletteSelect" />
        </div>
        <!-- 右侧画布：受控 v-model，与第一步共用同一份 FormComponent[] -->
        <div class="min-w-0 flex-1">
          <DesignerCanvas v-model="formData.components" :selected-id="selectedId" @select="handleCanvasSelect" />
        </div>
      </div>
    </ElCard>
  </div>
</template>

<style>
.el-table .info-row {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

<style lang="scss" scoped>
/* 步骤条：icon 内放完整文字，改胶囊样式；无 title 时去掉底部多余间距 */
.step-text-only {
  :deep(.el-step__icon) {
    width: auto;
    min-width: 24px;
    height: 24px;
    padding: 0 12px;
    border: none;
    border-radius: 12px;
    background: var(--el-fill-color);
    color: var(--el-text-color-regular);
    font-size: 12px;
    transition: all 0.2s;
  }

  /* 已完成 / 进行中：主色背景 */
  :deep(.el-step__icon.is-finish),
  :deep(.el-step__icon.is-process) {
    background: var(--el-color-primary);
    color: #fff;
    border: none;
  }

  /* title 留空后，去掉 step 尾部多余空白 */
  :deep(.el-step__main) {
    display: none;
  }
}
</style>
