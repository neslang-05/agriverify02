# AI Summary Feature - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Configure Azure OpenAI (2 min)

1. **Create Azure OpenAI Resource**
   ```bash
   # In Azure Portal:
   # - Search "Azure OpenAI"
   # - Click "Create"
   # - Fill in resource details
   # - Create resource
   ```

2. **Deploy Model**
   ```bash
   # In Azure AI Studio:
   # - Go to your OpenAI resource
   # - Click "Deployments" → "Create"
   # - Select "gpt-5-mini" (or gpt-4o-mini)
   # - Name it "gpt-5-mini"
   # - Deploy
   ```

3. **Copy Credentials**
   ```bash
   # In Azure Portal:
   # - Go to your OpenAI resource
   # - Click "Keys and Endpoint"
   # - Copy KEY 1 and ENDPOINT
   ```

### Step 2: Add Environment Variables (1 min)

Add to `.env.local`:

```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Step 3: Test Connection (1 min)

```bash
node scripts/test-ai-summary.js
```

Expected output:
```
✅ All required environment variables are set
✅ Test 1: Good Quality Seeds - Response received
✅ Test 2: Poor Quality Seeds - Response received
✅ Test 3: Average Quality Seeds - Response received
🎉 Azure OpenAI AI Summary integration is working correctly!
```

### Step 4: Use in Your Code (1 min)

```typescript
// Import
import { processSeedImageWithAI } from '@/app/actions/guest-verification';
import { AISummaryCard } from '@/components/scanner/ai-summary-card';

// Process
const result = await processSeedImageWithAI(base64Image);

// Display
<AISummaryCard result={result} isGuest={true} />
```

Done! 🎉

## 📖 Common Use Cases

### Use Case 1: Guest Scanner

```typescript
'use client';

import { useState } from 'react';
import { processSeedImageWithAI } from '@/app/actions/guest-verification';
import { AISummaryCard } from '@/components/scanner/ai-summary-card';

export function GuestScanner() {
  const [result, setResult] = useState(null);
  
  async function handleScan(base64Image: string) {
    const verification = await processSeedImageWithAI(base64Image);
    setResult(verification);
  }
  
  return result ? (
    <AISummaryCard 
      result={result} 
      isGuest={true}
      onReset={() => setResult(null)}
      onLogin={() => router.push('/login')}
    />
  ) : (
    <ImageUploader onUpload={handleScan} />
  );
}
```

### Use Case 2: Authenticated Verification

```typescript
import { uploadAndVerifyWithAI } from '@/app/actions/verification';

async function handleVerify(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  
  const result = await uploadAndVerifyWithAI(formData);
  // Automatically saves to history
  
  return result;
}
```

### Use Case 3: Custom Integration

```typescript
import { interpreter } from '@/lib/openai/interpreter';
import { customVisionService } from '@/lib/azure/custom-vision';

async function customFlow(imageBuffer: Buffer, base64: string) {
  // Get predictions
  const vision = await customVisionService.classifyImage(imageBuffer);
  
  // Get AI summary
  const summary = await interpreter.synthesizeResult(base64, vision.predictions);
  
  // Use results
  console.log(summary.status);      // 'good' | 'average' | 'bad'
  console.log(summary.emoji);       // '🟢' | '🟡' | '🔴'
  console.log(summary.headline);    // 'Quality Looks Good'
  console.log(summary.explanation); // Simple message
  console.log(summary.action_recommendation); // What to do
}
```

## 🎯 What You Get

### For Users
- **Simple Language**: 6th-grade reading level
- **Confident Tone**: "This is good" not "might be good"
- **Clear Actions**: "Plant this" or "Report this"
- **Visual Feedback**: Emoji + color coding

### For Developers
- **Type Safety**: Full TypeScript support
- **Error Handling**: Automatic fallbacks
- **Flexible Display**: Guest vs authenticated tiers
- **Database Ready**: Save UI + technical data

## 🔧 Customization

### Change Model

```env
# Use GPT-4o-mini instead
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
```

### Adjust Tone

Edit `src/lib/openai/interpreter.ts`:

```typescript
const systemPrompt = `
You are a [YOUR PERSONA HERE].
Your task is to [YOUR TASK HERE].

Rules:
1. [YOUR RULE 1]
2. [YOUR RULE 2]
...
`;
```

### Modify Fallback Logic

Edit `getFallbackInterpretation()` in:
- `src/app/actions/guest-verification.ts`
- `src/app/actions/verification.ts`

```typescript
function getFallbackInterpretation(predictions) {
  // Your custom logic here
  const isPure = predictions[0].tagName === 'Pure';
  const confidence = predictions[0].probability;
  
  if (isPure && confidence > 0.7) {
    return {
      status: 'good',
      emoji: '🟢',
      // ... your custom messages
    };
  }
}
```

## 🐛 Troubleshooting

### ❌ "Azure OpenAI credentials not configured"

**Fix**: Add environment variables to `.env.local`

### ❌ "No content from OpenAI"

**Fix**: Check deployment name matches exactly:
```bash
# In Azure AI Studio, verify your deployment is named:
gpt-5-mini  # Must match AZURE_OPENAI_DEPLOYMENT_NAME
```

### ❌ Test script fails

**Fix**: Run with verbose logging:
```bash
node scripts/test-ai-summary.js 2>&1 | tee test-output.log
```

### ❌ Always uses fallback

**Causes**:
1. API key expired
2. Model not deployed
3. Wrong endpoint URL
4. Rate limit hit

**Debug**:
```typescript
// Add logging in interpreter.ts
console.log('OpenAI Request:', { deployment, endpoint });
console.log('OpenAI Response:', response);
```

## 📊 Performance

### Expected Latencies

| Step | Time | Notes |
|------|------|-------|
| Custom Vision | 1-2s | Image classification |
| OpenAI Synthesis | 1-3s | AI text generation |
| Total | 2-5s | End-to-end |

### Optimization Tips

1. **Parallel Processing**: Vision + OCR run concurrently
2. **Non-blocking Save**: Database writes don't block response
3. **Fallback Ready**: Instant fallback if AI fails
4. **Low Temperature**: 0.3 for consistent, fast responses

## 📚 Documentation

- **Full Guide**: [AI_SUMMARY_INTEGRATION.md](AI_SUMMARY_INTEGRATION.md)
- **Examples**: [AI_SUMMARY_EXAMPLES.md](AI_SUMMARY_EXAMPLES.md)
- **Implementation**: [../AI_SUMMARY_IMPLEMENTATION.md](../AI_SUMMARY_IMPLEMENTATION.md)

## 🆘 Support

**Issues?** Check:
1. Environment variables set correctly
2. Azure OpenAI model deployed
3. Test script passes
4. Build succeeds: `npm run build`

**Still stuck?** Review:
- [AI_SUMMARY_INTEGRATION.md#troubleshooting](AI_SUMMARY_INTEGRATION.md#troubleshooting)
- Azure OpenAI service health
- OpenAI SDK logs

## ✅ Checklist

Before going to production:

- [ ] Azure OpenAI resource created
- [ ] Model deployed (gpt-5-mini or gpt-4o-mini)
- [ ] Environment variables configured
- [ ] Test script passes
- [ ] Build succeeds
- [ ] Tested with real images
- [ ] Guest flow works
- [ ] Authenticated flow works
- [ ] Fallback works when AI disabled
- [ ] Performance acceptable (<5s total)

## 🎉 Success!

You're ready to use AI Summary in your app!

Next: Replace existing result cards with `<AISummaryCard />` in your scanner pages.
