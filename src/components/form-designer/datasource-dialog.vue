<script setup lang="ts">
import { ref } from 'vue';
import JsonEditor from './json-editor.vue';

defineOptions({
  name: 'DataSourceDialog'
});

// Events
const emit = defineEmits<{
  confirm: [dataSource: any];
  cancel: [];
}>();

// 响应式数据
const form = ref({
  name: '',
  description: '',
  type: 'static',
  fields: [] as Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>,
  apiUrl: '',
  method: 'GET',
  headers: null
});

// 方法
const addField = () => {
  form.value.fields.push({
    name: '',
    label: '',
    type: 'string',
    required: false
  });
};

const removeField = (index: number) => {
  form.value.fields.splice(index, 1);
};

const confirm = () => {
  emit('confirm', { ...form.value });
};
</script>

<template>
  <div class="datasource-dialog">
    <ElForm :model="form" label-width="100px" @submit.prevent>
      <ElFormItem label="数据源名称" required>
        <ElInput v-model="form.name" placeholder="请输入数据源名称" maxlength="50" show-word-limit />
      </ElFormItem>

      <ElFormItem label="数据源描述">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入数据源描述"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="数据源类型">
        <ElSelect v-model="form.type" placeholder="请选择数据源类型">
          <ElOption label="静态数据" value="static" />
          <ElOption label="API接口" value="api" />
          <ElOption label="数据库" value="database" />
        </ElSelect>
      </ElFormItem>

      <!-- 静态数据配置 -->
      <template v-if="form.type === 'static'">
        <ElFormItem label="字段配置">
          <div class="fields-config">
            <div class="fields-header">
              <span class="fields-title">字段列表</span>
              <ElButton size="small" type="primary" @click="addField">
                <SvgIcon icon="mdi:plus" class="mr-1" />
                添加字段
              </ElButton>
            </div>

            <div class="fields-list">
              <div v-for="(field, index) in form.fields" :key="index" class="field-item">
                <ElInput v-model="field.name" placeholder="字段名" size="small" />

                <ElInput v-model="field.label" placeholder="字段标签" size="small" />

                <ElSelect v-model="field.type" placeholder="字段类型" size="small">
                  <ElOption label="文本" value="string" />
                  <ElOption label="数字" value="number" />
                  <ElOption label="布尔" value="boolean" />
                  <ElOption label="日期" value="date" />
                </ElSelect>

                <ElSwitch v-model="field.required" size="small" active-text="必填" inactive-text="选填" />

                <ElButton size="small" type="danger" text @click="removeField(index)">
                  <SvgIcon icon="mdi:delete" />
                </ElButton>
              </div>
            </div>
          </div>
        </ElFormItem>
      </template>

      <!-- API接口配置 -->
      <template v-if="form.type === 'api'">
        <ElFormItem label="API地址" required>
          <ElInput v-model="form.apiUrl" placeholder="请输入API地址" />
        </ElFormItem>

        <ElFormItem label="请求方法">
          <ElSelect v-model="form.method">
            <ElOption label="GET" value="GET" />
            <ElOption label="POST" value="POST" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="请求头">
          <JsonEditor v-model="form.headers" placeholder="请输入请求头JSON..." :rows="4" />
        </ElFormItem>
      </template>
    </ElForm>

    <div class="dialog-footer">
      <ElButton @click="$emit('cancel')">取消</ElButton>
      <ElButton type="primary" :disabled="!form.name.trim()" @click="confirm">确定</ElButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.datasource-dialog {
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 16px;

      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }

      .el-form-item__content {
        .el-input,
        .el-select,
        .el-textarea {
          width: 100%;
        }
      }
    }
  }

  .fields-config {
    .fields-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .fields-title {
        font-weight: 500;
        color: #303133;
      }

      :deep(.el-button) {
        padding: 6px 12px;
      }
    }

    .fields-list {
      .field-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        background-color: #f5f7fa;

        :deep(.el-input),
        :deep(.el-select) {
          flex: 1;

          .el-input__wrapper {
            padding: 0 8px;
          }

          .el-input__inner,
          .el-select__wrapper {
            height: 32px;
            line-height: 32px;
          }
        }

        :deep(.el-switch) {
          height: 32px;
          line-height: 32px;
        }

        :deep(.el-button) {
          padding: 4px;
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    :deep(.el-button) {
      padding: 8px 20px;
    }
  }
}
</style>
