import * as tf from '@tensorflow/tfjs';
import { LayersModel } from '@tensorflow/tfjs';

let model: LayersModel | null = null;

export const TM_LABELS = ['Seed', 'Not Seed'];

/**
 * Loads the Teachable Machine model from the public directory.
 */
export async function loadTeachableMachineModel(): Promise<LayersModel | null> {
  if (!model) {
    if (typeof window === 'undefined') return null; // Ensure we are on the client
    try {
      model = await tf.loadLayersModel('/models/seed-verifier/model.json');
    } catch (e) {
      console.error('Failed to load Teachable Machine model:', e);
      return null;
    }
  }
  return model;
}

/**
 * Creates a 224x224 center-cropped canvas from an image.
 */
function getCenterCroppedCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const size = Math.min(image.width, image.height);
  const startX = (image.width - size) / 2;
  const startY = (image.height - size) / 2;

  ctx.drawImage(
    image,
    startX, startY, size, size, // Source coordinates and size
    0, 0, 224, 224              // Destination coordinates and size
  );
  
  return canvas;
}

/**
 * Predicts whether the given image is a seed or not using the local TM model.
 */
export async function predictSeedImage(imageElement: HTMLImageElement): Promise<{
  isSeed: boolean;
  confidence: number;
  label: string;
}> {
  const loadedModel = await loadTeachableMachineModel();
  if (!loadedModel) {
    throw new Error('Teachable Machine model could not be loaded');
  }

  const croppedCanvas = getCenterCroppedCanvas(imageElement);

  const tensor = tf.tidy(() => {
    // 1. Convert canvas to tensor
    const imgTensor = tf.browser.fromPixels(croppedCanvas).toFloat();
    
    // 2. Normalize: TM models (MobileNet base) expect input from -1 to 1
    const normalized = imgTensor.div(tf.scalar(127.5)).sub(tf.scalar(1));
    
    // 3. Expand dims to create a batch of 1: [1, 224, 224, 3]
    return normalized.expandDims();
  });

  try {
    const predictions = await loadedModel.predict(tensor) as tf.Tensor;
    const data = await predictions.data();
    
    predictions.dispose();

    // metadata.json indicates labels are: ["Seed", "Not Seed"]
    const seedProb = data[0];
    const notSeedProb = data[1];

    const isSeed = seedProb >= notSeedProb;
    
    return {
      isSeed,
      confidence: isSeed ? seedProb : notSeedProb,
      label: isSeed ? 'Seed' : 'Not Seed',
    };
  } finally {
    tensor.dispose();
  }
}
