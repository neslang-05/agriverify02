/**
 * AI Summary Feature - Usage Examples
 * 
 * This file demonstrates how to use the AI Summary feature in different scenarios.
 */

// ============================================
// Example 1: Guest User Verification
// ============================================

import { processSeedImageWithAI } from '@/app/actions/guest-verification';
import { AISummaryCard } from '@/components/scanner/ai-summary-card';

async function handleGuestScan(base64Image: string) {
  // Call the AI-powered verification
  const result = await processSeedImageWithAI(base64Image);
  
  // Result structure:
  // {
  //   ui: {
  //     status: 'good' | 'average' | 'bad',
  //     emoji: '🟢' | '🟡' | '🔴',
  //     title: 'Quality Looks Good',
  //     message: 'The seeds appear uniform and healthy...',
  //     action: 'Safe to use for planting.'
  //   },
  //   technical: {
  //     predictions: [{ tagName: 'Pure', probability: 0.85 }, ...],
  //     model_confidence: 0.85,
  //     raw_tags: [...]
  //   }
  // }
  
  return result;
}

// Display the result
function GuestScanResult({ result }) {
  return (
    <AISummaryCard
      result={result}
      isGuest={true}
      onReset={() => window.location.reload()}
      onFileComplaint={() => router.push('/farmer/complaints/new')}
      onLogin={() => router.push('/login')}
    />
  );
}

// ============================================
// Example 2: Authenticated User Verification
// ============================================

import { uploadAndVerifyWithAI } from '@/app/actions/verification';

async function handleAuthenticatedScan(file: File) {
  // Create form data
  const formData = new FormData();
  formData.append('image', file);
  
  // Call the AI-powered verification (saves to history automatically)
  const result = await uploadAndVerifyWithAI(formData);
  
  return result;
}

// Display with full technical details available
function AuthenticatedScanResult({ result }) {
  return (
    <AISummaryCard
      result={result}
      isGuest={false}
      onReset={handleNewScan}
      onFileComplaint={handleComplaintFlow}
    />
  );
}

// ============================================
// Example 3: Custom Implementation
// ============================================

import { interpreter } from '@/lib/openai/interpreter';
import { customVisionService } from '@/lib/azure/custom-vision';

async function customVerificationFlow(imageBuffer: Buffer, base64Image: string) {
  // 1. Get Custom Vision predictions
  const visionResult = await customVisionService.classifyImage(imageBuffer);
  
  // 2. Synthesize with OpenAI
  const aiSummary = await interpreter.synthesizeResult(
    base64Image,
    visionResult.predictions
  );
  
  // 3. Use the results
  console.log('AI Summary:', aiSummary);
  // {
  //   status: 'good',
  //   emoji: '🟢',
  //   headline: 'Quality Looks Good',
  //   explanation: 'The seeds appear uniform...',
  //   action_recommendation: 'Safe to use for planting.'
  // }
  
  // 4. Combine with technical data
  return {
    ui: {
      status: aiSummary.status,
      emoji: aiSummary.emoji,
      title: aiSummary.headline,
      message: aiSummary.explanation,
      action: aiSummary.action_recommendation
    },
    technical: {
      predictions: visionResult.predictions,
      model_confidence: visionResult.topPrediction.confidence,
      raw_tags: visionResult.predictions
    }
  };
}

// ============================================
// Example 4: Handling Errors
// ============================================

async function verifyWithErrorHandling(base64Image: string) {
  try {
    const result = await processSeedImageWithAI(base64Image);
    
    // Check if AI synthesis succeeded
    if (result.ui.status === 'bad' && result.ui.emoji === '⚠️') {
      // This is the fallback error state
      console.warn('AI verification failed, showing fallback message');
    }
    
    return result;
    
  } catch (error) {
    console.error('Verification failed completely:', error);
    
    // Return a safe fallback
    return {
      ui: {
        status: 'bad' as const,
        emoji: '⚠️',
        title: 'Analysis Unavailable',
        message: 'Unable to analyze image. Please try again.',
        action: 'Contact support if issue persists.'
      },
      technical: {
        predictions: [],
        model_confidence: 0,
        raw_tags: []
      }
    };
  }
}

// ============================================
// Example 5: Conditional Display
// ============================================

function SmartResultDisplay({ result, user }) {
  if (user) {
    // Logged-in user: show full details
    return (
      <div>
        <AISummaryCard 
          result={result} 
          isGuest={false}
        />
        
        {/* Additional logged-in features */}
        <HistoryButton />
        <ShareButton />
      </div>
    );
  } else {
    // Guest: show limited view with prompts
    return (
      <div>
        <AISummaryCard 
          result={result} 
          isGuest={true}
          onLogin={() => router.push('/login?redirect=verify')}
        />
        
        {/* Guest-specific prompts */}
        <LoginPromptBanner />
      </div>
    );
  }
}

// ============================================
// Example 6: Batch Processing
// ============================================

async function processBatchOfImages(images: string[]) {
  const results = await Promise.all(
    images.map(img => processSeedImageWithAI(img))
  );
  
  // Aggregate results
  const goodCount = results.filter(r => r.ui.status === 'good').length;
  const badCount = results.filter(r => r.ui.status === 'bad').length;
  const avgCount = results.filter(r => r.ui.status === 'average').length;
  
  return {
    summary: {
      total: results.length,
      good: goodCount,
      bad: badCount,
      average: avgCount
    },
    details: results
  };
}

// ============================================
// Example 7: Integration with Forms
// ============================================

'use client';

import { useState } from 'react';

export function SeedVerificationForm() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('image') as File;
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      // Process with AI
      const verificationResult = await processSeedImageWithAI(base64);
      setResult(verificationResult);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="image" accept="image/*" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Verify Seeds'}
      </button>
      
      {result && (
        <AISummaryCard 
          result={result}
          isGuest={!user}
          onReset={() => setResult(null)}
        />
      )}
    </form>
  );
}

// ============================================
// Example 8: Testing AI Summary Locally
// ============================================

// For testing without Azure configured
async function mockAISummary() {
  // Simulate a good result
  const mockGoodResult = {
    ui: {
      status: 'good' as const,
      emoji: '🟢',
      title: 'Quality Looks Good',
      message: 'The seeds appear uniform and healthy. This batch shows high purity with minimal impurities.',
      action: 'Safe to use for planting.'
    },
    technical: {
      predictions: [
        { tagName: 'Pure', probability: 0.85 },
        { tagName: 'InertMatter', probability: 0.10 },
        { tagName: 'Broken', probability: 0.05 }
      ],
      model_confidence: 0.85,
      raw_tags: [
        { tagName: 'Pure', probability: 0.85 },
        { tagName: 'InertMatter', probability: 0.10 },
        { tagName: 'Broken', probability: 0.05 }
      ]
    }
  };
  
  return mockGoodResult;
}

// ============================================
// Example 9: Accessing Technical Data
// ============================================

function TechnicalDetailsView({ result }) {
  const { technical } = result;
  
  return (
    <div>
      <h3>Model Confidence: {(technical.model_confidence * 100).toFixed(1)}%</h3>
      
      <h4>Classification Breakdown:</h4>
      <ul>
        {technical.predictions
          .sort((a, b) => b.probability - a.probability)
          .map((pred, idx) => (
            <li key={idx}>
              {pred.tagName}: {(pred.probability * 100).toFixed(1)}%
              <ProgressBar value={pred.probability * 100} />
            </li>
          ))}
      </ul>
    </div>
  );
}

// ============================================
// Example 10: Officer Dashboard Integration
// ============================================

async function getVerificationHistoryWithAI(userId: string) {
  // Fetch history from database
  const history = await getUserVerifications(userId);
  
  // History entries now include AI summary data
  return history.map(entry => ({
    id: entry.id,
    date: entry.verified_at,
    
    // UI Summary (stored in DB)
    summary: {
      status: entry.status,
      message: entry.recommendation,
    },
    
    // Technical Data
    technical: {
      confidence: entry.confidence,
      visionTag: entry.vision_ai_tag,
      seedVariety: entry.seed_variety
    }
  }));
}

export {
  handleGuestScan,
  handleAuthenticatedScan,
  customVerificationFlow,
  verifyWithErrorHandling,
  processBatchOfImages,
  mockAISummary
};
