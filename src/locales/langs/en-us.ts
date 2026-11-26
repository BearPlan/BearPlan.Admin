const local: App.I18n.Schema = {
  enum: {
    asc: 'Asc',
    desc: 'Desc'
  },
  table: {
    table: 'Table',
    sorts: 'Sorts',
    selection: 'Selection',
    dragsort: 'DragSort',
    prop: 'Prop',
    label: 'Label',
    show: 'Show',
    hide: 'Hide',
    excel: 'Excel',
    columnType: 'ColumnType',
    searchType: 'SearchType',
    use: 'Use',
    setting: 'Setting',
    isMultiple: 'IsMultiple'
  },
  menu: {
    parent: 'Parent Menu',
    menuType: 'Menu Type',
    menuName: 'Menu Name',
    routeName: 'Route Name',
    routePath: 'Route Path',
    pathParam: 'Path Param',
    layout: 'Layout Component',
    page: 'Page Component',
    icon: 'Icon',
    iconType: 'Icon Type',
    order: 'Order',
    constant: 'Constant',
    keepAlive: 'Keep Alive',
    href: 'Href',
    hideInMenu: 'Hide In Menu',
    activeMenu: 'Active Menu',
    multiTab: 'Multi Tab',
    fixedIndexInTab: 'Fixed Index In Tab',
    query: 'Query Params',
    button: 'Button',
    buttonCode: 'Button Code',
    buttonDesc: 'Button Desc',
    menuStatus: 'Menu Status',
    addChildren: 'Add Children'
  },
  sqlSugar: {
    Equal: 'Equal',
    Like: 'Like',
    GreaterThan: 'GreaterThan',
    GreaterThanOrEqual: 'GreaterThanOrEqual',
    LessThan: 'LessThan',
    LessThanOrEqual: 'LessThanOrEqual',
    In: 'In',
    NotIn: 'NotIn',
    LikeLeft: 'LikeLeft',
    LikeRight: 'LikeRight',
    NoEqual: 'NoEqual',
    IsNullOrEmpty: 'IsNullOrEmpty',
    IsNot: 'IsNot',
    NoLike: 'NoLike',
    EqualNull: 'EqualNull',
    InLike: 'InLike',
    Range: 'Range',
    RangeDate: 'Range (Date)'
  },
  system: {
    title: 'Bear.Admin',
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  common: {
    i18n: 'I18n',
    placeholder: 'Please enter',
    placeholderSelect: 'Please select',
    action: 'Action',
    add: 'Add',
    addSuccess: 'Add Success',
    backToHome: 'Back to home',
    batchDelete: 'Batch Delete',
    cancel: 'Cancel',
    cleanAndClose: 'Clean and Close',
    close: 'Close',
    check: 'Check',
    expandColumn: 'Expand Column',
    columnSetting: 'Column Setting',
    config: 'Config',
    confirm: 'Confirm',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    confirmDelete: 'Are you sure you want to delete?',
    edit: 'Edit',
    warning: 'Warning',
    error: 'Error',
    index: 'Index',
    keywordSearch: 'Please enter keyword',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    lookForward: 'Coming soon',
    modify: 'Modify',
    modifySuccess: 'Modify Success',
    noData: 'No Data',
    operate: 'Operate',
    pleaseCheckValue: 'Please check whether the value is valid',
    preview: 'Preview',
    refresh: 'Refresh',
    reset: 'Reset',
    search: 'Search',
    switch: 'Switch',
    tip: 'Tip',
    trigger: 'Trigger',
    update: 'Update',
    updateSuccess: 'Update Success',
    userCenter: 'User Center',
    yesOrNo: {
      yes: 'Yes',
      no: 'No'
    }
  },
  theme: {
    themeSchema: {
      title: 'Theme Schema',
      light: 'Light',
      dark: 'Dark',
      auto: 'Follow System'
    },
    grayscale: 'Grayscale',
    colourWeakness: 'Colour Weakness',
    layoutMode: {
      title: 'Layout Mode',
      vertical: 'Vertical Menu Mode',
      horizontal: 'Horizontal Menu Mode',
      'vertical-mix': 'Vertical Mix Menu Mode',
      'horizontal-mix': 'Horizontal Mix menu Mode',
      reverseHorizontalMix: 'Reverse first level menus and child level menus position'
    },
    recommendColor: 'Apply Recommended Color Algorithm',
    recommendColorDesc: 'The recommended color algorithm refers to',
    themeColor: {
      title: 'Theme Color',
      primary: 'Primary',
      info: 'Info',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      followPrimary: 'Follow Primary'
    },
    scrollMode: {
      title: 'Scroll Mode',
      wrapper: 'Wrapper',
      content: 'Content'
    },
    page: {
      animate: 'Page Animate',
      mode: {
        title: 'Page Animate Mode',
        fade: 'Fade',
        'fade-slide': 'Slide',
        'fade-bottom': 'Fade Zoom',
        'fade-scale': 'Fade Scale',
        'zoom-fade': 'Zoom Fade',
        'zoom-out': 'Zoom Out',
        none: 'None'
      }
    },
    fixedHeaderAndTab: 'Fixed Header And Tab',
    header: {
      height: 'Header Height',
      breadcrumb: {
        visible: 'Breadcrumb Visible',
        showIcon: 'Breadcrumb Icon Visible'
      },
      multilingual: {
        visible: 'Display multilingual button'
      },
      globalSearch: {
        visible: 'Display Global Search'
      }
    },
    tab: {
      visible: 'Tab Visible',
      cache: 'Tag Bar Info Cache',
      height: 'Tab Height',
      mode: {
        title: 'Tab Mode',
        chrome: 'Chrome',
        button: 'Button'
      }
    },
    sider: {
      inverted: 'Dark Sider',
      width: 'Sider Width',
      collapsedWidth: 'Sider Collapsed Width',
      mixWidth: 'Mix Sider Width',
      mixCollapsedWidth: 'Mix Sider Collapse Width',
      mixChildMenuWidth: 'Mix Child Menu Width'
    },
    footer: {
      visible: 'Footer Visible',
      fixed: 'Fixed Footer',
      height: 'Footer Height',
      right: 'Right Footer'
    },
    watermark: {
      visible: 'Watermark Full Screen Visible',
      text: 'Watermark Text',
      enableUserName: 'Watermark Displays Username'
    },
    themeDrawerTitle: 'Theme Configuration',
    pageFunTitle: 'Page Function',
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    }
  },
  page: {
    login: {
      intro: {
        heroName: 'BearPlan',
        heroText: 'Full-stack API integration redefined\nSimple · Precise · Efficient',
        tagline: 'Based on .NET Core, Vue 3, Uni-App\nIntegrating SqlSugar, Element Plus, Wot Design Uni',
        stack: '',
        projectUrl: 'Project',
        docs: 'Docs'
      },
      common: {
        loginOrRegister: 'Login / Register',
        userNamePlaceholder: 'Please enter user name',
        phonePlaceholder: 'Please enter phone number',
        codePlaceholder: 'Please enter verification code',
        passwordPlaceholder: 'Please enter password',
        confirmPasswordPlaceholder: 'Please enter password again',
        codeLogin: 'Verification code login',
        confirm: 'Confirm',
        back: 'Back',
        validateSuccess: 'Verification passed',
        loginSuccess: 'Login successfully',
        welcomeBack: 'Welcome back, {userName} !'
      },
      pwdLogin: {
        title: 'Password Login',
        rememberMe: 'Remember me',
        forgetPassword: 'Forget password?',
        register: 'Register',
        otherAccountLogin: 'Other Account Login',
        otherLoginMode: 'Other Login Mode',
        superAdmin: 'Super Admin',
        admin: 'Admin',
        user: 'User',
        wechatLogin: 'WeChat Login'
      },
      codeLogin: {
        title: 'Verification Code Login',
        getCode: 'Get verification code',
        reGetCode: 'Reacquire after {time}s',
        sendCodeSuccess: 'Verification code sent successfully',
        imageCodePlaceholder: 'Please enter image verification code'
      },
      register: {
        title: 'Register',
        agreement: 'I have read and agree to',
        protocol: '《User Agreement》',
        policy: '《Privacy Policy》'
      },
      resetPwd: {
        title: 'Reset Password'
      },
      bindWeChat: {
        title: 'WeChat Login',
        qrCodeTip: 'Scan with WeChat',
        clickToRefresh: 'Click to refresh QR code',
        backToPwdLogin: 'Use account login',
        status_Waiting: 'Please scan with WeChat',
        status_Scanned: 'Scanned, please confirm login',
        status_Confirmed: 'Login successful, redirecting...',
        status_Unbound: 'This WeChat is not bound to any account, please bind first',
        status_Expired: 'QR code expired, please click to refresh'
      }
    },
    home: {
      branchDesc: 'A middle-back office solution based on Vue3, Vite and Element Plus',
      greeting: 'Hello, {name}!',
      weatherDesc: 'Cloudy to sunny today, 20℃ - 26℃, remember to bring an umbrella',
      projectCount: 'Project Count',
      todo: 'Todo',
      message: 'Message',
      downloadCount: 'Download Count',
      registerCount: 'Register Count',
      schedule: 'Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      visitCount: 'Visit Count',
      turnover: 'Turnover',
      dealCount: 'Deal Count',
      projectNews: {
        title: 'Project News',
        moreNews: 'More News',
        desc1: 'Baseline upgraded to .NET 10 and Vue 3.5',
        desc2: 'New Quartz.NET scheduler management page',
        desc3: 'System modules unified to standard list page mode',
        desc4: 'WeChat scan login compatible with Unbound status',
        desc5: 'Improved table column setting and export experience'
      },
      creativity: 'Creativity'
    }
  },
  route: {
    home: 'Home',
    exception: 'Exception',
    exception_403: 'Forbidden',
    exception_404: 'Not Found',
    exception_500: 'Server Error',
    document: 'Documentation',
    document_project: 'Project Doc',
    'document_project-link': 'Project Link',
    document_vue: 'Vue Doc',
    document_vite: 'Vite Doc',
    document_unocss: 'UnoCSS Doc',
    document_naive: 'NaiveUI Doc',
    document_antd: 'AntDesign Doc',
    'document_element-plus': 'Element Plus Doc',
    document_alova: 'Alova Doc',
    403: 'No Permission',
    404: 'Page Not Found',
    500: 'Server Error',
    background: 'Background',
    'iframe-page': 'External Page',
    login: 'Login',
    manage: 'System Manage',
    manage_dept: 'Department Manage',
    manage_job: 'Job Manage',
    manage_menu: 'Menu Manage',
    manage_online: 'Online User',
    manage_online_user: 'Online User',
    manage_role: 'Role Manage',
    manage_user: 'User Manage',
    'manage_user-detail': 'User Detail',
    message: 'Message',
    message_email: 'Email',
    message_email_account: 'Email Account',
    message_email_message: 'Email Message',
    message_email_message_template: 'Email Template',
    message_email_queued: 'Queued Email',
    monitor: 'Monitor',
    monitor_audit: 'Audit',
    monitor_audit_log: 'Audit Log',
    monitor_exceptio: 'Exception',
    monitor_exceptio_log: 'Exception Log',
    monitor_server: 'Server Monitor',
    monitor_sms: 'SMS Log',
    monitor_task: 'Task',
    monitor_task_log: 'Task Log',
    system: 'System Manage',
    system_apis: 'API Manage',
    system_app: 'App Manage',
    system_app_secret: 'App Secret',
    system_dict: 'Dict Manage',
    system_file: 'File Manage',
    system_file_record: 'File Record',
    system_quartz: 'Task Schedule',
    system_quartz_net: 'Scheduler',
    system_setting: 'System Setting',
    system_tenant: 'Tenant',
    system_token: 'Token Manage',
    system_token_blacklist: 'Token Blacklist'
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    background: 'Background',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin'
  },
  datatable: {
    itemCount: 'Total {total} items'
  },
  form: {
    required: 'Required',
    userName: {
      required: 'Please enter user name',
      invalid: 'User name format is incorrect'
    },
    phone: {
      required: 'Please enter phone number',
      invalid: 'Phone number format is incorrect'
    },
    pwd: {
      required: 'Please enter password',
      invalid: 'Password format is incorrect'
    },
    confirmPwd: {
      required: 'Please enter the password again',
      invalid: 'The two passwords are inconsistent'
    },
    code: {
      required: 'Please enter verification code',
      invalid: 'Verification code format is incorrect'
    },
    email: {
      required: 'Please enter email',
      invalid: 'Email format is incorrect'
    }
  }
};
export default local;
