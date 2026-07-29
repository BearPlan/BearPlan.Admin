# IMPORTANT: Enforce before generating code (must not be violated)!!!

Before executing the code generation task, recite the following usage conventions and ensure compliance when generating.

## Usage Conventions

1. Follow the calling method shown in the example below.

## API

 (Auth policies: Permission)

`[DELETE] /api/Auth/Logout`



## Response

Use the response data as needed:

```typescript
null
```

## Usage Example

```typescript
Apis.Auth.Logout({
  params: {
    refreshToken: ''
  }
})

```
