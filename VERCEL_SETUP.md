# Vercel Deployment Setup

## Critical Configuration Required

For this monorepo, the **Root Directory** must be set in the Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `scriptly-ai-ext`
3. Navigate to **Settings → General**
4. Find **"Root Directory"** section
5. Click **"Edit"**
6. Set to: `packages/website`
7. Click **"Save"**

## Why This is Required

Vercel detects Next.js framework **before** running build commands by checking the `package.json` file. Since Next.js is located in `packages/website/package.json` (not in the root), Vercel needs to know where to look.

## Verification

After setting Root Directory, verify:
- ✅ Build completes successfully
- ✅ Next.js is detected automatically
- ✅ All routes work correctly
- ✅ Deployment succeeds

## Current Build Configuration

- **Build Command**: `cd packages/website && pnpm install && pnpm build`
- **Install Command**: `pnpm install`
- **Framework**: Auto-detected (Next.js 15.0.3)

## Troubleshooting

If you still see "No Next.js version detected":
1. Verify Root Directory is set to `packages/website`
2. Check that the build completed successfully
3. Ensure `packages/website/package.json` contains `"next": "15.0.3"`
