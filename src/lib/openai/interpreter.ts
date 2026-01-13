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
  is_seed_image: boolean; // Whether the image is actually a seed image
  image_type?: string; // What type of image it is (if not seed)
}

export class OpenAIInterpreter {
  private client: OpenAI;
  private deployment: string;

  constructor() {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-mini-agriAI-botService';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    if (!apiKey || !endpoint) {
      throw new Error('Azure OpenAI credentials not configured. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in environment variables.');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: `${endpoint}/openai/deployments/${deploymentName}`,
      defaultQuery: { 'api-version': apiVersion },
      defaultHeaders: { 'api-key': apiKey },
    });
    this.deployment = deploymentName;
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
Your task is to analyze an image to:
1. FIRST, determine if this is actually a seed/grain image
2. IF it's a seed image, analyze its quality using the technical classification data
3. IF it's NOT a seed image, clearly state what it is

Technical Data (for your reference only - DO NOT mention these in your response): [${technicalContext}]

CRITICAL RULES:
1. ALWAYS check if the image shows seeds/grains first
2. If the image shows something else (person, plant, building, landscape, etc.), set is_seed_image to false and describe what you see
3. NEVER include any numbers, percentages, or figures in your response - farmers should not see any statistics
4. BE DECISIVE. Do not say "might be". Say "This looks like..." or "We detected..."
5. LANGUAGE: Very simple English that any farmer can understand. No scientific jargon. No technical terms.
6. Use friendly, encouraging language. Be supportive and clear.
7. OUTPUT: JSON format only with these exact fields: status, emoji, headline, explanation, action_recommendation, is_seed_image, image_type (optional)

EMOJI RULES - Use these smiley faces:
- status "good" → emoji "😊" (smiling face - seeds are great!)
- status "average" → emoji "😐" (neutral face - seeds need attention)
- status "bad" → emoji "😟" (worried face - seeds have problems)
- non-seed images → emoji "🤔" (thinking face - please upload seeds)

Example output for good seed image:
{
  "status": "good",
  "emoji": "😊",
  "headline": "Good Quality Seeds",
  "explanation": "These seeds look healthy and clean. You can use them for planting with confidence.",
  "action_recommendation": "Plant these seeds. They look ready to grow!",
  "is_seed_image": true
}

Example output for average seed image:
{
  "status": "average",
  "emoji": "😐",
  "headline": "Seeds Need Cleaning",
  "explanation": "We see some dust or broken pieces mixed with your seeds. The seeds themselves look okay.",
  "action_recommendation": "Clean the seeds before planting. Remove the dust and broken pieces.",
  "is_seed_image": true
}

Example output for bad seed image:
{
  "status": "bad",
  "emoji": "😟",
  "headline": "Poor Quality Seeds",
  "explanation": "These seeds do not look healthy. We see many broken pieces or unwanted materials mixed in.",
  "action_recommendation": "Consider getting a refund or exchange. You can file a complaint.",
  "is_seed_image": true
}

Example output for non-seed image:
{
  "status": "bad",
  "emoji": "🤔",
  "headline": "Not a Seed Photo",
  "explanation": "This photo does not show seeds. Please take a picture of your seeds so we can check them.",
  "action_recommendation": "Take a clear photo of your seeds and try again.",
  "is_seed_image": false,
  "image_type": "other"
}
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
        temperature: 0.5, // Low temperature for consistency
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
    const isAverage = top.probability > 0.4 && top.probability <= 0.6;
    
    if (isGood) {
      return {
        status: 'good',
        emoji: '😊',
        headline: 'Good Quality Seeds',
        explanation: "These seeds look healthy and clean. You can use them for planting with confidence.",
        action_recommendation: "Plant these seeds. They look ready to grow!",
        is_seed_image: true
      };
    } else if (isAverage) {
      return {
        status: 'average',
        emoji: '😐',
        headline: 'Seeds Need Cleaning',
        explanation: "We see some dust or broken pieces mixed with your seeds. The seeds themselves look okay.",
        action_recommendation: "Clean the seeds before planting. Remove the dust and broken pieces.",
        is_seed_image: true
      };
    } else {
      return {
        status: 'bad',
        emoji: '😟',
        headline: 'Poor Quality Seeds',
        explanation: "These seeds do not look healthy. We see many broken pieces or unwanted materials mixed in.",
        action_recommendation: "Consider getting a refund or exchange. You can file a complaint.",
        is_seed_image: true
      };
    }
  }
}

export const interpreter = new OpenAIInterpreter();
