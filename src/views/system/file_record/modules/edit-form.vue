<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFile } from 'element-plus';
import { useUploader } from 'alova/client';
import Apis from '@/api';
// 动态挂载（createComponent）的组件是独立 app 实例，无主应用 i18n 插件，$t 必须显式导入为 setup 绑定
import { $t } from '@/locales';

defineOptions({
  name: 'FileRecordEditForm'
});

const visible = defineModel<boolean>('visible', {
  required: true,
  default: false
});

interface Emits {
  // 上传成功后通知父页面刷新列表
  (e: 'uploaded'): any;
}
const emit = defineEmits<Emits>();

// 业务场景（选填，随上传传给后端，用于追溯具体业务来源）
const scene = ref('');

// 上传结果：文件名 + 后端返回的记录 id
const uploadResult = ref<Array<{ name: string; id: string }>>([]);

// alova 批量上传：fileList 项含状态（0 待传/1 传中/2 完成/3 失败）与进度；单文件成功在 transform 中收集返回 id 并刷新列表
// Content-Type 必须显式设为 multipart/form-data，否则全局 beforeRequest 会兜底成 application/json，后端 IFormFile 绑定失败
const { fileList, uploading, appendFiles, removeFiles, upload } = useUploader(({ file }) =>
  Apis.FileRecord.Upload({
    data: { file, scene: scene.value },
    headers: { 'Content-Type': 'multipart/form-data' },
    transform: res => {
      uploadResult.value.push({ name: file.name, id: res.data });
      window.$message?.success(`${file.name} 上传成功，记录 Id：${res.data}`);
      emit('uploaded');
      return res.data;
    }
  })
);

// 文件状态文案与标签色映射（对应 AlovaFileItem.status 0-3）
const statusLabelMap: Record<number, string> = {
  0: '等待中',
  1: '上传中',
  2: '已完成',
  3: '上传失败'
};
const statusTypeMap: Record<number, 'info' | 'warning' | 'success' | 'danger'> = {
  0: 'info',
  1: 'warning',
  2: 'success',
  3: 'danger'
};

/** ElUpload 仅作选择/拖拽入口（隐藏自带列表），选中文件转入 alova fileList 统一管理 */
const onFileChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    // appendFiles 接收 AlovaRawFile（{ file: File }），不能传裸 File，否则类型转换器匹配失败
    appendFiles(uploadFile as unknown as File);
  }
};

/** 上传全部待传文件（alova 并发发送），全部结束后清空上传列表（结果保留在上传结果表格） */
const handleUpload = async () => {
  await upload();
  fileList.value = [];
};
</script>

<template>
  <ElDialog v-model="visible" title="上传文件" preset="card" class="w-600px">
    <div class="flex flex-col gap-12px">
      <ElInput v-model="scene" placeholder="业务场景（选填，如 avatar / goods / banner）" clearable />

      <ElUpload drag multiple :auto-upload="false" :show-file-list="false" :on-change="onFileChange">
        <div class="flex-center flex-col gap-8px py-16px">
          <icon-mdi-upload class="text-32px text-icon" />
          <div>将文件拖到此处，或点击选择文件</div>
        </div>
      </ElUpload>

      <!-- alova 上传列表：状态由 useUploader 维护，未完成项可移除 -->
      <div v-if="fileList.length > 0" class="flex flex-col gap-8px">
        <div
          v-for="(item, index) in fileList"
          :key="index"
          class="flex items-center justify-between gap-8px border rounded-4px px-12px py-8px"
        >
          <span class="min-w-0 truncate">{{ item.file.name }}</span>
          <div class="flex shrink-0 items-center gap-8px">
            <ElTag :type="statusTypeMap[item.status]" size="small">{{ statusLabelMap[item.status] }}</ElTag>
            <ElButton
              v-if="item.status === 0 || item.status === 3"
              type="danger"
              plain
              size="small"
              @click="removeFiles(index)"
            >
              移除
            </ElButton>
          </div>
        </div>
      </div>

      <!-- 上传结果：展示后端返回的记录 id -->
      <ElTable v-if="uploadResult.length > 0" :data="uploadResult" border size="small">
        <ElTableColumn prop="name" label="文件名" />
        <ElTableColumn prop="id" label="记录 Id" min-width="180" />
      </ElTable>
    </div>
    <template #footer>
      <ElSpace :size="16" class="float-right">
        <ElButton @click="visible = false">{{ $t('common.close') }}</ElButton>
        <ElButton type="primary" :loading="uploading" @click="handleUpload">开始上传</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
