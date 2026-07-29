# IMPORTANT: Enforce before generating code (must not be violated)!!!

Before executing the code generation task, recite the following usage conventions and ensure compliance when generating.

## Usage Conventions

1. Follow the calling method shown in the example below.

## API



`[POST] /api/Auth/Login`


## Request Body

Pass the required request body in `data`:

```typescript
{
  userName: string
  password: string
  captcha: string | null
  captchaId: string | null
}
```

## Response

Use the response data as needed:

```typescript
{
  accessToken: string | null
  expires: string
  tokenType: string | null
  refreshToken: string | null
  refreshTokenExpires: string
}
```

## Usage Example

```typescript
Apis.Auth.Login({
  data: {
    userName: '',
    password: '',
    captcha: '',
    captchaId: ''
  }
})

```
