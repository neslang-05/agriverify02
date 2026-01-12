# Azure OpenAI AI Summary Integration Guide

## Overview

The AI Summary feature uses Azure OpenAI (gpt-5-mini model) to transform technical Custom Vision classification results into simple, confident, human-friendly language suitable for Indian farmers.

## Purpose

- **Transform**: Convert probabilistic model outputs (e.g., `{"Pure": 0.65, "Inert": 0.35}`) into clear narratives
- **Simplify**: Use 6th-grade reading level English with decisive language
- **Humanize**: Provide actionable recommendations instead of technical percentages

## Architecture

```
┌─────────────┐
│   Image     │
└──────┬──────┘
       │
       ├──────────────────────┬───────────────────┐
       │                      │                   │
       ▼                      ▼                   ▼
┌─────────────┐      ┌──────────────┐   ┌────────────────┐
│   Custom    │      │   Computer   │   │    OpenAI      │
│   Vision    │──────│   Vision OCR │───│  Interpreter   │
│ (Technical) │      │  (Optional)  │   │  (Synthesis)   │
└──────┬──────┘      └──────────────┘   └────────┬───────┘
       │                                           │
       │              Combined Output             │
       └──────────────────┬───────────────────────┘
                          ▼
                ┌──────────────────┐
                │  Dual Result:    │
                │  - UI (Simple)   │
                │  - Technical     │
                └──────────────────┘
```

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```env
# Azure OpenAI for AI Summary (gpt-5-mini)
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### 2. Azure OpenAI Deployment

1. **Create Azure OpenAI Resource** in Azure Portal
2. **Deploy the gpt-5-mini model** in Azure AI Studio
   - Model: `gpt-5-mini` (or `gpt-4o-mini` if preferred)
   - Deployment name: `gpt-5-mini` (must match `AZURE_OPENAI_DEPLOYMENT_NAME`)
3. Copy the endpoint and API key to your environment variables

## Implementation

### Core Components

#### 1. OpenAI Interpreter Service

Location: `src/lib/openai/interpreter.ts`

```typescript
import { interpreter } from '@/lib/openai/interpreter';

// Synthesize result
const simplified = await interpreter.synthesizeResult(
  base64Image,
  visionResults.predictions
);
```

**Features:**
- Accepts image + Custom Vision predictions
- Returns structured JSON with status, emoji, headline, explanation, and action
- Built-in fallback for API failures
- Low temperature (0.3) for consistent results

#### 2. Server Actions

**For Guest Users:**

```typescript
import { processSeedImageWithAI } from '@/app/actions/guest-verification';

const result = await processSeedImageWithAI(base64Image);
// Returns: { ui: {...}, technical: {...} }
```

**For Logged-in Users:**

```typescript
import { uploadAndVerifyWithAI } from '@/app/actions/verification';

const result = await uploadAndVerifyWithAI(formData);
// Returns: { ui: {...}, technical: {...} }
```

#### 3. UI Component

```tsx
import { AISummaryCard } from '@/components/scanner/ai-summary-card';

<AISummaryCard
  result={verificationResult}
  isGuest={!user}
  onReset={() => resetScanner()}
  onFileComplaint={() => navigateToComplaints()}
  onLogin={() => router.push('/login')}
/>
```

## Data Structure

### Input: Custom Vision Predictions

```typescript
[
  { tagName: 'Pure', probability: 0.75 },
  { tagName: 'InertMatter', probability: 0.15 },
  { tagName: 'Broken', probability: 0.10 }
]
```

### Output: Simplified Analysis

```typescript
{
  status: 'good' | 'average' | 'bad',
  emoji: '🟢' | '🟡' | '🔴',
  headline: 'Quality Looks Good',
  explanation: 'The seeds appear uniform and healthy...',
  action_recommendation: 'Safe to use for planting.'
}
```

### Full Result Structure

```typescript
{
  // Simplified view for UI (Guest and Farmer)
  ui: {
    status: 'good',
    emoji: '🟢',
    title: 'Quality Looks Good',
    message: 'The seeds appear uniform and healthy...',
    action: 'Safe to use for planting.'
  },
  // Full technical data (Officers and detailed view)
  technical: {
    predictions: [...],
    model_confidence: 0.85,
    raw_tags: [...]
  }
}
```

## User Experience Flow

### Guest Users

1. **Upload Image** → Scan seeds
2. **See Simple Result** → Emoji, title, message, action
3. **Technical Details Locked** → Prompt to login
4. **Optional Actions** → Reset or file complaint

### Logged-In Users

1. **Upload Image** → Scan seeds
2. **See Simple Result** → Same as guest
3. **Expand Technical Details** → View classification breakdown
4. **View Confidence Scores** → See all prediction percentages
5. **Access Full History** → Saved in database

## Prompt Engineering

The system prompt ensures:

1. **Simple Language** → 6th-grade reading level
2. **Decisive Tone** → Avoid "maybe", "possibly", "likely"
3. **Focus on Context** → High "Pure" = Good, High "Inert" = Bad
4. **Ignore Noise** → Skip probabilities < 10%
5. **JSON Output** → Structured, type-safe responses

Example prompt:

```
You are an agricultural expert assistant for Indian farmers.
Analyze this seed image and technical data to provide a simple, confident verdict.

Technical Data: [Pure: 75.0%, InertMatter: 15.0%, Broken: 10.0%]

Rules:
1. IGNORE low probabilities (<10%) unless critical contaminants
2. BE DECISIVE. Say "This looks like..." not "might be"
3. LANGUAGE: Simple English. No scientific jargon
4. CONTEXT: Pure > 70% = Good. Inert/Broken high = Bad
5. OUTPUT: JSON format only
```

## Error Handling

### OpenAI Failures

If Azure OpenAI is unavailable, the system falls back to rule-based interpretation:

```typescript
function getFallbackInterpretation(predictions) {
  // Rule-based logic:
  // - Pure > 60% = Good
  // - 40-60% = Average
  // - < 40% = Bad
}
```

### Complete Failure Fallback

```typescript
{
  ui: {
    status: 'bad',
    emoji: '⚠️',
    title: 'Analysis Unavailable',
    message: 'Could not analyze image. Try again.',
    action: 'Contact support if issue persists.'
  }
}
```

## Testing

### Manual Testing

1. **Good Quality Seeds**:
   - Upload clear image with pure seeds
   - Expect: Green status, encouraging message

2. **Poor Quality Seeds**:
   - Upload image with broken/contaminated seeds
   - Expect: Red status, warning message

3. **Guest vs Logged-in**:
   - Test as guest → Technical details locked
   - Login → Technical details visible

### API Testing

```bash
# Test Azure OpenAI connection
node scripts/test-azure-openai.js
```

## Performance Considerations

1. **Latency**: OpenAI adds ~1-3 seconds to verification
2. **Fallback First**: System continues even if OpenAI fails
3. **Parallel Processing**: Vision + OCR run concurrently
4. **Non-blocking History**: Database save doesn't block response

## Best Practices

### UI Display

- **Primary**: Show simplified UI result prominently
- **Secondary**: Hide technical data behind accordion
- **Guest**: Lock technical details, prompt login

### Language Guidelines

- ✅ "The seeds appear healthy"
- ✅ "We detected impurities"
- ❌ "The seeds might be good"
- ❌ "There could be some issues"

### Status Classification

- **Good (🟢)**: Pure > 70%, confidence > 60%
- **Average (🟡)**: Mixed results, moderate confidence
- **Bad (🔴)**: High impurities, low confidence

## Integration Checklist

- [x] OpenAI interpreter service created
- [x] Environment variables configured
- [x] Server actions updated
- [x] TypeScript types defined
- [x] UI component created
- [x] Fallback logic implemented
- [ ] Azure OpenAI deployed
- [ ] Environment variables set in production
- [ ] Testing with real images

## Troubleshooting

### "Azure OpenAI credentials not configured"

**Solution**: Ensure these environment variables are set:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT_NAME`

### "No content from OpenAI"

**Possible causes**:
1. Deployment name mismatch
2. API version incompatibility
3. Rate limiting
4. Model not deployed

**Solution**: Verify deployment name matches exactly, check Azure Portal

### Synthesis always falls back

**Check**:
1. API key validity
2. Endpoint URL format
3. Model deployment status
4. Request/response logs

## Future Enhancements

1. **Multi-language Support**: Translate to Hindi, Telugu, etc.
2. **Voice Output**: Text-to-speech for illiterate farmers
3. **Streaming Responses**: Show partial results as they arrive
4. **Caching**: Cache common interpretations
5. **A/B Testing**: Compare AI vs rule-based satisfaction

## References

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [Custom Vision API](https://learn.microsoft.com/en-us/azure/ai-services/custom-vision-service/)
