<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { UpdateQuartzNetParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'QuartzNetEditForm'
});

type FormType = UpdateQuartzNetParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();

interface Emits {
  (e: 'reload', row: any): any;
}
const emit = defineEmits<Emits>();

/** 提交详情 */
const {
  send: handleSubmit,
  form: formData,
  reset: resetFrom,
  updateForm,
  loading: subLoading
} = useForm(
  form =>
    (form.id ? Apis.QuartzNet.Update : Apis.QuartzNet.Add)({
      data: form,
      transform: _ => {
        window.$message?.success($t('common.updateSuccess'));
        visible.value = false;
        emit('reload', form);
      }
    }),
  {
    immediate: false,
    resetAfterSubmiting: true,
    // 只初始化表单涉及的配置字段；runTimes/startTime/endTime 为运行时统计字段，编辑时由 GetInfo 回填
    initialForm: {
      id: 0,
      taskName: '',
      taskGroup: '',
      triggerType: 1,
      cron: '',
      intervalSecond: 0,
      cycleRunTimes: 0,
      assemblyName: '',
      className: '',
      runParams: '',
      principal: '',
      alertEmail: '',
      pauseAfterFailure: false,
      enabled: true,
      description: ''
    } as unknown as FormType,
    async middleware(_, next) {
      // 校验通过才发起提交；promise 链必须 await 透传给 alova，请求无论成败它都会自动复位 loading
      await validate();
      await next();
    }
  }
);

type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  taskName: defaultRequiredRule,
  taskGroup: defaultRequiredRule,
  assemblyName: defaultRequiredRule,
  className: defaultRequiredRule,
  // Cron 表达式仅表达式触发模式下必填
  cron: [
    {
      validator: (_rule, value, callback) => {
        if (formData.value.triggerType === 1 && !value) callback(new Error('请输入Cron表达式'));
        else callback();
      },
      trigger: 'blur'
    }
  ],
  // 间隔秒数仅间隔触发模式下必填；后端新增要求大于5秒、编辑要求不小于1秒，前端按新增/编辑分别前置校验
  intervalSecond: [
    {
      validator: (_rule, value, callback) => {
        if (formData.value.triggerType !== 2) callback();
        else if (!value) callback(new Error('请输入间隔秒数'));
        else if (!formData.value.id && value <= 5) callback(new Error('新增任务时间隔秒数需大于5'));
        else callback();
      },
      trigger: 'blur'
    }
  ]
};
/** 获取详情 */
const { send: getInfo, loading: infoLoading } = useRequest(
  id =>
    Apis.QuartzNet.GetInfo({
      params: { id },
      transform: res => {
        updateForm(res.data as unknown as FormType);
      }
    }),
  { force: true, immediate: false }
);
const title = computed(() => {
  return formData.value.id ? $t('common.edit') : $t('common.add');
});
// 打开
const openForm = async (_parentId: string | null, id?: string) => {
  visible.value = true;
  if (id) {
    await getInfo(id);
  }
};

const closeForm = () => {
  visible.value = false;
  restoreValidation();
  resetFrom();
};

defineExpose({
  openForm
});
const loading = computed<boolean>(() => subLoading.value || infoLoading.value);
</script>

<template>
  <ElDialog v-model="visible" :title="title" preset="card" class="w-800px" @close="closeForm">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="110">
      <ElFormItem label="任务名称" prop="taskName">
        <ElInput v-model="formData.taskName" :placeholder="$t('common.placeholder') + '任务名称'" />
      </ElFormItem>

      <ElFormItem label="任务分组" prop="taskGroup">
        <ElInput v-model="formData.taskGroup" :placeholder="$t('common.placeholder') + '任务分组'" />
      </ElFormItem>

      <ElFormItem label="触发类型" prop="triggerType">
        <ElRadioGroup v-model="formData.triggerType">
          <ElRadio :value="1" label="Cron表达式" />
          <ElRadio :value="2" label="间隔" />
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem v-if="formData.triggerType === 1" label="Cron表达式" prop="cron">
        <ElInput v-model="formData.cron" placeholder="0/5 * * * * ?">
          <!-- 在线生成器:cron.ren 支持可视化解析/反解析 Quartz 表达式 -->
          <template #append>
            <ElButton tag="a" href="https://cron.ren/" target="_blank" rel="noopener noreferrer">在线生成</ElButton>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem v-if="formData.triggerType === 2" label="间隔秒数" prop="intervalSecond">
        <ElInputNumber
          v-model="formData.intervalSecond"
          class="w-full"
          :min="1"
          :placeholder="$t('common.placeholder') + '间隔秒数'"
        />
      </ElFormItem>

      <ElFormItem label="循环次数" prop="cycleRunTimes">
        <ElInputNumber
          v-model="formData.cycleRunTimes"
          class="w-full"
          :min="0"
          :placeholder="$t('common.placeholder') + '循环次数（0为不限）'"
        />
      </ElFormItem>

      <ElFormItem label="程序集" prop="assemblyName">
        <ElInput v-model="formData.assemblyName" :placeholder="$t('common.placeholder') + '程序集名称'" />
      </ElFormItem>

      <ElFormItem label="类型" prop="className">
        <ElInput v-model="formData.className" :placeholder="$t('common.placeholder') + '类型名称（含命名空间）'" />
      </ElFormItem>

      <ElFormItem label="运行参数" prop="runParams">
        <ElInput
          v-model="formData.runParams"
          type="textarea"
          :rows="3"
          :placeholder="$t('common.placeholder') + '运行参数（JSON）'"
        />
      </ElFormItem>

      <ElFormItem label="负责人" prop="principal">
        <ElInput v-model="formData.principal" :placeholder="$t('common.placeholder') + '负责人'" />
      </ElFormItem>

      <ElFormItem label="报警邮箱" prop="alertEmail">
        <ElInput v-model="formData.alertEmail" :placeholder="$t('common.placeholder') + '报警邮箱'" />
      </ElFormItem>

      <ElFormItem label="失败后暂停" prop="pauseAfterFailure">
        <ElRadioGroup v-model="formData.pauseAfterFailure">
          <ElRadio :value="true" label="是" />
          <ElRadio :value="false" label="否" />
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="启用状态" prop="enabled">
        <ElRadioGroup v-model="formData.enabled">
          <ElRadio :value="true" label="启用" />
          <ElRadio :value="false" label="禁用" />
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          :placeholder="$t('common.placeholder') + '描述'"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="closeForm">{{ $t('common.close') }}</ElButton>
        <ElButton type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
