const local: App.I18n.Schema = {
  enum: {
    asc: '正序',
    desc: '倒序'
  },
  table: {
    table: '表格',
    sorts: '排序',
    selection: '多选',
    dragsort: '拖拽排序',
    prop: '字段',
    label: '注释',
    show: '显示',
    hide: '隐藏',
    excel: 'Excel',
    columnType: '数据类型',
    searchType: '搜索类型',
    use: '操作',
    setting: '配置',
    isMultiple: '是否多选'
  },
  menu: {
    parent: '父级菜单',
    menuType: '菜单类型',
    menuName: '菜单名称',
    routeName: '路由名称',
    routePath: '路由路径',
    order: '排序',
    hideInMenu: '隐藏菜单',
    activeMenu: '高亮的菜单',
    menuStatus: '菜单状态',
    addChildren: '添加子菜单',
    pathParam: '路径参数',
    layout: '布局',
    page: '页面组件',
    icon: '图标',
    iconType: '图标类型',
    constant: '常量路由',
    keepAlive: '缓存路由',
    href: '外链',
    multiTab: '支持多页签',
    fixedIndexInTab: '固定在页签中的序号',
    query: '路由参数',
    button: '按钮',
    buttonCode: '按钮编码',
    buttonDesc: '按钮描述'
  },
  sqlSugar: {
    Equal: '等于',
    Like: '模糊查询',
    GreaterThan: '大于',
    GreaterThanOrEqual: '大于等于',
    LessThan: '小于',
    LessThanOrEqual: '小于等于',
    In: 'In操作',
    NotIn: 'Not in 操作，参数和 in 一样',
    LikeLeft: '左模糊',
    LikeRight: '右模糊',
    NoEqual: '不等于',
    IsNullOrEmpty: '是null或者',
    IsNot: '情况1   value不等于null',
    NoLike: '模糊查询取反',
    EqualNull: '等于null',
    InLike: '多个like',
    Range: '区间',
    RangeDate: '区间（日期）'
  },
  system: {
    title: 'BearPlan 管理系统',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },

  common: {
    i18n: '国际化',
    placeholder: '请输入',
    placeholderSelect: '请选择',
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    backToHome: '返回首页',
    batchDelete: '批量删除',
    cancel: '取消',
    close: '关闭',
    cleanAndClose: '清空并关闭',
    check: '勾选',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    confirm: '确认',
    delete: '删除',
    deleteSuccess: '删除成功',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    preview: '预览',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    updateSuccess: '更新成功',
    userCenter: '个人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    }
  },
  theme: {
    themeSchema: {
      title: '主题模式',
      light: '亮色模式',
      dark: '暗黑模式',
      auto: '跟随系统'
    },
    grayscale: '灰色模式',
    colourWeakness: '色弱模式',
    layoutMode: {
      title: '布局模式',
      vertical: '左侧菜单模式',
      'vertical-mix': '左侧菜单混合模式',
      horizontal: '顶部菜单模式',
      'horizontal-mix': '顶部菜单混合模式',
      reverseHorizontalMix: '一级菜单与子级菜单位置反转'
    },
    recommendColor: '应用推荐算法的颜色',
    recommendColorDesc: '推荐颜色的算法参照',
    themeColor: {
      title: '主题颜色',
      primary: '主色',
      info: '信息色',
      success: '成功色',
      warning: '警告色',
      error: '错误色',
      followPrimary: '跟随主色'
    },
    scrollMode: {
      title: '滚动模式',
      wrapper: '外层滚动',
      content: '主体滚动'
    },
    page: {
      animate: '页面切换动画',
      mode: {
        title: '页面切换动画类型',
        'fade-slide': '滑动',
        fade: '淡入淡出',
        'fade-bottom': '底部消退',
        'fade-scale': '缩放消退',
        'zoom-fade': '渐变',
        'zoom-out': '闪现',
        none: '无'
      }
    },
    fixedHeaderAndTab: '固定头部和标签栏',
    header: {
      height: '头部高度',
      breadcrumb: {
        visible: '显示面包屑',
        showIcon: '显示面包屑图标'
      },
      multilingual: {
        visible: '显示多语言按钮'
      },
      globalSearch: {
        visible: '显示全局搜索'
      }
    },
    tab: {
      visible: '显示标签栏',
      cache: '标签栏信息缓存',
      height: '标签栏高度',
      mode: {
        title: '标签栏风格',
        chrome: '谷歌风格',
        button: '按钮风格'
      }
    },
    sider: {
      inverted: '深色侧边栏',
      width: '侧边栏宽度',
      collapsedWidth: '侧边栏折叠宽度',
      mixWidth: '混合布局侧边栏宽度',
      mixCollapsedWidth: '混合布局侧边栏折叠宽度',
      mixChildMenuWidth: '混合布局子菜单宽度'
    },
    footer: {
      visible: '显示底部',
      fixed: '固定底部',
      height: '底部高度',
      right: '底部局右'
    },
    watermark: {
      visible: '显示全屏水印',
      text: '水印文本',
      enableUserName: '水印显示用户名'
    },
    themeDrawerTitle: '主题配置',
    pageFunTitle: '页面功能',
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    }
  },
  page: {
    login: {
      intro: {
        heroName: 'BearPlan',
        heroText: '全栈重构 API 集成体验\n简单 · 精准 · 高效',
        tagline: '基于 .NET Core、Vue 3、Uni-App\n集成 SqlSugar、Element Plus、Wot Design Uni',
        stack: '',
        projectUrl: '项目地址',
        docs: '开发文档'
      },
      common: {
        loginOrRegister: '登录 / 注册',
        userNamePlaceholder: '请输入用户名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        passwordPlaceholder: '请输入密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        codeLogin: '验证码登录',
        confirm: '确定',
        back: '返回',
        validateSuccess: '验证成功',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来，{userName} ！'
      },
      pwdLogin: {
        title: '密码登录',
        rememberMe: '记住我',
        forgetPassword: '忘记密码？',
        register: '注册账号',
        otherAccountLogin: '其他账号登录',
        otherLoginMode: '其他登录方式',
        superAdmin: '超级管理员',
        admin: '管理员',
        user: '普通用户',
        wechatLogin: '微信登录'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        reGetCode: '{time}秒后重新获取',
        sendCodeSuccess: '验证码发送成功',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '注册账号',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        policy: '《隐私权政策》'
      },
      resetPwd: {
        title: '重置密码'
      },
      bindWeChat: {
        title: '微信登录',
        qrCodeTip: '请使用微信扫一扫',
        clickToRefresh: '点击刷新二维码',
        backToPwdLogin: '使用账号登录',
        status_Waiting: '请使用微信扫一扫',
        status_Scanned: '已扫码，请确认登录',
        status_Confirmed: '登录成功，正在跳转...',
        status_Unbound: '该微信号未绑定系统账号，请先绑定',
        status_Expired: '二维码已失效，请点击刷新'
      }
    },
    home: {
      branchDesc: '基于 Vue3、Vite、Element Plus 的中后台解决方案',
      greeting: '你好，{name}！',
      weatherDesc: '今天多云转晴，20℃ - 26℃，出门记得带伞哦',
      projectCount: '项目数量',
      todo: '待办',
      message: '消息',
      downloadCount: '下载量',
      registerCount: '注册量',
      schedule: '排班表',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      visitCount: '访问量',
      turnover: '成交额',
      dealCount: '成交量',
      projectNews: {
        title: '项目动态',
        moreNews: '更多动态',
        desc1: '基线升级至 .NET 10 与 Vue 3.5',
        desc2: '新增 Quartz.NET 调度任务管理页面',
        desc3: '系统模块完成标准列表页模式统一',
        desc4: '微信扫码登录兼容 Unbound 状态',
        desc5: '优化表格列设置与导出体验'
      },
      creativity: '创作'
    }
  },
  route: {
    home: '首页',
    exception: '异常页',
    exception_403: '无权限',
    exception_404: '页面不存在',
    exception_500: '服务器错误',
    document: '文档',
    document_project: '项目文档',
    'document_project-link': '项目链接',
    document_vue: 'Vue 文档',
    document_vite: 'Vite 文档',
    document_unocss: 'UnoCSS 文档',
    document_naive: 'NaiveUI 文档',
    document_antd: 'AntDesign 文档',
    'document_element-plus': 'Element Plus 文档',
    document_alova: 'Alova 文档',
    403: '无权限',
    404: '页面不存在',
    500: '服务器错误',
    background: '后台',
    configprovider: '组件功能',
    'configprovider_form-designer': '表单设计器',
    configprovider_i18n: '国际化',
    configprovider_table: '表格功能',
    configprovider_table_form: '表单表格',
    configprovider_table_test: '测试表格',
    configprovider_table_view: '查看表格',
    'iframe-page': '外部页面',
    login: '登录',
    manage: '系统管理',
    manage_dept: '部门管理',
    manage_job: '职位管理',
    manage_menu: '菜单管理',
    manage_online: '在线用户',
    manage_online_user: '在线用户',
    manage_role: '角色管理',
    manage_user: '用户管理',
    'manage_user-detail': '用户详情',
    message: '消息',
    message_email: '邮件',
    message_email_account: '邮件账号',
    message_email_message: '邮件消息',
    message_email_message_template: '邮件模板',
    message_email_queued: '邮件队列',
    monitor: '监控',
    monitor_audit: '审计',
    monitor_audit_log: '审计日志',
    monitor_exceptio: '异常',
    monitor_exceptio_log: '异常日志',
    monitor_server: '服务器监控',
    monitor_sms: '短信日志',
    monitor_task: '任务',
    monitor_task_log: '任务日志',
    system: '系统管理',
    system_apis: '接口管理',
    system_app: '应用管理',
    system_app_secret: '应用密钥',
    system_dict: '字典管理',
    system_file: '文件管理',
    system_file_record: '文件记录',
    system_quartz: '任务调度',
    system_quartz_net: '调度任务',
    system_setting: '系统配置',
    system_tenant: '多租户',
    system_token: '令牌管理',
    system_token_blacklist: '令牌黑名单'
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有'
  },
  icon: {
    themeConfig: '主题配置',
    background: '背景',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定'
  },
  datatable: {
    itemCount: '共 {total} 条'
  },
  form: {
    required: '必填',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确'
    },
    confirmPwd: {
      required: '请再次输入密码',
      invalid: '两次输入的密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  }
};
export default local;
