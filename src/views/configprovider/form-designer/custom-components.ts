import type { ComponentMeta } from './crawler/element-plus-components';

/**
 * 自定义业务组件元数据
 *
 * 新增自定义组件步骤：
 *   1. 在 src/components 下创建 .vue 组件（defineOptions 的 name 必须与全局注册名一致，
 *      unplugin-vue-components 按文件名 PascalCase 自动注册，所以 name 也用文件名）
 *   2. 在此数组追加一条元数据（id 与组件全局注册名一致，画布 <component :is="id"> 靠此解析）
 *   3. 可选：补 metadata.attributes 供 ConfigPanel 编辑组件属性
 */
export const customComponents: ComponentMeta[] = [
  {
    id: 'DictSelect',
    label: '字典选择器',
    type: 'DictSelect',
    icon: 'mdi:form-dropdown',
    category: 'form',
    description: '按字典编码加载选项的下拉选择器',
    isFormItem: true,
    defaultAttrs: { dictId: '', placeholder: '请选择', clearable: true },
    defaultItemAttrs: { label: '字典选择', prop: 'dictId', required: false },
    metadata: {
      attributes: [
        { name: 'dictId', description: '字典编码', type: ['string'], required: true, editor: 'ElInput' },
        { name: 'placeholder', description: '占位文本', type: ['string'], default: '请选择', editor: 'ElInput' },
        { name: 'clearable', description: '可清空', type: ['boolean'], default: true, editor: 'ElSwitch' }
      ],
      slots: [],
      events: [],
      methods: []
    }
  }
];
