'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<string>;
  initialMessages?: Message[];
}

export function ChatInterface({ onSendMessage, initialMessages = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(input.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white shadow-md">
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center bg-emerald-100">
            <Bot className="h-5 w-5 text-emerald-800" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">AI Agricultural Assistant</h3>
            <p className="text-xs text-neutral-500">Powered by Azure OpenAI</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Bot className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">
                Hello! I'm your AI agricultural assistant powered by advanced language models. I have extensive knowledge about farming practices, seed verification, crop recommendations, and agricultural best practices. Ask me anything about agriculture!
              </p>
            </motion.div>
          )}
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-emerald-800' : 'bg-neutral-100'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-neutral-600" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 ${
                  message.role === 'user'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-emerald-200' : 'text-neutral-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 flex items-center justify-center bg-neutral-100">
                <Bot className="h-4 w-4 text-neutral-600" />
              </div>
              <div className="bg-neutral-100 p-3">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-800" />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="rounded-none border-2 focus:border-emerald-800 focus-visible:ring-0"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="rounded-none bg-emerald-800 hover:bg-emerald-900"
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
