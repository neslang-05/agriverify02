/**
 * Test Azure OpenAI AI Summary Integration
 * 
 * This script tests the OpenAI interpreter service to ensure
 * it can successfully synthesize Custom Vision results into
 * human-friendly language.
 * 
 * Usage: node scripts/test-ai-summary.js
 */

require('dotenv').config({ path: '.env.local' });

async function testAISummary() {
  console.log('🧪 Testing Azure OpenAI AI Summary Integration\n');

  // Check environment variables
  const requiredVars = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_DEPLOYMENT_NAME'
  ];

  console.log('📋 Checking environment variables...');
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('\nPlease add these to your .env.local file:');
    missing.forEach(varName => {
      console.log(`${varName}=<your-value>`);
    });
    process.exit(1);
  }

  console.log('✅ All required environment variables are set\n');

  // Display configuration
  console.log('📝 Configuration:');
  console.log(`   Endpoint: ${process.env.AZURE_OPENAI_ENDPOINT}`);
  console.log(`   Deployment: ${process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-mini'}`);
  console.log(`   API Version: ${process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'}\n`);

  try {
    // Import the OpenAI client
    const { OpenAI } = require('openai');

    const client = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-mini'}`,
      defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
    });

    console.log('🔄 Testing connection to Azure OpenAI...\n');

    // Test Case 1: Good Quality Seeds
    console.log('Test 1: Good Quality Seeds (Pure: 85%, Inert: 10%, Broken: 5%)');
    console.log('─────────────────────────────────────────────────────────────');
    
    const goodSeedPredictions = [
      { tagName: 'Pure', probability: 0.85 },
      { tagName: 'InertMatter', probability: 0.10 },
      { tagName: 'Broken', probability: 0.05 }
    ];

    const technicalContext1 = goodSeedPredictions
      .map(p => `${p.tagName}: ${(p.probability * 100).toFixed(1)}%`)
      .join(', ');

    const systemPrompt = `
You are an agricultural expert assistant for Indian farmers. 
Your task is to analyze a seed image and its technical classification data to provide a simple, confident verdict.

Technical Data: [${technicalContext1}]

Rules:
1. IGNORE low probabilities (<10%) unless they are critical contaminants.
2. BE DECISIVE. Do not say "might be". Say "This looks like..." or "We detected...".
3. LANGUAGE: Simple English. No scientific jargon. 
4. CONTEXT: If 'Pure' is high (>70%), it's Good. If 'InertMatter' or 'Broken' is high, it's Bad/Average.
5. OUTPUT: JSON format only with these exact fields: status (must be "good", "average", or "bad"), emoji, headline, explanation, action_recommendation.

Example output:
{
  "status": "good",
  "emoji": "🟢",
  "headline": "Quality Looks Good",
  "explanation": "The seeds appear uniform and healthy. This batch shows high purity with minimal impurities.",
  "action_recommendation": "Safe to use for planting."
}
    `;

    const response1 = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: "Analyze this seed classification data and provide a simple summary."
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 200
    });

    const result1 = JSON.parse(response1.choices[0].message.content);
    console.log('✅ Response received:');
    console.log('   Status:', result1.status, result1.emoji);
    console.log('   Title:', result1.headline);
    console.log('   Message:', result1.explanation);
    console.log('   Action:', result1.action_recommendation);
    console.log();

    // Test Case 2: Poor Quality Seeds
    console.log('Test 2: Poor Quality Seeds (Broken: 60%, InertMatter: 25%, Pure: 15%)');
    console.log('─────────────────────────────────────────────────────────────');
    
    const badSeedPredictions = [
      { tagName: 'Broken', probability: 0.60 },
      { tagName: 'InertMatter', probability: 0.25 },
      { tagName: 'Pure', probability: 0.15 }
    ];

    const technicalContext2 = badSeedPredictions
      .map(p => `${p.tagName}: ${(p.probability * 100).toFixed(1)}%`)
      .join(', ');

    const systemPrompt2 = systemPrompt.replace(technicalContext1, technicalContext2);

    const response2 = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt2 },
        { 
          role: 'user', 
          content: "Analyze this seed classification data and provide a simple summary."
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 200
    });

    const result2 = JSON.parse(response2.choices[0].message.content);
    console.log('✅ Response received:');
    console.log('   Status:', result2.status, result2.emoji);
    console.log('   Title:', result2.headline);
    console.log('   Message:', result2.explanation);
    console.log('   Action:', result2.action_recommendation);
    console.log();

    // Test Case 3: Average Quality Seeds
    console.log('Test 3: Average Quality Seeds (Pure: 55%, Broken: 25%, InertMatter: 20%)');
    console.log('─────────────────────────────────────────────────────────────');
    
    const avgSeedPredictions = [
      { tagName: 'Pure', probability: 0.55 },
      { tagName: 'Broken', probability: 0.25 },
      { tagName: 'InertMatter', probability: 0.20 }
    ];

    const technicalContext3 = avgSeedPredictions
      .map(p => `${p.tagName}: ${(p.probability * 100).toFixed(1)}%`)
      .join(', ');

    const systemPrompt3 = systemPrompt.replace(technicalContext1, technicalContext3);

    const response3 = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt3 },
        { 
          role: 'user', 
          content: "Analyze this seed classification data and provide a simple summary."
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 200
    });

    const result3 = JSON.parse(response3.choices[0].message.content);
    console.log('✅ Response received:');
    console.log('   Status:', result3.status, result3.emoji);
    console.log('   Title:', result3.headline);
    console.log('   Message:', result3.explanation);
    console.log('   Action:', result3.action_recommendation);
    console.log();

    console.log('✅ All tests passed successfully!');
    console.log('\n🎉 Azure OpenAI AI Summary integration is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify your Azure OpenAI endpoint URL is correct');
    console.log('2. Ensure your API key is valid and has proper permissions');
    console.log('3. Check that the deployment name matches your Azure deployment');
    console.log('4. Verify the model is deployed and active in Azure Portal');
    process.exit(1);
  }
}

// Run the test
testAISummary().catch(console.error);
