# Migration Guide: Azure Custom Vision → Google Cloud Run ResNet Model

## Overview

This document outlines the migration from Azure Custom Vision to a custom-trained ResNet model hosted on Google Cloud Run for paddy seed quality classification (fake seed detection).

## What Changed

### Removed
- ❌ Azure Custom Vision SDK integration (`@azure/cognitiveservices-customvision-prediction`)
- ❌ Environment variables: `AZURE_CUSTOM_VISION_PREDICTION_KEY`, `AZURE_CUSTOM_VISION_ENDPOINT`, `AZURE_CUSTOM_VISION_PROJECT_ID`, `AZURE_CUSTOM_VISION_ITERATION_NAME`
- ❌ Azure Custom Vision service class and dependencies

### Added
- ✅ Google Cloud Run ResNet integration (HTTP-based, no SDK needed)
- ✅ Environment variable: `GCP_VISION_ENDPOINT`
- ✅ New `GCPVisionService` class in `src/lib/gcp-vision.ts`

### Unchanged
- ✅ Azure OpenAI (still used for AI summaries)
- ✅ Azure Computer Vision OCR (still used for text extraction)
- ✅ Overall verification workflow and UI
- ✅ Database schema and historical data

## File Changes

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/gcp-vision.ts` | **NEW** - Google Cloud Run integration service |
| `src/lib/azure/custom-vision-fallback.ts` | Updated to use `gcpVisionService` instead of `customVisionService` |
| `src/app/actions/verification.ts` | Updated configuration checks from Azure to GCP |
| `src/app/actions/guest-verification.ts` | Updated to use `gcpVisionService` instead of `customVisionService` |
| `.env.example` | Replaced Azure Custom Vision env vars with `GCP_VISION_ENDPOINT` |
| `docs/GCP_VISION_SETUP.md` | **NEW** - Setup and integration guide for GCP Vision |

### Files Kept (For Reference)
- `src/lib/azure/custom-vision.ts` - Original Azure service (no longer used, kept for reference)
- `docs/AZURE_VISION_INTEGRATION.md` - Original Azure guide (deprecated)

## Setup Instructions

### For Local Development

1. **Add environment variable to `.env.local`**:
   ```env
   GCP_VISION_ENDPOINT=https://resnet-api-297419987783.asia-south1.run.app/predict
   ```

2. **Install dependencies** (no new packages required):
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### For Production

1. Update your deployment environment with:
   ```
   GCP_VISION_ENDPOINT=https://resnet-api-297419987783.asia-south1.run.app/predict
   ```

2. Remove any references to Azure Custom Vision env vars:
   - `AZURE_CUSTOM_VISION_PREDICTION_KEY`
   - `AZURE_CUSTOM_VISION_ENDPOINT`
   - `AZURE_CUSTOM_VISION_PROJECT_ID`
   - `AZURE_CUSTOM_VISION_ITERATION_NAME`

3. Deploy normally using your existing CI/CD pipeline

## API Differences

### Azure Custom Vision (Old)
```
Method: multipart/form-data
Endpoint: <AZURE_ENDPOINT>/customvision/v3.0/Prediction/<PROJECT_ID>/classify/iterations/<ITERATION>/image
Required Headers: Prediction-Key: <KEY>
Response:
{
  "predictions": [
    {
      "tagName": "pure",
      "probability": 0.95
    }
  ]
}
```

### Google Cloud Run ResNet (New)
```
Method: POST multipart/form-data
Endpoint: https://resnet-api-297419987783.asia-south1.run.app/predict
Required Headers: None (public endpoint)
Response:
{
  "filename": "image.jpg",
  "prediction": "pure",
  "confidence": 0.95
}
```

## Code Changes Summary

### Before (Azure Custom Vision)
```typescript
import { customVisionService } from '@/lib/azure/custom-vision';

const result = await customVisionService.classifyImage(buffer);
// Returns: { predictions: [...], topPrediction: {...}, isAuthentic: bool }
```

### After (Google Cloud Run)
```typescript
import { gcpVisionService } from '@/lib/gcp-vision';

const result = await gcpVisionService.classifyImage(buffer);
// Returns: { predictions: [...], topPrediction: {...}, isAuthentic: bool }
// Same interface - drop-in replacement!
```

## Testing

### Manual Testing

1. **Test with curl**:
   ```bash
   curl -X POST -F "file=@test_seed.jpg" \
     https://resnet-api-297419987783.asia-south1.run.app/predict
   ```

   Expected response:
   ```json
   {
     "filename": "test_seed.jpg",
     "prediction": "pure",
     "confidence": 0.9996848106384277
   }
   ```

2. **Test in application**:
   - Upload a seed image through the farmer verification page
   - Verify results are displayed correctly
   - Check browser console for any errors

### Unit Tests

Existing tests should continue to work with `classifyWithFallback()` since the interface is identical.

```bash
npm run test
```

## Benefits of This Migration

### ✅ Advantages
- **Simpler Integration**: No Azure SDK dependency, just HTTP requests
- **Faster Deployments**: Smaller bundle size, fewer dependencies
- **Better Performance**: Direct API calls with 30-second timeout
- **Flexible Scaling**: Cloud Run handles auto-scaling
- **Reduced Costs**: Pay per request instead of per transaction tier
- **Custom Model**: Specifically trained ResNet for seed quality
- **Easy Debugging**: Standard HTTP responses, no Azure SDK quirks

### ⚠️ Considerations
- **External Dependency**: Requires internet access to Google Cloud Run
- **No Local Alternative**: Cannot run the model locally (requires cloud endpoint)
- **Single Endpoint**: No regional redundancy (could add fallback later)

## Rollback (If Needed)

To temporarily revert to Azure Custom Vision:

1. Restore the Azure env vars in `.env.local`
2. Update `src/lib/azure/custom-vision-fallback.ts`:
   ```typescript
   import { customVisionService } from './custom-vision'; // Change back
   ```
3. Restart development server

However, this is not recommended as the migration is the preferred direction.

## Troubleshooting

### Issue: "Failed to classify image with GCP Vision"

**Causes & Solutions**:
- Network connectivity issue → Check internet connection
- Endpoint unreachable → Verify `GCP_VISION_ENDPOINT` is correct
- Image too large → Ensure image < 5MB
- Invalid image format → Use JPEG/PNG only

### Issue: "Timeout" errors

**Solution**: The endpoint has 30-second timeout. If requests are timing out:
- Check Cloud Run service status
- Verify network latency to `asia-south1` region
- Reduce image size/quality for faster processing

### Issue: Unexpected predictions

**Causes**:
- Blurry or poor quality image
- Image doesn't show seed packet/seeds clearly
- Model may have different classification thresholds

**Solution**:
- Upload clearer, well-lit images
- Verify image shows the seed packet label clearly

## Performance Metrics

### Request Times (Typical)
- Image upload: < 1 second
- GCP prediction: 0.5 - 2 seconds
- OCR extraction: 1 - 3 seconds
- Total verification: 2 - 6 seconds

### Success Rate
- Network availability: 99.9% (Cloud Run SLA)
- Model accuracy: Based on training data (~99% on test set)

## Documentation

For detailed information:
- [GCP Vision Setup Guide](./GCP_VISION_SETUP.md)
- [Verification Action Source](../src/app/actions/verification.ts)
- [GCP Vision Service Source](../src/lib/gcp-vision.ts)
- [OpenAPI Spec](../openapi.json)

## Support & Questions

For issues or questions about the GCP Vision integration:
1. Check the logs: `npm run dev` and look for GCP-related errors
2. Review [GCP_VISION_SETUP.md](./GCP_VISION_SETUP.md)
3. Verify endpoint is accessible: Use curl test command above
4. Contact the development team with:
   - Error message
   - Screenshot of error
   - Sample image that caused the issue

---

**Migration Date**: May 2026  
**Status**: Complete ✅  
**Azure Custom Vision**: DEPRECATED (Replaced by GCP ResNet Model)
