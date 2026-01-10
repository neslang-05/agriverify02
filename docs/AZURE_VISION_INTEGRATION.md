# Azure Custom Vision Integration Guide

## Overview

This guide will help you integrate Azure Custom Vision AI for paddy seed classification into the fake-seed-detection application.

## Prerequisites

- Azure subscription (Free tier available)
- Node.js 18+ and npm installed
- Next.js development environment set up
- Basic understanding of Azure Portal

---

## Step 1: Create Azure Custom Vision Resource

### 1.1 Create Resource in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource**
3. Search for **Custom Vision**
4. Click **Create** > **Custom Vision**
5. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose closest region (e.g., South India, Southeast Asia)
   - **Name**: `paddy-seed-classifier` (or your choice)
   - **Training pricing tier**: F0 (Free) or S0 (Standard)
   - **Prediction pricing tier**: F0 (Free) or S0 (Standard)
6. Click **Review + Create** then **Create**

### 1.2 Get API Credentials

1. After deployment, go to your Custom Vision resource
2. Navigate to **Keys and Endpoint**
3. Copy the following:
   - **Prediction Key** (Key 1 or Key 2)
   - **Endpoint URL**

---

## Step 2: Train Your Custom Vision Model

### 2.1 Create Project in Custom Vision Portal

1. Go to [Custom Vision Portal](https://www.customvision.ai/)
2. Sign in with your Azure account
3. Click **New Project**
4. Configure project:
   - **Name**: Paddy Seed Authenticity Classifier
   - **Description**: AI model to classify genuine vs fake paddy seeds
   - **Resource**: Select your Custom Vision resource
   - **Project Types**: Classification
   - **Classification Types**: Multiclass (Single tag per image)
   - **Domains**: General (compact) for mobile/edge deployment
5. Click **Create project**

### 2.2 Upload and Tag Training Images

**Genuine Seeds (Minimum 30-50 images per variety):**
- Tag examples: `BPT-5204-Genuine`, `MTU-1010-Genuine`, `Genuine`
- Images should show:
  - Clear certification marks
  - Hologram stickers
  - Proper packaging quality
  - Complete label information

**Fake/Counterfeit Seeds (Minimum 30-50 images):**
- Tag examples: `Fake`, `Counterfeit`, `Suspicious`
- Images should show:
  - Poor printing quality
  - Missing certification
  - Damaged packaging
  - Incomplete labels

**Upload Process:**
1. Click **Add images**
2. Select batch of images (up to 64 at once)
3. Add appropriate tags
4. Click **Upload files**
5. Repeat for all categories

### 2.3 Train the Model

1. Click **Train** button (top right)
2. Choose training type:
   - **Quick Training**: Faster, good for testing (recommended for start)
   - **Advanced Training**: Better accuracy (up to 1 hour)
3. Wait for training to complete (few minutes to 1 hour)
4. Review performance metrics:
   - **Precision**: % of correct positive predictions
   - **Recall**: % of actual positives found
   - **AP (Average Precision)**: Overall accuracy
   - Target: >85% for production use

### 2.4 Publish the Model

1. Click **Publish** button
2. Enter **Model name**: `ProductionModel` or `Iteration1`
3. Select **Prediction resource**
4. Click **Publish**
5. Note the **Published Iteration Name**

### 2.5 Get Project Details

1. Click ⚙️ **Settings** icon (top right)
2. Copy the following:
   - **Project Id**
   - **Iteration Name** (the one you just published)
3. Navigate to **Performance** tab
4. Click **Prediction URL**
5. Copy the full prediction endpoint URL

---

## Step 3: Configure Application

### 3.1 Set Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Azure credentials:

```bash
# Azure Custom Vision Configuration
AZURE_CUSTOM_VISION_PREDICTION_KEY=your_prediction_key_here
AZURE_CUSTOM_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_CUSTOM_VISION_PROJECT_ID=your_project_id_here
AZURE_CUSTOM_VISION_ITERATION_NAME=ProductionModel

# Feature Flags
ENABLE_AZURE_VISION=true
ENABLE_VISION_CACHE=true

# Confidence Thresholds (adjust based on your model's performance)
VISION_GENUINE_THRESHOLD=0.75
VISION_SUSPICIOUS_THRESHOLD=0.50
```

### 3.2 Install Dependencies

Dependencies are already installed. If needed:
```bash
npm install
```

### 3.3 Run Database Migration

If using Supabase or PostgreSQL:
```bash
# Apply migration for Vision AI fields
supabase db push

# Or manually run the SQL file:
# supabase/migrations/20260109_add_vision_ai_fields.sql
```

---

## Step 4: Test the Integration

### 4.1 Run Development Server

```bash
npm run dev
```

### 4.2 Test with Sample Images

1. Navigate to http://localhost:3000/farmer/verify
2. Upload a seed packet image
3. Select crop type and district
4. Click **Verify Product**
5. Check the results:
   - **Vision AI classification tag**
   - **Confidence score**
   - **Seed variety (if detected)**
   - **Risk factors**
   - **Recommendations**

### 4.3 Verify Console Logs

Check terminal for:
```
✓ Azure Custom Vision API call successful
✓ Classification: BPT-5204-Genuine (85.5% confidence)
```

---

## Step 5: Optimize and Monitor

### 5.1 Adjust Confidence Thresholds

Based on your model's performance, adjust in `.env.local`:

```bash
# If model is too strict (marking genuine as suspicious):
VISION_GENUINE_THRESHOLD=0.70  # Lower from 0.75

# If model is too lenient (marking fake as genuine):
VISION_GENUINE_THRESHOLD=0.80  # Raise from 0.75
```

### 5.2 Monitor API Usage

1. Go to Azure Portal
2. Navigate to your Custom Vision resource
3. Click **Metrics**
4. Monitor:
   - **Total Prediction Calls**
   - **Response Time**
   - **Errors**

### 5.3 Rate Limits

**Free Tier (F0):**
- 10,000 predictions/month
- 10 transactions per second (TPS)
- 2 projects max

**Standard Tier (S0):**
- Unlimited predictions (pay per 1,000 predictions)
- 10 TPS
- Unlimited projects

### 5.4 Improve Model Accuracy

1. Go to Custom Vision Portal
2. Click **Predictions** tab
3. Review misclassified images
4. Add them to training set with correct tags
5. Re-train model
6. Publish new iteration
7. Update `AZURE_CUSTOM_VISION_ITERATION_NAME` in `.env.local`

---

## Step 6: Production Deployment

### 6.1 Environment Variables in Production

Add these to your hosting platform (Vercel, Azure, AWS, etc.):

```bash
AZURE_CUSTOM_VISION_PREDICTION_KEY=***
AZURE_CUSTOM_VISION_ENDPOINT=***
AZURE_CUSTOM_VISION_PROJECT_ID=***
AZURE_CUSTOM_VISION_ITERATION_NAME=***
ENABLE_AZURE_VISION=true
```

### 6.2 Enable Caching (Recommended)

Implement Redis or in-memory cache for duplicate images:
- Reduces API calls
- Improves response time
- Saves costs

### 6.3 Error Handling

The application automatically falls back to rule-based verification if:
- Azure API is down
- Credentials are invalid
- Rate limit exceeded

---

## Troubleshooting

### Issue: "Failed to classify image with Azure Custom Vision"

**Solutions:**
1. Verify credentials in `.env.local`
2. Check Azure resource status in portal
3. Ensure prediction endpoint is published
4. Verify image size < 4MB

### Issue: Low confidence scores

**Solutions:**
1. Add more training images (minimum 50 per tag)
2. Improve image quality (clear, well-lit)
3. Balance training dataset (equal genuine/fake images)
4. Use Advanced Training instead of Quick Training

### Issue: "Rate limit exceeded"

**Solutions:**
1. Upgrade from Free (F0) to Standard (S0) tier
2. Implement caching to reduce API calls
3. Batch process images during off-peak hours

### Issue: Wrong classifications

**Solutions:**
1. Review misclassified predictions in Custom Vision Portal
2. Add problematic images to training set
3. Re-train and publish new iteration
4. Adjust confidence thresholds

---

## API Cost Estimation

### Free Tier (F0)
- **Cost**: $0
- **Limit**: 10,000 predictions/month
- **Suitable for**: Development, testing, small-scale deployments

### Standard Tier (S0)
- **Cost**: $2.00 per 1,000 predictions
- **Example**: 100,000 predictions/month = $200
- **Suitable for**: Production, high-traffic applications

---

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Rotate prediction keys regularly** (every 90 days)
3. **Use Azure Key Vault** for production secrets
4. **Enable Azure Monitor** for anomaly detection
5. **Implement rate limiting** in your application

---

## Next Steps

- [ ] Integrate real OCR service (Google Cloud Vision, Azure Computer Vision)
- [ ] Implement result caching with Redis
- [ ] Add analytics dashboard for prediction accuracy
- [ ] Create admin panel for model management
- [ ] Set up CI/CD pipeline for model updates
- [ ] Implement A/B testing for different model iterations

---

## Support Resources

- [Azure Custom Vision Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/custom-vision-service/)
- [Custom Vision Portal](https://www.customvision.ai/)
- [Azure Support](https://azure.microsoft.com/support/)
- [Project Issues](https://github.com/your-repo/issues)

---

## License & Credits

This integration uses Azure Custom Vision Service by Microsoft Azure.
