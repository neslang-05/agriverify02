# Build Configuration Guide

## Environment Setup

The application requires environment variables to be configured before building. A `.env.local` file has been created with placeholder values.

### Required Environment Variables

```env
# Supabase (Required for auth and database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Azure Computer Vision (Required for OCR)
AZURE_COMPUTER_VISION_ENDPOINT=your-vision-endpoint
AZURE_COMPUTER_VISION_KEY=your-vision-key

# Azure Custom Vision (Required for classification)
AZURE_CUSTOM_VISION_ENDPOINT=your-custom-vision-endpoint
AZURE_CUSTOM_VISION_PREDICTION_KEY=your-custom-vision-key
AZURE_CUSTOM_VISION_PROJECT_ID=your-project-id
AZURE_CUSTOM_VISION_ITERATION_NAME=your-iteration-name

# Azure OpenAI (Required for AI chat)
AZURE_OPENAI_ENDPOINT=your-openai-endpoint
AZURE_OPENAI_API_KEY=your-openai-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
```

See `.env.local.example` for a complete list with descriptions.

## Build Fixes Applied

### 1. Dynamic Route Configuration

The following pages now use `export const dynamic = 'force-dynamic'` to prevent static generation errors when using cookies:

- [src/app/page.tsx](src/app/page.tsx) - Home page with auth header
- [src/app/farmer/complaints/page.tsx](src/app/farmer/complaints/page.tsx) - User complaints list
- [src/app/farmer/complaints/new/page.tsx](src/app/farmer/complaints/new/page.tsx) - New complaint form
- [src/app/officer/complaints/page.tsx](src/app/officer/complaints/page.tsx) - Officer dashboard

This is required because these pages use the Next.js `cookies()` function for authentication checks.

### 2. Supabase Client Error Handling

Updated Supabase client creation to provide clearer error messages:

- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) - Server-side client with validation
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts) - Browser client with validation
- [src/components/layout/site-header.tsx](src/components/layout/site-header.tsx) - Graceful error handling

These changes ensure the build doesn't fail if Supabase credentials are missing, and provides helpful error messages.

### 3. Known Warnings

#### Middleware Deprecation
⚠️ **Warning**: "The 'middleware' file convention is deprecated. Please use 'proxy' instead."

This is a Next.js 16 deprecation warning. The middleware still works correctly. To resolve:
- Option 1: Rename [src/middleware.ts](src/middleware.ts) according to Next.js 16 conventions (future update)
- Option 2: Continue using as-is (middleware still functional)

#### npm Deprecation Warnings
The following npm warnings are from transitive dependencies and don't affect functionality:
- `inflight@1.0.6` - Memory leak in old dependency
- `node-domexception@1.0.0` - Platform-native alternative available
- `glob@7.2.3` - Outdated version in dependency tree

## Development Workflow

1. **First-time setup**:
   ```bash
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your actual credentials
   ```

2. **Development**:
   ```bash
   npm run dev
   ```

3. **Production build**:
   ```bash
   npm run build
   npm run start
   ```

## Troubleshooting

### Build fails with "Missing Supabase environment variables"
- Ensure `.env.local` exists and contains valid Supabase credentials
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### "Dynamic server usage" errors
- Pages using authentication (via `cookies()`) must have `export const dynamic = 'force-dynamic'`
- This is already configured for complaint and auth-related pages

### Azure service integration issues
- Verify all Azure credentials are correctly set in `.env.local`
- Check Azure resource endpoints are accessible
- Review [docs/AZURE_VISION_INTEGRATION.md](docs/AZURE_VISION_INTEGRATION.md) and [docs/AZURE_OCR_SETUP.md](docs/AZURE_OCR_SETUP.md)

## Next Steps

1. **Configure real credentials**: Replace placeholder values in `.env.local` with actual Azure and Supabase credentials
2. **Test the build**: Run `npm run build` to ensure everything compiles
3. **Test the application**: Run `npm run dev` and verify all features work
4. **Optional**: Address middleware deprecation warning by updating to Next.js 16 proxy convention
