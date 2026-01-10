# 🚀 Quick Start Guide - Azure Custom Vision Integration

## Overview
This guide will help you get Azure Custom Vision AI integration running in **under 30 minutes**.

---

## Prerequisites
- Azure account (Free tier available)
- Node.js 18+ installed
- Project running locally

---

## Step 1: Install Dependencies (Already Done ✅)

The required Azure packages are already installed:
```bash
✅ @azure/cognitiveservices-customvision-prediction
✅ @azure/ms-rest-js
```

---

## Step 2: Create Azure Custom Vision Resource (10 minutes)

### Quick Azure Setup:

1. **Go to Azure Portal:** https://portal.azure.com

2. **Create Resource:**
   - Search: "Custom Vision"
   - Click "Create"
   - Fill in:
     - Name: `paddy-seed-classifier`
     - Region: `Southeast Asia` (or closest)
     - Pricing: `F0 (Free)` for both Training & Prediction
   - Click "Review + Create" → "Create"

3. **Get Credentials:**
   - Go to your resource → "Keys and Endpoint"
   - Copy:
     - ✅ Prediction Key
     - ✅ Endpoint URL

---

## Step 3: Train Your Model (10 minutes)

### Quick Training:

1. **Go to Custom Vision Portal:** https://www.customvision.ai/

2. **Create Project:**
   - Click "New Project"
   - Name: `Paddy Seed Classifier`
   - Resource: Select your Azure resource
   - Project Type: `Classification`
   - Classification Types: `Multiclass`
   - Domains: `General (compact)`

3. **Upload Training Images:**
   - **Genuine Seeds:** Upload 30+ images, tag as `genuine` or `BPT-5204-genuine`
   - **Fake Seeds:** Upload 30+ images, tag as `fake` or `counterfeit`

4. **Train:**
   - Click "Train" button (top right)
   - Select "Quick Training"
   - Wait 2-3 minutes

5. **Publish:**
   - Click "Publish"
   - Model name: `ProductionModel`
   - Click "Publish"

6. **Get Project Info:**
   - Click ⚙️ Settings icon
   - Copy:
     - ✅ Project ID
     - ✅ Iteration Name (e.g., `ProductionModel`)

---

## Step 4: Configure Application (2 minutes)

### Set Environment Variables:

1. **Create `.env.local` file:**
```bash
cp .env.local.example .env.local
```

2. **Edit `.env.local` and add:**
```bash
# Azure Custom Vision Configuration
AZURE_CUSTOM_VISION_PREDICTION_KEY=your_prediction_key_here
AZURE_CUSTOM_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_CUSTOM_VISION_PROJECT_ID=your_project_id_here
AZURE_CUSTOM_VISION_ITERATION_NAME=ProductionModel

# Enable Azure Vision
ENABLE_AZURE_VISION=true

# Thresholds (adjust based on your model)
VISION_GENUINE_THRESHOLD=0.75
VISION_SUSPICIOUS_THRESHOLD=0.50
```

---

## Step 5: Run & Test (5 minutes)

### Start Development Server:

```bash
npm run dev
```

### Test the Integration:

1. Open browser: http://localhost:3000/farmer/verify

2. **Upload a seed packet image**

3. **Fill in details:**
   - Crop Type: `Paddy`
   - District: Any district

4. **Click "Verify Product"**

5. **Check Results:**
   - ✅ Vision AI classification displayed
   - ✅ Confidence score shown
   - ✅ Seed variety detected (if applicable)
   - ✅ Risk factors listed
   - ✅ Recommendations provided

### Verify Console Output:
```bash
✓ Azure Custom Vision API call successful
✓ Classification: genuine (85.5% confidence)
✓ Seed variety: BPT-5204
```

---

## Step 6: Database Setup (Optional)

### If using Supabase/PostgreSQL:

```bash
# Navigate to migration file
cd supabase/migrations

# Apply migration (if using Supabase CLI)
supabase db push
```

Or manually run the SQL file in your database:
- `supabase/migrations/20260109_add_vision_ai_fields.sql`

---

## 🎉 Success Checklist

- [ ] Azure Custom Vision resource created
- [ ] Model trained and published
- [ ] Environment variables configured
- [ ] Application running locally
- [ ] Test verification successful
- [ ] Vision AI results displayed

---

## 🐛 Troubleshooting

### Issue: "Failed to classify image"
**Solution:** 
- Check `.env.local` has correct credentials
- Verify model is published in Custom Vision Portal
- Check Azure Portal for resource status

### Issue: Low confidence scores
**Solution:**
- Add more training images (50+ per category)
- Use clear, well-lit images
- Balance training dataset (equal genuine/fake)

### Issue: Module not found error
**Solution:**
```bash
npm install
```

---

## 📚 Full Documentation

For detailed setup and advanced configuration:
- [Complete Integration Guide](./AZURE_VISION_INTEGRATION.md)
- [Integration Checklist](./INTEGRATION_CHECKLIST.md)
- [Integration Summary](./INTEGRATION_SUMMARY.md)

---

## 🎯 What's Next?

1. **Collect More Data:** Add more training images for better accuracy
2. **Fine-tune Thresholds:** Adjust confidence thresholds based on testing
3. **Monitor Performance:** Check Azure Portal for API usage
4. **Production Deploy:** Deploy to Vercel/Azure with environment variables

---

## 💡 Pro Tips

1. **Free Tier Limits:**
   - 10,000 predictions/month
   - Perfect for development & testing

2. **Image Requirements:**
   - Size: < 4MB
   - Format: JPEG, PNG
   - Resolution: 256x256 minimum

3. **Training Best Practices:**
   - 50+ images per category
   - Diverse lighting conditions
   - Various angles and distances

4. **Optimize Costs:**
   - Enable caching for duplicate images
   - Compress images before upload
   - Use batch processing

---

## 🤝 Need Help?

- Review documentation in `docs/` folder
- Check Azure Custom Vision docs
- Create a GitHub issue
- Contact team lead

---

**Estimated Total Time:** 30 minutes  
**Difficulty Level:** Beginner-Friendly  
**Cost:** Free (with Azure Free Tier)

---

**Ready to go? Start with Step 2!** 🚀
