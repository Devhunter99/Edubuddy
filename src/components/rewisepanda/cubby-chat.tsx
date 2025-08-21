
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Bot } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { chatWithCubby } from '@/ai/flows/cubby-chat';
import { type MessageData } from 'genkit';
import { useAuth } from '@/hooks/use-auth';

const TypingIndicator = () => (
    <div className="flex items-center gap-1">
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
    </div>
);

export default function CubbyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  useEffect(() => {
      if(isOpen && messages.length === 0) {
          handleInitialGreeting();
      }
  }, [isOpen]);

  const handleInitialGreeting = async () => {
    setIsLoading(true);
    try {
        const result = await chatWithCubby({ history: [], message: "" });
        setMessages([{ role: 'model', content: [{ text: result.response }] }]);
    } catch (error) {
        console.error("Failed to get initial greeting:", error);
        setMessages([{ role: 'model', content: [{ text: "I'm having a little trouble connecting right now. Please try again later." }] }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: MessageData = { role: 'user', content: [{ text: input }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithCubby({
        history: newMessages.slice(0, -1),
        message: input,
      });
      const cubbyResponse: MessageData = { role: 'model', content: [{ text: result.response }] };
      setMessages([...newMessages, cubbyResponse]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorResponse: MessageData = { role: 'model', content: [{ text: "Oops! Something went wrong. Please try again." }] };
      setMessages([...newMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50" aria-label="Open Cubby Chat">
          <Bot className="h-8 w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 md:w-96 mr-2 mb-2 p-0 border-none">
        <div className="flex flex-col h-[60vh] bg-card rounded-lg shadow-2xl border">
          <header className="p-4 border-b flex items-center gap-3">
            <Avatar>
                <AvatarImage src="/stickers/small/studious-panda.png" alt="Cubby" data-ai-hint="studious panda" />
                <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">Cubby</h3>
              <p className="text-sm text-muted-foreground">Your friendly study panda</p>
            </div>
          </header>
          <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex items-end gap-2", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'model' && (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src="/stickers/small/studious-panda.png" alt="Cubby" data-ai-hint="studious panda"/>
                       <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[80%] p-3 rounded-xl whitespace-pre-wrap", 
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    {msg.content[0].text}
                  </div>
                  {msg.role === 'user' && (
                     <Avatar className="h-8 w-8">
                       <AvatarImage src={user?.photoURL ?? undefined} />
                       <AvatarFallback>{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src="/stickers/small/studious-panda.png" alt="Cubby" data-ai-hint="studious panda" />
                       <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                     <div className="max-w-[80%] p-3 rounded-xl bg-muted flex items-center gap-2">
                        <TypingIndicator />
                    </div>
                </div>
              )}
               <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Cubby anything..."
              className="resize-none min-h-0"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
