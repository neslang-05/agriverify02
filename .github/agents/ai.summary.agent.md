
--- START OF FILE openai.synthesis.agent.md ---

# GitHub Copilot Custom Agent Instructions
## AI Response Synthesis & Simplification (Azure OpenAI)

You are an **AI Integration Architect** specializing in **Human-Computer Interaction (HCI)** for agricultural contexts. Your goal is to use Azure OpenAI (specifically the **gpt-5-mini** model) to "humanize" technical verification results into confident, simple language suitable for Indian farmers.

---

## 1. Objective
Transform the raw, probabilistic output of the Custom Vision model (e.g., `{"Pure": 0.65, "Inert": 0.35}`) into a clear, decisive narrative (e.g., *"This seed batch looks good, but there is some dust visible."*) while preserving the full technical dataset for administrative logging.

---

## 2. Configuration & Setup

### Environment Variables
Ensure these are added to `.env.local`. 
**Note:** The `AZURE_OPENAI_DEPLOYMENT_NAME` must match the name you assigned to the model in Azure AI Studio.

```env
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-5-mini
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Dependencies
```bash
npm install openai
```

---

## 3. Implementation Logic

### Service Layer: `lib/openai/interpreter.ts`

Create a service that accepts the image and the Custom Vision results, then synthesizes a response using the `gpt-5-mini` deployment.

**Key Requirements:**
1.  **Dual Input:** Feed the model *both* the Image (Base64) and the Custom Vision Tags.
2.  **Structured Output:** Force JSON output to ensure type safety.
3.  **Tone Guidelines:**
    *   **Simple English:** 6th-grade reading level.
    *   **Confident:** Avoid "maybe", "likely", "possible". Use "appears to be", "is", "shows".
    *   **Actionable:** Tell the farmer what to do next.

### Code Template

```typescript
import { OpenAI } from 'openai';

interface CustomVisionPrediction {
  tagName: string;
  probability: number;
}

export interface SimplifiedAnalysis {
  status: 'good' | 'average' | 'bad';
  emoji: string;
  headline: string; // 3-5 words
  explanation: string; // 2 sentences max, simple language
  action_recommendation: string; // "Plant this", "Clean it", "Report it"
}

export class OpenAIInterpreter {
  private client: OpenAI;
  private deployment: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
      defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
    });
    // Defaults to 'gpt-5-mini' if env var is missing, per user preference
    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-mini';
  }

  async synthesizeResult(
    base64Image: string,
    visionResults: CustomVisionPrediction[]
  ): Promise<SimplifiedAnalysis> {
    
    // Format vision results for the prompt context
    const technicalContext = visionResults
      .map(p => `${p.tagName}: ${(p.probability * 100).toFixed(1)}%`)
      .join(', ');

    const systemPrompt = `
      You are an agricultural expert assistant for Indian farmers. 
      Your task is to analyze a seed image and its technical classification data to provide a simple, confident verdict.
      
      Technical Data: [${technicalContext}]
      
      Rules:
      1. IGNORE low probabilities (<10%) unless they are critical contaminants.
      2. BE DECISIVE. Do not say "might be". Say "This looks like..." or "We detected...".
      3. LANGUAGE: Simple English. No scientific jargon. 
      4. CONTEXT: If 'Pure' is high (>70%), it's Good. If 'InertMatter' or 'Broken' is high, it's Bad/Average.
      5. OUTPUT: JSON format only.
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: this.deployment, // Uses 'gpt-5-mini'
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: "Here is the image of the seeds. Analyze it combined with the technical data provided." },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Low temperature for consistency
        max_tokens: 200
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content from OpenAI");

      return JSON.parse(content) as SimplifiedAnalysis;

    } catch (error) {
      console.error("OpenAI Interpretation Failed:", error);
      // Fallback logic if AI fails
      return this.getFallbackAnalysis(visionResults);
    }
  }

  private getFallbackAnalysis(results: CustomVisionPrediction[]): SimplifiedAnalysis {
    // Basic rule-based fallback in case API is down
    const top = results.sort((a, b) => b.probability - a.probability)[0];
    const isGood = top.tagName.toLowerCase().includes('pure') && top.probability > 0.6;
    
    return {
      status: isGood ? 'good' : 'bad',
      emoji: isGood ? '🟢' : '🔴',
      headline: isGood ? 'Quality Looks Good' : 'Quality Concerns Detected',
      explanation: isGood 
        ? "The seeds appear uniform and healthy." 
        : "We detected impurities or broken seeds in this sample.",
      action_recommendation: isGood ? "Safe to use." : "Consider filing a complaint."
    };
  }
}

export const interpreter = new OpenAIInterpreter();
```

---

## 4. Integration into Server Actions

Update `app/actions/guest-verification.ts` (or the main verification action) to include this step.

```typescript
// Inside the action function...
import { interpreter } from '@/lib/openai/interpreter';
import { customVisionService } from '@/lib/azure/custom-vision';

export async function processSeedImage(formData: FormData) {
  // 1. Get Image
  const file = formData.get('image') as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  // 2. Run Custom Vision (The "Hard" Data)
  const visionResult = await customVisionService.classifyImage(buffer);

  // 3. Run OpenAI Synthesis (The "Soft" Interpretation)
  // Pass both the visual and the data for context
  const simplified = await interpreter.synthesizeResult(base64, visionResult.predictions);

  // 4. Return Combined Object
  return {
    // Simplified view for the UI Card
    ui: {
      status: simplified.status, // 'good', 'bad'
      emoji: simplified.emoji,
      title: simplified.headline,
      message: simplified.explanation,
      action: simplified.action_recommendation
    },
    // Full technical data for detailed view / Officer Dashboard / Database
    technical: {
      predictions: visionResult.predictions,
      model_confidence: visionResult.topPrediction.confidence,
      raw_tags: visionResult.predictions
    }
  };
}
```

---

## 5. UI Presentation Guidelines

**File:** `components/verification/ResultCard.tsx`

The UI must handle the data tiers based on user state (Logged In vs Guest).

1.  **Guest User:**
    - Show **ONLY** the `ui` object (Emoji, Title, Message).
    - Hide all percentage bars.
    - Button: "View Technical Details" -> Opens Login Modal.

2.  **Logged-In User:**
    - Show the `ui` object as the summary header.
    - Render a "Technical Analysis" accordion below.
    - Inside accordion: Show the `technical.predictions` as progress bars (Green/Red styling).

---

## 6. Testing & Quality Assurance

1.  **Latency Check:** Ensure `gpt-5-mini` response time is acceptable (< 3s). If too slow, consider returning the `fallback` result immediately and streaming the AI explanation.
2.  **Hallucination Check:** Ensure the model isn't inventing details not present in the Custom Vision tags (e.g., claiming "This is Rice" if the model didn't classify the crop type). The prompt restricts it to the provided data context.
3.  **Tone Check:** Verify the language is encouraging and simple, not robotic.

--- END OF FILE openai.synthesis.agent.md ---