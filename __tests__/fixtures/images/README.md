# Test Images for Azure Vision Integration

This directory should contain test images for the Azure Custom Vision integration tests.

## Required Test Images

Place the following test images in this directory:

1. **genuine-seed.jpg** - Image of a genuine certified paddy seed packet
   - Should have clear labeling
   - Include certification marks
   - High-quality packaging

2. **fake-seed.jpg** - Image of a counterfeit seed packet
   - Poor quality printing
   - Missing certification marks
   - Suspicious characteristics

3. **suspicious-seed.jpg** (optional) - Image with ambiguous characteristics
   - Partially visible labels
   - Some missing information
   - Moderate quality

## Image Requirements

- **Format**: JPEG, PNG
- **Size**: Maximum 4MB per image
- **Resolution**: At least 256x256 pixels
- **Quality**: Clear, well-lit images

## Usage in Tests

These images are used by `azure-vision.test.ts` to validate:
- Classification accuracy
- Confidence scores
- Seed variety extraction
- Authenticity detection
- Performance benchmarks

## Note

These test images are not included in version control. You must provide your own test images that match your Azure Custom Vision model's training data.
