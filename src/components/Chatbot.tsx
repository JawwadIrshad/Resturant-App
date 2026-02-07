import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';

export default function Chatbot() {
  const { 
    messages, 
    isOpen, 
    isTyping, 
    openChat, 
    closeChat, 
    sendMessage
  } = useChatbot();
  
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={openChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#e39a22] hover:bg-[#e39a22]/90 
                   text-[#13120f] shadow-lg shadow-[#e39a22]/30 z-50 p-0"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 bg-[#13120f] text-[#fbf5dc] px-4 py-3 rounded-lg 
                   shadow-lg cursor-pointer z-50 flex items-center gap-3 border border-[#e39a22]/30"
        onClick={() => setIsMinimized(false)}
      >
        <Bot className="w-5 h-5 text-[#e39a22]" />
        <span className="text-sm">Chat with us</span>
        <Maximize2 className="w-4 h-4 text-[#5d5d5d]" />
      </div>
    );
  }

  return (
  <>
    {/* Floating open button */}
    {!isOpen && (
      <Button
        onClick={openChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#e39a22]
                   hover:bg-[#e39a22]/90 text-[#13120f] shadow-lg z-50 p-0"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )}

    {/* Chat wrapper (always mounted) */}
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}
    >
      <div
        className={`w-96 max-w-[calc(100vw-3rem)] bg-[#fbf5dc] rounded-2xl
          shadow-2xl shadow-[#13120f]/20 overflow-hidden border border-[#e39a22]/30
          flex flex-col h-[600px]
          ${isMinimized ? 'h-14' : 'max-h-[600px]'}
        `}
      >
        {/* Header (always visible) */}
        <div className="bg-[#13120f] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e39a22] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#13120f]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#fbf5dc]">Restaurant Assistant</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-[#fbf5dc]/60">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized((prev) => !prev)}
              className="text-[#fbf5dc]/60 hover:text-[#fbf5dc] hover:bg-[#fbf5dc]/10"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="text-[#fbf5dc]/60 hover:text-[#fbf5dc] hover:bg-[#fbf5dc]/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages (hidden when minimized) */}
        {!isMinimized && (
          <ScrollArea className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-[#e39a22] text-[#13120f] rounded-2xl rounded-tr-sm'
                        : 'bg-white text-[#13120f] rounded-2xl rounded-tl-sm border border-[#e39a22]/20'
                    } px-4 py-3`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl border border-[#e39a22]/20 text-sm text-[#5d5d5d]">
                    Assistant is typing…
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Input (always visible) */}
        <div className="p-4 bg-white border-t border-[#e39a22]/20">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-[#fbf5dc] border-[#e39a22]/30 focus:border-[#e39a22]"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-[#5d5d5d] mt-2 text-center">
            Powered by AI • Ask me anything about our restaurant!
          </p>
        </div>
      </div>
    </div>
  </>
);
}
