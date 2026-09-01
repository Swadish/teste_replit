---
name: OpenAPI Zod compatibility
description: This workspace's generated validators use the installed Zod 3 API.
---

Generated validators currently target the installed Zod 3 API, so OpenAPI integer and email formats can emit unsupported Zod 4-style helpers. Prefer compatible numeric/string schemas unless the validator dependency is intentionally upgraded.

**Why:** Code generation succeeded but the generated library typecheck failed when the contract used integer and email constraints.

**How to apply:** If generated api-zod code reports missing `int` or `email` helpers, check the workspace Zod version before changing generated files; adjust the source contract or upgrade the dependency deliberately.