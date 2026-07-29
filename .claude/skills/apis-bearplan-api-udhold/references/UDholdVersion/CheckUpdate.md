# IMPORTANT: Enforce before generating code (must not be violated)!!!

Before executing the code generation task, recite the following usage conventions and ensure compliance when generating.

## Usage Conventions

1. Follow the calling method shown in the example below.

## API



`[GET] /api/UDholdVersion/CheckUpdate`



## Response

Use the response data as needed:

```typescript
{
  id: string
  appKey: string | null
  version: string | null
  platform: 0 | 1 | 2
  arch: 0 | 1 | 2
  releaseNoteString: string | null
  status: 0 | 1 | 2 | 3
  isForceUpdate: boolean
  // [params1] start
  // [items] start
  // [items] end
  // [params1] end
  releaseNotes: string[] | null
}
```

## Usage Example

```typescript
Apis.UDholdVersion.CheckUpdate({
  params: {
    AppKey: '',
    Version: '',
    Platform: {},
    Arch: {}
  }
})

```
