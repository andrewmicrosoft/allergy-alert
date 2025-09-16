This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables Setup

This project supports environment-specific configuration files. Create the appropriate environment file based on your needs:

**Option 1: PowerShell Script (Windows)**
```bash
cp setEnv.ps1.template setEnv.ps1
```
Then fill in the correct values and run the script to set your environment variables.

**Option 2: Environment Files**
The application will automatically load environment variables in this priority order:
1. `.env.${NODE_ENV}.local` (e.g., `.env.development.local`, `.env.production.local`)
2. `.env.local` (loaded for all environments except test)
3. `.env.${NODE_ENV}` (e.g., `.env.development`, `.env.production`)
4. `.env` (default fallback)

**For Development:**
```bash
cp .env.development .env.development.local
# Edit .env.development.local with your actual credentials
```

**For Production:**
```bash
cp .env.production .env.production.local
# Edit .env.production.local with your actual credentials
```

### Running with Different Environments

```bash
# Development (default)
NODE_ENV=development node script.js

# Production
NODE_ENV=production node script.js

# Or set it in PowerShell
$env:NODE_ENV="production"
node script.js
```

### Required Environment Variables

- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key (required)
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL (required)

### Optional Environment Variables

- `AZURE_OPENAI_MODEL_NAME`: The model name to use (default: "gpt-4o")
- `AZURE_OPENAI_DEPLOYMENT`: The deployment name (default: "gpt-4o")
- `AZURE_OPENAI_API_VERSION`: The API version to use (default: "2024-08-01-preview")

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
