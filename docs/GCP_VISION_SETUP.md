# Google Cloud Run ResNet Vision Integration Guide

## Overview

This guide explains how to integrate the custom-trained ResNet model hosted on Google Cloud Run for paddy seed quality classification (fake seed detection) into the fake-seed-detection application.

## Key Information

- **Model Type**: ResNet (Custom-trained for seed purity classification)
- **Hosting**: Google Cloud Run
- **Endpoint**: `https://resnet-api-297419987783.asia-south1.run.app/predict`
- **API Method**: POST with multipart/form-data
- **Response Format**: 
  ```json
  {
    "filename": "image.jpg",
    "prediction": "pure|impure",
    "confidence": 0.9996848106384277
  }
  ```

## Getting Started

### 1. Environment Configuration

#### 1.1 Set Environment Variable

Add the GCP Vision endpoint to your `.env.local` file:

```env
# Google Cloud Run Custom Vision Model (Seed Classification)
GCP_VISION_ENDPOINT=https://resnet-api-297419987783.asia-south1.run.app/predict
```

**Note**: If you're using a custom endpoint or have a different deployment, replace the URL accordingly.

#### 1.2 Verify Setup

To verify the endpoint is accessible, you can test with a simple request:

```bash
curl -X POST -F "file=@test_image.jpg" \
  https://resnet-api-297419987783.asia-south1.run.app/predict
```

Expected response:
```json
{
  "filename": "test_image.jpg",
  "prediction": "pure",
  "confidence": 0.95
}
```

### 2. API Integration Details

#### 2.1 Request Format

- **Content-Type**: `multipart/form-data`
- **Field Name**: `file`
- **File Format**: JPEG, PNG, or other common image formats
- **Max File Size**: As per Cloud Run limits (typically 32MB)

#### 2.2 Response Format

The API returns a JSON object with:
- `filename`: The name of the uploaded file
- `prediction`: Classification result
  - `"pure"`: High-quality, authentic seeds (confidence ≥ 60%)
  - `"impure"`: Low-quality or counterfeit seeds
- `confidence`: Float value between 0 and 1 representing certainty

#### 2.3 Prediction Interpretation

| Prediction | Confidence Threshold | Status | Action |
|-----------|-------------------|--------|--------|
| `pure` | ≥ 0.60 | Genuine | Safe to plant |
| `pure` | < 0.60 | Suspicious | Verify further |
| `impure` | Any | Fake/Suspicious | Do not use |

### 3. Code Integration

The integration is automatically handled by the `GCPVisionService` class in `src/lib/gcp-vision.ts`:

#### 3.1 Basic Usage

```typescript
import { gcpVisionService } from '@/lib/gcp-vision';

// Convert image to buffer
const imageBuffer = Buffer.from(arrayBuffer);

// Classify image
const result = await gcpVisionService.classifyImage(imageBuffer);

console.log(result);
// Output:
// {
//   predictions: [{ tagName: 'pure', probability: 0.9996848106384277 }],
//   topPrediction: { tag: 'pure', confidence: 99.96848106384277 },
//   isAuthentic: true,
//   seedVariety: undefined
// }
```

#### 3.2 Error Handling

The service includes automatic fallback mechanisms:

1. **Primary**: Direct image buffer classification
2. **Fallback 1**: URL-based classification (if available)
3. **Fallback 2**: Returns error result to allow graceful degradation

```typescript
try {
  const result = await gcpVisionService.classifyImage(imageBuffer);
  // Process result
} catch (error) {
  console.error('Classification failed:', error);
  // Handle error or use fallback verification
}
```

### 4. Verification Workflow

The verification action in `src/app/actions/verification.ts` automatically:

1. Receives uploaded seed image from farmer
2. Converts image to buffer
3. Calls `classifyWithFallback()` which uses GCP Vision
4. Combines vision result with OCR analysis (if available)
5. Determines final verification status (genuine/suspicious/fake)
6. Saves results to database for audit trail

### 5. Performance Considerations

#### 5.1 Request Limits
- Max file size: Verify with your Cloud Run deployment
- Recommended: < 5MB JPEG/PNG images
- Timeout: 30 seconds per request

#### 5.2 Optimization Tips

1. **Image Compression**: Compress images before upload without losing quality
2. **Batch Processing**: For multiple images, process sequentially to avoid rate limits
3. **Caching**: Consider caching results for identical images (by hash)

### 6. Monitoring and Logging

#### 6.1 Error Logs

The service logs are available in:
- **Console**: During development (`npm run dev`)
- **Cloud Run Logs**: Via Google Cloud Console for production
- **Application Logs**: Check `verification.ts` for high-level flow logs

#### 6.2 Troubleshooting

**Issue**: Timeout errors
- **Solution**: Check network connectivity and Cloud Run service status
- **Check**: Verify endpoint URL is correct in `.env.local`

**Issue**: 401/403 Errors
- **Solution**: Ensure the endpoint is accessible; check CORS headers if calling from browser

**Issue**: Unexpected predictions
- **Solution**: Verify image quality and format; ensure image shows seed packets/seeds clearly

### 7. Alternative Endpoints

If you need to use a different Cloud Run deployment:

```env
# Custom endpoint
GCP_VISION_ENDPOINT=https://your-custom-region.run.app/predict
```

Update the environment variable and restart the application.

### 8. Future Enhancements

- Batch prediction API for multiple images
- Advanced confidence scoring with uncertainty quantification
- Seed variety classification based on visual characteristics
- Historical performance analytics

## Support

For issues with the GCP Vision integration:
1. Check Cloud Run logs in Google Cloud Console
2. Verify endpoint connectivity using curl
3. Review application logs in `_next/debug` during development
4. Contact support with error logs and sample images

## References

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [OpenAPI Specification](../openapi.json)
- [Verification Action Source](../src/app/actions/verification.ts)
- [GCP Vision Service Source](../src/lib/gcp-vision.ts)
