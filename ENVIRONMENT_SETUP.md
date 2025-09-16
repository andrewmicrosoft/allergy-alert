# Environment Variables Setup for Next.js

This project supports both server-side and client-side usage in Next.js applications.

## Server-Side Usage (Recommended)

For server-side API routes, API calls, and server components, use regular environment variables:

```bash
AZURE_OPENAI_API_KEY=your_actual_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_OPENAI_MODEL_NAME=gpt-4o
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

## Client-Side Usage (Use with Caution)

⚠️ **Security Warning**: Only use client-side environment variables if absolutely necessary. Exposing API keys in the browser is a security risk.

For client-side usage, prefix variables with `NEXT_PUBLIC_`:

```bash
NEXT_PUBLIC_AZURE_OPENAI_API_KEY=your_actual_api_key
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
```

## Environment Files

- `.env` - Default environment file
- `.env.local` - Local overrides (gitignored by default)
- `.env.production` - Production-specific variables

## Usage in Code

The `aiFunctions.mjs` module automatically detects the environment and uses the appropriate variables:

```javascript
// Automatically uses server-side or client-side variables as needed
const result = await getSafeFoodsByRestaurantName("Restaurant Name", ["allergy1", "allergy2"]);
```

## Best Practices

1. **Always use server-side variables when possible** - Keep API keys secure
2. **Use API routes** - Make API calls from Next.js API routes instead of client-side
3. **Environment-specific files** - Use `.env.local` for development secrets
4. **Never commit secrets** - Add `.env.local` to `.gitignore`