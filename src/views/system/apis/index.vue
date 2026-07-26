<script setup lang="tsx">
import { ref, useTemplateRef } from 'vue';
import { useRequest } from '@sa/alova/client';
import Apis from '@/api';
import type { TableColumn, TableView } from '@/api/globals';
import { VersionEnum } from '@/api/apiEnums';
import { getEnumValue } from '@/utils/common';
import DynamicList from '@/views/configprovider/table/dynamic-list.vue';
// import EditForm from '@/views/configprovider/table/edit-form.vue';
import type { Arg } from '~/packages/alova/src';
const listRef = useTemplateRef('listRef');
const { loading, send: refreshApis } = useRequest(
  // Method实例获取函数，它将接收page和pageSize，并返回一个Method实例
  () =>
    Apis.Apis.Refresh({
      transform: res => {
        window.$message?.success('操作成功！');
        listRef.value?.reload();
      }
    }),
  {
    force: true,
    immediate: false
  }
);

const searchData = ref<TableColumn[]>([]);

const loadChange = (table: TableView) => {
  searchData.value = table?.columns?.filter(item => item.searchType !== null) || [];
};
const param = ref<Arg>({});
// 打开编辑/新增
const editFormRef = ref();
const openForm = (id: string | null) => {
  editFormRef.value?.openForm(id);
};

const activeName = ref(VersionEnum.Pc);
const tabschange = () => {
  param.value.version = activeName.value;
  listRef.value?.reload();
};
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElTabs v-model="activeName" class="demo-tabs" @tab-change="tabschange">
      <ElTabPane
        v-for="(item, index) in getEnumValue(VersionEnum)"
        :key="index"
        :label="VersionEnum[item]"
        :name="item"
      ></ElTabPane>
    </ElTabs>
    <DynamicList
      ref="listRef"
      tableof="ApisDTO"
      router=""
      config-id=""
      page-url="/api/Apis/GetPage"
      del-url="/api/Apis/Delete"
      :param="param"
      @load-change="loadChange"
      @open-form="openForm"
    >
      <template #prefix>
        <ElButton type="primary" @click="refreshApis">
          <icon-mdi-refresh class="text-icon" />
          更新API
        </ElButton>
      </template>
    </DynamicList>

    <!--   add-url="/api/Apis/Add" -->
  </div>
</template>
