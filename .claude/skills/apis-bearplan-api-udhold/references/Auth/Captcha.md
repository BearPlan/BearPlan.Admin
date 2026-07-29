# IMPORTANT: Enforce before generating code (must not be violated)!!!

Before executing the code generation task, recite the following usage conventions and ensure compliance when generating.

## Usage Conventions

1. Follow the calling method shown in the example below.

## API



`[GET] /api/Auth/Captcha`



## Response

Use the response data as needed:

```typescript
{
  img: string | null
  captchaId: string | null
  showCaptcha: boolean
}
```

## Usage Example

```typescript
Apis.Auth.Captcha({})

```
