# IMPORTANT: Enforce before generating code (must not be violated)!!!

Before executing the code generation task, recite the following usage conventions and ensure compliance when generating.

## Usage Conventions

1. Follow the calling method shown in the example below.

## API

 (Auth policies: Permission)

`[GET] /api/Auth/GetInfo`



## Response

Use the response data as needed:

```typescript
{
  user: {
    id: string
    createBy: string | null
    createTime: string
    updateBy: string | null
    updateTime: string | null
    isDeleted: boolean
    userName: string | null
    nickName: string | null
    email: string | null
    enabled: boolean
    password: string | null
    deptId: string
    phone: string | null
    avatar: string | null
    passwordReSetTime: string | null
    sex: 1 | 2
    tenantId: number | null
    preferencesConfig: string | null
    dept: {
      id: string
      createBy: string | null
      createTime: string
      updateBy: string | null
      updateTime: string | null
      isDeleted: boolean
      name: string | null
      parentId: string
      sort: number
      enabled: boolean
      subCount: number
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      users: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        userName: string | null
        nickName: string | null
        email: string | null
        enabled: boolean
        password: string | null
        deptId: string
        phone: string | null
        avatar: string | null
        passwordReSetTime: string | null
        sex: 1 | 2
        tenantId: number | null
        preferencesConfig: string | null
        // [cycle] $.user.dept
        dept: Dept
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        roles: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          level: number
          description: string | null
          dataScopeType: 0 | 1 | 2 | 3 | 4 | 5
          authCode: string | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          menus: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            permission: string | null
            name: string | null
            pathParam: string | null
            layout: 1 | 2
            redirect: string | null
            component: string | null
            parentId: string | null
            menuType: 1 | 2 | 3
            iconType: 1 | 2
            status: boolean
            title: string | null
            keepAlive: boolean
            constant: boolean
            icon: string | null
            localIcon: string | null
            iconFontSize: number
            order: number
            href: string | null
            hideInMenu: boolean
            activeMenu: string | null
            multiTab: boolean
            fixedIndexInTab: number | null
            // [cycle] $.user.dept.users.[].roles.[].menus.[]
            parent: Menu
            // [params1] start
            // [items] start
            // [cycle] $.user.dept.users.[].roles.[].menus.[]
            // [items] end
            // [params1] end
            children: Menu[] | null
          }> | null
          // [params1] start
          // [items] start
          // [cycle] $.user.dept
          // [items] end
          // [params1] end
          depts: Dept[] | null
          // [params1] start
          // [items] start
          // [cycle] $.user.dept.users.[]
          // [items] end
          // [params1] end
          users: User[] | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          apis: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            group: string | null
            url: string | null
            version: 0 | 1 | 2 | 3 | 4 | 5 | 6
            description: string | null
            method: string | null
            isAudit: boolean
            // [params1] start
            // [items] start
            // [cycle] $.user.dept.users.[].roles.[]
            // [items] end
            // [params1] end
            roles: Role[] | null
          }> | null
        }> | null
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        jobs: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          sort: number
          enabled: boolean
          // [params1] start
          // [items] start
          // [cycle] $.user.dept.users.[]
          // [items] end
          // [params1] end
          users: User[] | null
        }> | null
        tenant: {
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          tenantId: number
          name: string | null
          description: string | null
          tenantType: 1 | 2
          configId: string | null
          dbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 900
          connectionString: string | null
          // [params1] start
          // [items] start
          // [cycle] $.user.dept.users.[]
          // [items] end
          // [params1] end
          users: User[] | null
        }
      }> | null
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      roles: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        name: string | null
        level: number
        description: string | null
        dataScopeType: 0 | 1 | 2 | 3 | 4 | 5
        authCode: string | null
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        menus: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          permission: string | null
          name: string | null
          pathParam: string | null
          layout: 1 | 2
          redirect: string | null
          component: string | null
          parentId: string | null
          menuType: 1 | 2 | 3
          iconType: 1 | 2
          status: boolean
          title: string | null
          keepAlive: boolean
          constant: boolean
          icon: string | null
          localIcon: string | null
          iconFontSize: number
          order: number
          href: string | null
          hideInMenu: boolean
          activeMenu: string | null
          multiTab: boolean
          fixedIndexInTab: number | null
          // [cycle] $.user.dept.roles.[].menus.[]
          parent: Menu
          // [params1] start
          // [items] start
          // [cycle] $.user.dept.roles.[].menus.[]
          // [items] end
          // [params1] end
          children: Menu[] | null
        }> | null
        // [params1] start
        // [items] start
        // [cycle] $.user.dept
        // [items] end
        // [params1] end
        depts: Dept[] | null
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        users: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          userName: string | null
          nickName: string | null
          email: string | null
          enabled: boolean
          password: string | null
          deptId: string
          phone: string | null
          avatar: string | null
          passwordReSetTime: string | null
          sex: 1 | 2
          tenantId: number | null
          preferencesConfig: string | null
          // [cycle] $.user.dept
          dept: Dept
          // [params1] start
          // [items] start
          // [cycle] $.user.dept.roles.[]
          // [items] end
          // [params1] end
          roles: Role[] | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          jobs: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            name: string | null
            sort: number
            enabled: boolean
            // [params1] start
            // [items] start
            // [cycle] $.user.dept.roles.[].users.[]
            // [items] end
            // [params1] end
            users: User[] | null
          }> | null
          tenant: {
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            tenantId: number
            name: string | null
            description: string | null
            tenantType: 1 | 2
            configId: string | null
            dbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 900
            connectionString: string | null
            // [params1] start
            // [items] start
            // [cycle] $.user.dept.roles.[].users.[]
            // [items] end
            // [params1] end
            users: User[] | null
          }
        }> | null
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        apis: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          group: string | null
          url: string | null
          version: 0 | 1 | 2 | 3 | 4 | 5 | 6
          description: string | null
          method: string | null
          isAudit: boolean
          // [params1] start
          // [items] start
          // [cycle] $.user.dept.roles.[]
          // [items] end
          // [params1] end
          roles: Role[] | null
        }> | null
      }> | null
    }
    // [params1] start
    // [items] start
    // [items] end
    // [params1] end
    roles: Array<{
      id: string
      createBy: string | null
      createTime: string
      updateBy: string | null
      updateTime: string | null
      isDeleted: boolean
      name: string | null
      level: number
      description: string | null
      dataScopeType: 0 | 1 | 2 | 3 | 4 | 5
      authCode: string | null
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      menus: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        permission: string | null
        name: string | null
        pathParam: string | null
        layout: 1 | 2
        redirect: string | null
        component: string | null
        parentId: string | null
        menuType: 1 | 2 | 3
        iconType: 1 | 2
        status: boolean
        title: string | null
        keepAlive: boolean
        constant: boolean
        icon: string | null
        localIcon: string | null
        iconFontSize: number
        order: number
        href: string | null
        hideInMenu: boolean
        activeMenu: string | null
        multiTab: boolean
        fixedIndexInTab: number | null
        // [cycle] $.user.roles.[].menus.[]
        parent: Menu
        // [params1] start
        // [items] start
        // [cycle] $.user.roles.[].menus.[]
        // [items] end
        // [params1] end
        children: Menu[] | null
      }> | null
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      depts: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        name: string | null
        parentId: string
        sort: number
        enabled: boolean
        subCount: number
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        users: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          userName: string | null
          nickName: string | null
          email: string | null
          enabled: boolean
          password: string | null
          deptId: string
          phone: string | null
          avatar: string | null
          passwordReSetTime: string | null
          sex: 1 | 2
          tenantId: number | null
          preferencesConfig: string | null
          // [cycle] $.user.roles.[].depts.[]
          dept: Dept
          // [params1] start
          // [items] start
          // [cycle] $.user.roles.[]
          // [items] end
          // [params1] end
          roles: Role[] | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          jobs: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            name: string | null
            sort: number
            enabled: boolean
            // [params1] start
            // [items] start
            // [cycle] $.user.roles.[].depts.[].users.[]
            // [items] end
            // [params1] end
            users: User[] | null
          }> | null
          tenant: {
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            tenantId: number
            name: string | null
            description: string | null
            tenantType: 1 | 2
            configId: string | null
            dbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 900
            connectionString: string | null
            // [params1] start
            // [items] start
            // [cycle] $.user.roles.[].depts.[].users.[]
            // [items] end
            // [params1] end
            users: User[] | null
          }
        }> | null
        // [params1] start
        // [items] start
        // [cycle] $.user.roles.[]
        // [items] end
        // [params1] end
        roles: Role[] | null
      }> | null
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      users: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        userName: string | null
        nickName: string | null
        email: string | null
        enabled: boolean
        password: string | null
        deptId: string
        phone: string | null
        avatar: string | null
        passwordReSetTime: string | null
        sex: 1 | 2
        tenantId: number | null
        preferencesConfig: string | null
        dept: {
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          parentId: string
          sort: number
          enabled: boolean
          subCount: number
          // [params1] start
          // [items] start
          // [cycle] $.user.roles.[].users.[]
          // [items] end
          // [params1] end
          users: User[] | null
          // [params1] start
          // [items] start
          // [cycle] $.user.roles.[]
          // [items] end
          // [params1] end
          roles: Role[] | null
        }
        // [params1] start
        // [items] start
        // [cycle] $.user.roles.[]
        // [items] end
        // [params1] end
        roles: Role[] | null
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        jobs: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          sort: number
          enabled: boolean
          // [params1] start
          // [items] start
          // [cycle] $.user.roles.[].users.[]
          // [items] end
          // [params1] end
          users: User[] | null
        }> | null
        tenant: {
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          tenantId: number
          name: string | null
          description: string | null
          tenantType: 1 | 2
          configId: string | null
          dbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 900
          connectionString: string | null
          // [params1] start
          // [items] start
          // [cycle] $.user.roles.[].users.[]
          // [items] end
          // [params1] end
          users: User[] | null
        }
      }> | null
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      apis: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        group: string | null
        url: string | null
        version: 0 | 1 | 2 | 3 | 4 | 5 | 6
        description: string | null
        method: string | null
        isAudit: boolean
        // [params1] start
        // [items] start
        // [cycle] $.user.roles.[]
        // [items] end
        // [params1] end
        roles: Role[] | null
      }> | null
    }> | null
    // [params1] start
    // [items] start
    // [items] end
    // [params1] end
    jobs: Array<{
      id: string
      createBy: string | null
      createTime: string
      updateBy: string | null
      updateTime: string | null
      isDeleted: boolean
      name: string | null
      sort: number
      enabled: boolean
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      users: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        userName: string | null
        nickName: string | null
        email: string | null
        enabled: boolean
        password: string | null
        deptId: string
        phone: string | null
        avatar: string | null
        passwordReSetTime: string | null
        sex: 1 | 2
        tenantId: number | null
        preferencesConfig: string | null
        dept: {
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          parentId: string
          sort: number
          enabled: boolean
          subCount: number
          // [params1] start
          // [items] start
          // [cycle] $.user.jobs.[].users.[]
          // [items] end
          // [params1] end
          users: User[] | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          roles: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            name: string | null
            level: number
            description: string | null
            dataScopeType: 0 | 1 | 2 | 3 | 4 | 5
            authCode: string | null
            // [params1] start
            // [items] start
            // [items] end
            // [params1] end
            menus: Array<{
              id: string
              createBy: string | null
              createTime: string
              updateBy: string | null
              updateTime: string | null
              isDeleted: boolean
              permission: string | null
              name: string | null
              pathParam: string | null
              layout: 1 | 2
              redirect: string | null
              component: string | null
              parentId: string | null
              menuType: 1 | 2 | 3
              iconType: 1 | 2
              status: boolean
              title: string | null
              keepAlive: boolean
              constant: boolean
              icon: string | null
              localIcon: string | null
              iconFontSize: number
              order: number
              href: string | null
              hideInMenu: boolean
              activeMenu: string | null
              multiTab: boolean
              fixedIndexInTab: number | null
              // [cycle] $.user.jobs.[].users.[].dept.roles.[].menus.[]
              parent: Menu
              // [params1] start
              // [items] start
              // [cycle] $.user.jobs.[].users.[].dept.roles.[].menus.[]
              // [items] end
              // [params1] end
              children: Menu[] | null
            }> | null
            // [params1] start
            // [items] start
            // [cycle] $.user.jobs.[].users.[].dept
            // [items] end
            // [params1] end
            depts: Dept[] | null
            // [params1] start
            // [items] start
            // [cycle] $.user.jobs.[].users.[]
            // [items] end
            // [params1] end
            users: User[] | null
            // [params1] start
            // [items] start
            // [items] end
            // [params1] end
            apis: Array<{
              id: string
              createBy: string | null
              createTime: string
              updateBy: string | null
              updateTime: string | null
              isDeleted: boolean
              group: string | null
              url: string | null
              version: 0 | 1 | 2 | 3 | 4 | 5 | 6
              description: string | null
              method: string | null
              isAudit: boolean
              // [params1] start
              // [items] start
              // [cycle] $.user.jobs.[].users.[].dept.roles.[]
              // [items] end
              // [params1] end
              roles: Role[] | null
            }> | null
          }> | null
        }
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        roles: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          level: number
          description: string | null
          dataScopeType: 0 | 1 | 2 | 3 | 4 | 5
          authCode: string | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          menus: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            permission: string | null
            name: string | null
            pathParam: string | null
            layout: 1 | 2
            redirect: string | null
            component: string | null
            parentId: string | null
            menuType: 1 | 2 | 3
            iconType: 1 | 2
            status: boolean
            title: string | null
            keepAlive: boolean
            constant: boolean
            icon: string | null
            localIcon: string | null
            iconFontSize: number
            order: number
            href: string | null
            hideInMenu: boolean
            activeMenu: string | null
            multiTab: boolean
            fixedIndexInTab: number | null
            // [cycle] $.user.jobs.[].users.[].roles.[].menus.[]
            parent: Menu
            // [params1] start
            // [items] start
            // [cycle] $.user.jobs.[].users.[].roles.[].menus.[]
            // [items] end
            // [params1] end
            children: Menu[] | null
          }> | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          depts: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            name: string | null
            parentId: string
            sort: number
            enabled: boolean
            subCount: number
            // [params1] start
            // [items] start
            // [cycle] $.user.jobs.[].users.[]
            // [items] end
            // [params1] end
            users: User[] | null
            // [params1] start
            // [items] start
            // [cycle] $.user.jobs.[].users.[].roles.[]
            // [items] end
            // [params1] end
            roles: Role[] | null
          }> | null
          // [params1] start
          // [items] start
          // [cycle] $.user.jobs.[].users.[]
          // [items] end
          // [params1] end
          users: User[] | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          apis: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            group: string | null
            url: string | null
            version: 0 | 1 | 2 | 3 | 4 | 5 | 6
            description: string | null
            method: string | null
            isAudit: boolean
            // [params1] start
            // [items] start
            // [cycle] $.user.jobs.[].users.[].roles.[]
            // [items] end
            // [params1] end
            roles: Role[] | null
          }> | null
        }> | null
        // [params1] start
        // [items] start
        // [cycle] $.user.jobs.[]
        // [items] end
        // [params1] end
        jobs: Job[] | null
        tenant: {
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          tenantId: number
          name: string | null
          description: string | null
          tenantType: 1 | 2
          configId: string | null
          dbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 900
          connectionString: string | null
          // [params1] start
          // [items] start
          // [cycle] $.user.jobs.[].users.[]
          // [items] end
          // [params1] end
          users: User[] | null
        }
      }> | null
    }> | null
    tenant: {
      id: string
      createBy: string | null
      createTime: string
      updateBy: string | null
      updateTime: string | null
      isDeleted: boolean
      tenantId: number
      name: string | null
      description: string | null
      tenantType: 1 | 2
      configId: string | null
      dbType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 900
      connectionString: string | null
      // [params1] start
      // [items] start
      // [items] end
      // [params1] end
      users: Array<{
        id: string
        createBy: string | null
        createTime: string
        updateBy: string | null
        updateTime: string | null
        isDeleted: boolean
        userName: string | null
        nickName: string | null
        email: string | null
        enabled: boolean
        password: string | null
        deptId: string
        phone: string | null
        avatar: string | null
        passwordReSetTime: string | null
        sex: 1 | 2
        tenantId: number | null
        preferencesConfig: string | null
        dept: {
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          parentId: string
          sort: number
          enabled: boolean
          subCount: number
          // [params1] start
          // [items] start
          // [cycle] $.user.tenant.users.[]
          // [items] end
          // [params1] end
          users: User[] | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          roles: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            name: string | null
            level: number
            description: string | null
            dataScopeType: 0 | 1 | 2 | 3 | 4 | 5
            authCode: string | null
            // [params1] start
            // [items] start
            // [items] end
            // [params1] end
            menus: Array<{
              id: string
              createBy: string | null
              createTime: string
              updateBy: string | null
              updateTime: string | null
              isDeleted: boolean
              permission: string | null
              name: string | null
              pathParam: string | null
              layout: 1 | 2
              redirect: string | null
              component: string | null
              parentId: string | null
              menuType: 1 | 2 | 3
              iconType: 1 | 2
              status: boolean
              title: string | null
              keepAlive: boolean
              constant: boolean
              icon: string | null
              localIcon: string | null
              iconFontSize: number
              order: number
              href: string | null
              hideInMenu: boolean
              activeMenu: string | null
              multiTab: boolean
              fixedIndexInTab: number | null
              // [cycle] $.user.tenant.users.[].dept.roles.[].menus.[]
              parent: Menu
              // [params1] start
              // [items] start
              // [cycle] $.user.tenant.users.[].dept.roles.[].menus.[]
              // [items] end
              // [params1] end
              children: Menu[] | null
            }> | null
            // [params1] start
            // [items] start
            // [cycle] $.user.tenant.users.[].dept
            // [items] end
            // [params1] end
            depts: Dept[] | null
            // [params1] start
            // [items] start
            // [cycle] $.user.tenant.users.[]
            // [items] end
            // [params1] end
            users: User[] | null
            // [params1] start
            // [items] start
            // [items] end
            // [params1] end
            apis: Array<{
              id: string
              createBy: string | null
              createTime: string
              updateBy: string | null
              updateTime: string | null
              isDeleted: boolean
              group: string | null
              url: string | null
              version: 0 | 1 | 2 | 3 | 4 | 5 | 6
              description: string | null
              method: string | null
              isAudit: boolean
              // [params1] start
              // [items] start
              // [cycle] $.user.tenant.users.[].dept.roles.[]
              // [items] end
              // [params1] end
              roles: Role[] | null
            }> | null
          }> | null
        }
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        roles: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          level: number
          description: string | null
          dataScopeType: 0 | 1 | 2 | 3 | 4 | 5
          authCode: string | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          menus: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            permission: string | null
            name: string | null
            pathParam: string | null
            layout: 1 | 2
            redirect: string | null
            component: string | null
            parentId: string | null
            menuType: 1 | 2 | 3
            iconType: 1 | 2
            status: boolean
            title: string | null
            keepAlive: boolean
            constant: boolean
            icon: string | null
            localIcon: string | null
            iconFontSize: number
            order: number
            href: string | null
            hideInMenu: boolean
            activeMenu: string | null
            multiTab: boolean
            fixedIndexInTab: number | null
            // [cycle] $.user.tenant.users.[].roles.[].menus.[]
            parent: Menu
            // [params1] start
            // [items] start
            // [cycle] $.user.tenant.users.[].roles.[].menus.[]
            // [items] end
            // [params1] end
            children: Menu[] | null
          }> | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          depts: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            name: string | null
            parentId: string
            sort: number
            enabled: boolean
            subCount: number
            // [params1] start
            // [items] start
            // [cycle] $.user.tenant.users.[]
            // [items] end
            // [params1] end
            users: User[] | null
            // [params1] start
            // [items] start
            // [cycle] $.user.tenant.users.[].roles.[]
            // [items] end
            // [params1] end
            roles: Role[] | null
          }> | null
          // [params1] start
          // [items] start
          // [cycle] $.user.tenant.users.[]
          // [items] end
          // [params1] end
          users: User[] | null
          // [params1] start
          // [items] start
          // [items] end
          // [params1] end
          apis: Array<{
            id: string
            createBy: string | null
            createTime: string
            updateBy: string | null
            updateTime: string | null
            isDeleted: boolean
            group: string | null
            url: string | null
            version: 0 | 1 | 2 | 3 | 4 | 5 | 6
            description: string | null
            method: string | null
            isAudit: boolean
            // [params1] start
            // [items] start
            // [cycle] $.user.tenant.users.[].roles.[]
            // [items] end
            // [params1] end
            roles: Role[] | null
          }> | null
        }> | null
        // [params1] start
        // [items] start
        // [items] end
        // [params1] end
        jobs: Array<{
          id: string
          createBy: string | null
          createTime: string
          updateBy: string | null
          updateTime: string | null
          isDeleted: boolean
          name: string | null
          sort: number
          enabled: boolean
          // [params1] start
          // [items] start
          // [cycle] $.user.tenant.users.[]
          // [items] end
          // [params1] end
          users: User[] | null
        }> | null
        // [cycle] $.user.tenant
        tenant: Tenant
      }> | null
    }
  }
  // [params1] start
  // [items] start
  // [items] end
  // [params1] end
  roles: string[] | null
  // [params1] start
  // [items] start
  // [items] end
  // [params1] end
  authCodes: string[] | null
}
```

## Usage Example

```typescript
Apis.Auth.GetInfo({})

```
