# Azure Custom Vision Integration Checklist

Complete this checklist to ensure successful Azure Custom Vision integration.

## ✅ Integration Status

### Phase 1: Setup & Configuration

- [ ] **Azure Resource Created**
  - [ ] Custom Vision resource created in Azure Portal
  - [ ] Training resource provisioned
  - [ ] Prediction resource provisioned
  - [ ] Pricing tier selected (F0/S0)
  
- [ ] **API Credentials Obtained**
  - [ ] Prediction Key copied from Azure Portal
  - [ ] Endpoint URL copied
  - [ ] Project ID noted
  - [ ] Iteration name recorded

- [ ] **Environment Variables Configured**
  - [ ] `.env.local` file created
  - [ ] `AZURE_CUSTOM_VISION_PREDICTION_KEY` set
  - [ ] `AZURE_CUSTOM_VISION_ENDPOINT` set
  - [ ] `AZURE_CUSTOM_VISION_PROJECT_ID` set
  - [ ] `AZURE_CUSTOM_VISION_ITERATION_NAME` set
  - [ ] `ENABLE_AZURE_VISION=true` set

### Phase 2: Model Training

- [ ] **Training Data Prepared**
  - [ ] Minimum 50 genuine seed images collected
  - [ ] Minimum 50 fake seed images collected
  - [ ] Images are clear and well-lit
  - [ ] Images show complete product labels
  - [ ] Images are < 4MB each

- [ ] **Custom Vision Project Created**
  - [ ] Logged into https://www.customvision.ai/
  - [ ] New project created
  - [ ] Classification type: Multiclass selected
  - [ ] Domain: General (compact) selected

- [ ] **Images Uploaded and Tagged**
  - [ ] Genuine seeds uploaded with tags (e.g., "BPT-5204-Genuine")
  - [ ] Fake seeds uploaded with tags (e.g., "Fake", "Counterfeit")
  - [ ] All images properly tagged
  - [ ] Tags are consistent and descriptive

- [ ] **Model Trained**
  - [ ] Quick Training completed successfully
  - [ ] Performance metrics reviewed:
    - [ ] Precision > 85%
    - [ ] Recall > 85%
    - [ ] AP (Average Precision) > 85%
  - [ ] Model published with iteration name

### Phase 3: Code Integration

- [ ] **Dependencies Installed**
  ```bash
  ✓ @azure/cognitiveservices-customvision-prediction
  ✓ @azure/ms-rest-js
  ```

- [ ] **Files Created**
  - [ ] `src/lib/azure/custom-vision.ts` - Main service
  - [ ] `src/lib/azure/custom-vision-fallback.ts` - Error handling
  - [ ] `src/components/farmer/verification-result.tsx` - UI component
  - [ ] `supabase/migrations/20260109_add_vision_ai_fields.sql` - Database migration

- [ ] **Files Updated**
  - [ ] `src/app/actions/verification.ts` - Server action updated
  - [ ] `src/app/farmer/verify/page.tsx` - UI updated to use new component

- [ ] **Database Migration Applied**
  - [ ] Migration script reviewed
  - [ ] Migration executed successfully
  - [ ] New columns added to products table:
    - [ ] vision_ai_tag
    - [ ] vision_ai_confidence
    - [ ] seed_variety
    - [ ] vision_ai_predictions
  - [ ] Indexes created

### Phase 4: Testing

- [ ] **Local Development Testing**
  - [ ] Development server running (`npm run dev`)
  - [ ] Can access verify page at /farmer/verify
  - [ ] Image upload works
  - [ ] Verification returns results
  - [ ] Vision AI data displayed in results

- [ ] **Integration Testing**
  - [ ] Test with genuine seed image
    - [ ] Classification tag received
    - [ ] Confidence score > 75%
    - [ ] Status = "genuine"
  - [ ] Test with fake seed image
    - [ ] Classification tag received
    - [ ] Status = "fake" or "suspicious"
  - [ ] Test with various seed varieties
  - [ ] Verify seed variety extraction works

- [ ] **Error Handling Testing**
  - [ ] Test with invalid/missing credentials
    - [ ] Falls back gracefully
    - [ ] Shows appropriate error message
  - [ ] Test with network disconnected
    - [ ] Timeout handled properly
  - [ ] Test with oversized image (>4MB)
    - [ ] Error message displayed

- [ ] **Performance Testing**
  - [ ] API response time < 3 seconds
  - [ ] UI loads without errors
  - [ ] No console errors in browser
  - [ ] No memory leaks

### Phase 5: Optimization

- [ ] **Confidence Thresholds Tuned**
  - [ ] `VISION_GENUINE_THRESHOLD` adjusted based on testing
  - [ ] `VISION_SUSPICIOUS_THRESHOLD` adjusted based on testing
  - [ ] False positive rate acceptable
  - [ ] False negative rate acceptable

- [ ] **Caching Implemented** (Optional but recommended)
  - [ ] Cache mechanism in place for duplicate images
  - [ ] Cache expiration configured
  - [ ] Cache hit rate monitored

- [ ] **Monitoring Setup**
  - [ ] Azure Portal metrics enabled
  - [ ] API call logging enabled
  - [ ] Error logging configured
  - [ ] Usage tracking implemented

### Phase 6: Production Deployment

- [ ] **Pre-Deployment Checks**
  - [ ] All tests passing
  - [ ] No console errors
  - [ ] Environment variables documented
  - [ ] Secrets not in version control
  - [ ] `.env.local.example` updated

- [ ] **Production Environment**
  - [ ] Environment variables set in hosting platform
  - [ ] Azure resources in production region
  - [ ] Monitoring alerts configured
  - [ ] Error tracking enabled (Sentry, etc.)

- [ ] **Post-Deployment Verification**
  - [ ] Production app accessible
  - [ ] Azure Vision API working
  - [ ] Test verification with sample images
  - [ ] Monitor for errors in first 24 hours
  - [ ] Check API usage in Azure Portal

### Phase 7: Documentation

- [ ] **Documentation Completed**
  - [ ] Integration guide reviewed
  - [ ] API credentials stored securely
  - [ ] Team members trained
  - [ ] Troubleshooting guide accessible
  - [ ] Runbook created for common issues

- [ ] **User Communication**
  - [ ] Users informed of new AI features
  - [ ] Help documentation updated
  - [ ] FAQ updated with Vision AI questions

---

## 📊 Success Metrics

Track these metrics after deployment:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API Response Time | < 3s | - | ⏳ |
| Classification Accuracy | > 85% | - | ⏳ |
| False Positive Rate | < 10% | - | ⏳ |
| False Negative Rate | < 5% | - | ⏳ |
| API Uptime | > 99% | - | ⏳ |
| User Satisfaction | > 4/5 | - | ⏳ |

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module '@azure/cognitiveservices-customvision-prediction'"
**Solution:** Run `npm install` to install dependencies

### Issue: "Failed to classify image with Azure Custom Vision"
**Solution:** 
1. Check environment variables in `.env.local`
2. Verify Azure credentials in Azure Portal
3. Ensure model is published

### Issue: Low confidence scores
**Solution:** 
1. Add more training images (50+ per category)
2. Improve image quality
3. Balance training dataset
4. Retrain model with Advanced Training

### Issue: High API costs
**Solution:**
1. Implement caching for duplicate images
2. Optimize image compression before upload
3. Review rate limits and upgrade if needed

---

## 📞 Support Contacts

- **Azure Support:** https://azure.microsoft.com/support/
- **Custom Vision Docs:** https://docs.microsoft.com/azure/cognitive-services/custom-vision-service/
- **Project Lead:** [Your Name/Email]
- **Development Team:** [Team Contact]

---

## 🎯 Next Steps After Integration

1. [ ] Monitor API usage for first week
2. [ ] Collect user feedback on accuracy
3. [ ] Review misclassified predictions
4. [ ] Retrain model with new data
5. [ ] Optimize confidence thresholds
6. [ ] Implement advanced features:
   - [ ] Multi-model support (seeds, fertilizers, pesticides)
   - [ ] Batch processing
   - [ ] Mobile app integration
   - [ ] Offline model deployment

---

**Integration Completed Date:** _____________

**Completed By:** _____________

**Sign-off:** _____________
