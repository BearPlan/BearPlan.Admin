<script setup lang="tsx">
import { computed } from 'vue';
import { useForm, useRequest } from 'alova/client';
import Apis from '@/api';
import type { DeptTreeDTO, UpdateDeptParam } from '@/api/globals';
import { useForm as useCommonForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';
defineOptions({
  name: 'DeptEditForm'
});
type FormType = UpdateDeptParam;

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

// 递归移除 id 节点及其子孙；编辑时排除自身子树，防止上级部门选到自己形成环（后端未做环路校验）
const removeSelfTree = (list: DeptTreeDTO[], id: string): DeptTreeDTO[] => {
  return list
    .filter(item => item.id !== id)
    .map(item => ({
      ...item,
      children: item.children ? removeSelfTree(item.children, id) : item.children
    }));
};

const { formRef, validate, restoreValidation } = useCommonForm();
// 规则验证获取对象
const { defaultRequiredRule } = useFormRules();
type RuleKey = keyof FormType;
const rules: Partial<Record<RuleKey, App.Global.FormRule | App.Global.FormRule[]>> = {
  name: defaultRequiredRule
};

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
    (form.id ? Apis.Dept.Update : Apis.Dept.Add)({
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
    initialForm: {
      id: 0,
      parentId: '0', // 新增默认顶级部门，后端按 parentId != 0 重算父节点子计数
      name: '',
      sort: 0,
      enabled: true
    } as unknown as FormType,
    async middleware(_, next) {
      // 校验通过才发起提交；promise 链必须 await 透传给 alova，请求无论成败它都会自动复位 loading
      await validate();
      await next();
    }
  }
);
/** 获取详情 */
const { send: getInfo, loading: infoLoading } = useRequest(
  id =>
    Apis.Dept.GetInfo({
      params: { id },
      transform: res => {
        updateForm(res.data as unknown as FormType);
      }
    }),
  { force: true, immediate: false }
);
/** 获取上级部门候选树 */
const { data: deptTree } = useRequest(
  () =>
    Apis.Dept.GetTree({
      params: { KeyWord: '' },
      transform: res => {
        return res.data || [];
      }
    }),
  { force: true, immediate: true }
);
// 上级部门候选 = 顶级部门（id '0'，后端 parentId 为 0 即挂根节点）+ 部门树；依赖详情回填后的 id 做排除
const parentOptions = computed<DeptTreeDTO[]>(() => {
  const list = formData.value.id ? removeSelfTree(deptTree.value, String(formData.value.id)) : deptTree.value;
  return [{ id: '0', name: '顶级部门', children: [] } as unknown as DeptTreeDTO, ...list];
});
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
    <ElForm ref="formRef" :model="formData" :rules="rules" label-placement="left" :label-width="100">
      <ElFormItem label="上级部门" prop="parentId">
        <ElTreeSelect
          v-model="formData.parentId"
          class="w-full"
          node-key="id"
          :data="parentOptions"
          :props="{ label: 'name', children: 'children' }"
          check-strictly
          default-expand-all
          :render-after-expand="false"
          :placeholder="$t('common.placeholder') + '上级部门'"
        />
      </ElFormItem>

      <ElFormItem label="部门名称" prop="name">
        <ElInput v-model="formData.name" :placeholder="$t('common.placeholder') + '部门名称'" />
      </ElFormItem>

      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="formData.sort" class="w-full" :placeholder="$t('common.placeholder') + '排序'" />
      </ElFormItem>

      <ElFormItem label="启用状态" prop="enabled">
        <ElRadioGroup v-model="formData.enabled">
          <ElRadio :value="true" label="启用" />
          <ElRadio :value="false" label="禁用" />
        </ElRadioGroup>
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
