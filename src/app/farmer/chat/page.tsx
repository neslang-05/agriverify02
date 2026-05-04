'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatInterface } from '@/components/farmer/chat-interface';
import { getChatResponse } from '@/app/actions/verification';

export default function ChatPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    const response = await getChatResponse(message);
    return response;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900">AI Assistant</h1>
        <p className="text-neutral-500 mt-1">
          Get guidance on seeds, fertilizers, and farming practices with AI-powered responses.
        </p>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ChatInterface onSendMessage={handleSendMessage} />
      </motion.div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="rounded-none shadow-md border-none bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              💡 Tips for using the AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Ask about specific crops like &quot;rice&quot; or &quot;wheat&quot;</li>
              <li>• Inquire about how to identify fake products</li>
              <li>• Get fertilizer application recommendations</li>
              <li>• Learn about certified seed varieties</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
