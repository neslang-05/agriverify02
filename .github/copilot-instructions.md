# Copilot Instructions — fake-seed-detection

Purpose: give AI coding agents the minimal, actionable context to be productive in this repository.

Architecture (big picture)
- Next.js app (app router) with server and edge runtimes. Main verification flow lives in server actions: [src/app/actions/verification.ts](src/app/actions/verification.ts#L1-L40).
- Edge pre-check API validates image quality and runs lightweight OCR at: [src/app/api/edge/validate-image/route.ts](src/app/api/edge/validate-image/route.ts#L1-L40). This file runs with `export const runtime = 'edge'` and must keep minimal dependencies.
- Azure integrations live under `src/lib/azure/*`:
  - Computer Vision OCR: [src/lib/azure/computer-vision-ocr.ts](src/lib/azure/computer-vision-ocr.ts#L1-L40)
  - Custom Vision prediction + fallbacks: [src/lib/azure/custom-vision.ts](src/lib/azure/custom-vision.ts#L1-L40) and [src/lib/azure/custom-vision-fallback.ts](src/lib/azure/custom-vision-fallback.ts#L1-L40)
- Supabase is used for persistence. Use `src/lib/supabase/server.ts` for server-side operations and `src/lib/supabase/client.ts` for browser flows.

Key workflows & developer commands
- Run dev: `npm run dev` (Next.js dev server). See `package.json` scripts.
- Build: `npm run build` and run prod: `npm run start`.
- Tests: `npm run test` (Jest). Test files live under `__tests__/` (e.g. `__tests__/azure-vision.test.ts`).
- Migrations: SQL files are in `supabase/migrations/` — apply with your Supabase workflow (e.g. `supabase db push`) as noted in docs.

Environment & feature flags (important vars)
- Azure Custom Vision: `AZURE_CUSTOM_VISION_PREDICTION_KEY`, `AZURE_CUSTOM_VISION_ENDPOINT`, `AZURE_CUSTOM_VISION_PROJECT_ID`, `AZURE_CUSTOM_VISION_ITERATION_NAME` (used by `src/lib/azure/custom-vision.ts`).
- Azure Computer Vision OCR: `AZURE_COMPUTER_VISION_ENDPOINT`, `AZURE_COMPUTER_VISION_KEY` (used by `src/lib/azure/computer-vision-ocr.ts`).
- Edge OCR (optional): `AZURE_EDGE_VISION_ENDPOINT`, `AZURE_EDGE_VISION_KEY` (edge route polls the operation URL).
- Feature flags referenced in docs: `ENABLE_AZURE_VISION`, `ENABLE_VISION_CACHE`, `ENABLE_OCR_VERIFICATION`.
- Confidence thresholds are configurable in env (examples in docs): `VISION_GENUINE_THRESHOLD`, `VISION_SUSPICIOUS_THRESHOLD`.

Project-specific conventions & patterns
- Edge vs Server: keep `src/app/api/edge/*` lightweight and free of Node-only modules; they run on the Vercel Edge runtime. Use `runtime = 'edge'` and avoid heavy SDKs there.
- Server actions: heavy work (Azure SDK calls, DB writes) happens in server actions like `uploadAndVerify` and `saveVerificationHistory`. Prefer server-only helper functions in `src/lib/*` to keep actions small.
- Singletons: Azure service wrappers create singletons (see `customVisionService` and private instance in `computer-vision-ocr.ts`). Do not reinitialize clients repeatedly — follow existing pattern.
- Fallback-first resilience: calls to Azure services are wrapped with fallbacks (see `custom-vision-fallback.ts`) — preserve that pattern when adding new external integrations.
- OCR/parsing rules: structured extraction uses regex-based heuristics in `computer-vision-ocr.ts` and the edge OCR in `validate-image/route.ts`. When improving extraction, extend those functions rather than replacing them globally.
- Frontend/Edge validation: client-side uses `src/lib/edge/validate-image-client.ts` to call the edge route. Keep request/response shapes aligned with `types/packet-verification.ts`.

Integration points to check when changing behavior
- Where verification is assembled: `src/app/actions/verification.ts` (vision + OCR combined). Changes here affect UI and history saving.
- Edge contract: `src/app/api/edge/validate-image/route.ts` response shape — both frontend and server rely on it for `canProceedToCloud` and `qualityScore`.
- Supabase migrations: when adding DB fields (vision-related), update `supabase/migrations/*.sql` to keep local/dev DB schema in sync.

Quick examples to reference
- To call OCR in server action:
  - import `performOCR` from `src/lib/azure/computer-vision-ocr.ts` and pass image Buffer.
- To classify with Azure (with fallbacks):
  - call `classifyWithFallback(imageBuffer, imageUrl)` from `src/lib/azure/custom-vision-fallback.ts`.
- To add a new env-driven feature flag: check existing usage pattern (docs and `uploadAndVerify` checks `process.env.AZURE_CUSTOM_VISION_PREDICTION_KEY` before calling Azure).

Notes for AI agents
- Avoid changing the edge runtime signature or adding Node-only dependencies to `src/app/api/edge/*` files.
- When modifying Azure clients, preserve existing error logs and fallback behavior; tests and runtime expect graceful degradation.
- Use file examples above for linkable context. If you add new external credentials, document them in `docs/AZURE_VISION_INTEGRATION.md` and `docs/AZURE_OCR_SETUP.md`.

Where to look first for common tasks
- Add/change classification logic: `src/lib/azure/custom-vision.ts` and `src/lib/azure/custom-vision-fallback.ts`.
- Improve OCR parsing: `src/lib/azure/computer-vision-ocr.ts` and edge `performAzureEdgeOCR`/`extractFieldsFromText` in `validate-image/route.ts`.
- Update UI display for OCR/vision results: `src/components/farmer/*` (e.g. `verification-result.tsx`, `quality-result.tsx`).

After making changes
- Run `npm run test` and `npm run dev` to validate behavior locally. Use sample images in `__tests__/fixtures/images/`.
- If schema changes are required, add a migration under `supabase/migrations/` and run your supabase migration workflow.

If anything above is unclear or you want additional examples (API shapes, more file links, or test guidance), tell me which area to expand.
