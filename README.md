# Fake Seed Detection System

A Next.js application for detecting counterfeit agricultural seeds and fertilizers using AI-powered verification and an intelligent chat assistant.

## Features

- **Seed & Fertilizer Verification**: Upload images of product packaging for AI-powered authenticity verification
- **AI Chat Assistant**: Get farming advice and recommendations from an Azure OpenAI-powered chatbot with custom agricultural knowledge base
- **Analytics Dashboard**: Monitor verification trends and user activity
- **Multi-role Support**: Separate interfaces for farmers and agricultural officers

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **AI/ML**: Azure Computer Vision, Azure Custom Vision, Azure OpenAI
- **Database**: Supabase
- **UI Components**: Radix UI, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Azure subscription with access to:
  - Azure Computer Vision
  - Azure Custom Vision
  - Azure OpenAI Service

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fake-seed-detection
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Azure Computer Vision
AZURE_COMPUTER_VISION_ENDPOINT=your-vision-endpoint
AZURE_COMPUTER_VISION_KEY=your-vision-key

# Azure Custom Vision
AZURE_CUSTOM_VISION_PREDICTION_URL=your-custom-vision-url
AZURE_CUSTOM_VISION_PREDICTION_KEY=your-custom-vision-key
AZURE_CUSTOM_VISION_PROJECT_ID=your-project-id
AZURE_CUSTOM_VISION_ITERATION_NAME=your-iteration-name

# Azure OpenAI (for AI Chat Assistant)
AZURE_OPENAI_ENDPOINT=your-openai-endpoint
AZURE_OPENAI_API_KEY=your-openai-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
ENABLE_AZURE_OPENAI_CHAT=true
```

### Azure Setup Instructions

#### 1. Azure Computer Vision
- Create a Computer Vision resource in Azure Portal
- Copy the endpoint and key to your environment variables

#### 2. Azure Custom Vision
- Create a Custom Vision resource
- Train a model for seed/fertilizer classification
- Publish the model and note the prediction URL and keys

#### 3. Azure OpenAI
- Apply for Azure OpenAI access
- Create an OpenAI resource
- Deploy a GPT model (e.g., gpt-4o-mini)
- Copy the endpoint, key, and deployment name

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── actions/           # Server actions
│   ├── api/               # API routes
│   └── farmer/            # Farmer-specific pages
├── components/            # Reusable UI components
├── lib/                   # Utility libraries
│   ├── azure/            # Azure service integrations
│   └── supabase/         # Database client
└── types/                # TypeScript type definitions
```

## AI Chat Assistant

The application includes an intelligent chat assistant powered by Azure OpenAI with a custom knowledge base covering:

- Seed verification procedures
- Crop recommendations by region
- Fertilizer guidelines
- Pest management
- Sustainable farming practices
- Government agricultural schemes

The assistant provides context-aware responses based on the integrated knowledge base and can guide users through the verification process.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing

```bash
npm run test
```

## Deployment

The application can be deployed to Vercel, Netlify, or any Node.js hosting platform.

For production deployment, ensure all Azure services are properly configured and environment variables are set.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
