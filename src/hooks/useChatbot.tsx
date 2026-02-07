import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { ChatMessage, MenuItem, CartState } from '@/types';

interface ChatbotContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  suggestions: string[];
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

// Sample menu knowledge base for the chatbot
const menuKnowledge = {
  categories: ['starters', 'mains', 'desserts', 'drinks'],
  popularItems: ['Wagyu Beef Burger', 'Lobster Risotto', 'Chocolate Lava Cake', 'Truffle Arancini'],
  dietaryOptions: {
    vegetarian: ['Burrata Salad', 'Margherita Pizza', 'Vegetable Pasta'],
    vegan: ['Garden Salad', 'Vegan Burger'],
    glutenFree: ['Grilled Salmon', 'Burrata Salad'],
  },
  hours: '11:00 AM - 11:00 PM daily',
  location: '123 Gourmet Street, Foodie City',
  phone: '+1 234-567-8900',
};

// Generate bot response based on user input
const generateBotResponse = (
  userMessage: string,
  cart: CartState,
  menuItems: MenuItem[]
): { content: string; suggestions: string[] } => {
  const lowerMsg = userMessage.toLowerCase();
  
  // Greeting
  if (lowerMsg.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return {
      content: `Hello! Welcome to our restaurant! I'm your virtual assistant. How can I help you today?`,
      suggestions: ['Show me the menu', 'What are your hours?', 'Do you have vegetarian options?', 'Check my cart'],
    };
  }

  // Menu related
  if (lowerMsg.includes('menu') || lowerMsg.includes('food') || lowerMsg.includes('dishes')) {
    return {
      content: `We offer a variety of delicious dishes across categories: Starters, Mains, Desserts, and Drinks. Our most popular items include ${menuKnowledge.popularItems.join(', ')}. Would you like to see a specific category?`,
      suggestions: ['Show starters', 'Show mains', 'Show desserts', 'Show drinks', 'What are your specials?'],
    };
  }

  // Specific category
  if (lowerMsg.includes('starter') || lowerMsg.includes('appetizer')) {
    const starters = menuItems.filter(i => i.category === 'starters').map(i => i.name).join(', ');
    return {
      content: `Our starters include: ${starters}. These are perfect to begin your culinary journey with us!`,
      suggestions: ['Add Truffle Arancini', 'Add Burrata Salad', 'Show me mains'],
    };
  }

  if (lowerMsg.includes('main') || lowerMsg.includes('entree')) {
    const mains = menuItems.filter(i => i.category === 'mains').map(i => i.name).join(', ');
    return {
      content: `Our main courses include: ${mains}. Each dish is crafted with passion and the finest ingredients!`,
      suggestions: ['Add Wagyu Beef Burger', 'Add Lobster Risotto', 'Show me desserts'],
    };
  }

  if (lowerMsg.includes('dessert') || lowerMsg.includes('sweet')) {
    const desserts = menuItems.filter(i => i.category === 'desserts').map(i => i.name).join(', ');
    return {
      content: `Indulge in our desserts: ${desserts}. The perfect ending to your meal!`,
      suggestions: ['Add Chocolate Lava Cake', 'Add Tiramisu', 'Show me drinks'],
    };
  }

  if (lowerMsg.includes('drink') || lowerMsg.includes('beverage')) {
    return {
      content: `We offer a selection of refreshing drinks including craft cocktails, wines, beers, and non-alcoholic beverages.`,
      suggestions: ['Show cocktails', 'Show wines', 'Show non-alcoholic drinks'],
    };
  }

  // Dietary preferences
  if (lowerMsg.includes('vegetarian') || lowerMsg.includes('veggie')) {
    return {
      content: `Yes, we have several vegetarian options including: ${menuKnowledge.dietaryOptions.vegetarian.join(', ')}. Would you like to add any of these to your cart?`,
      suggestions: ['Add Burrata Salad', 'Add Margherita Pizza', 'Show all vegetarian options'],
    };
  }

  if (lowerMsg.includes('vegan')) {
    return {
      content: `We have vegan options available: ${menuKnowledge.dietaryOptions.vegan.join(', ')}. Our chefs can also modify certain dishes to be vegan-friendly!`,
      suggestions: ['Add Vegan Burger', 'Add Garden Salad', 'What can be made vegan?'],
    };
  }

  if (lowerMsg.includes('gluten free') || lowerMsg.includes('gluten-free')) {
    return {
      content: `We offer gluten-free options including: ${menuKnowledge.dietaryOptions.glutenFree.join(', ')}. Please inform your server about any allergies.`,
      suggestions: ['Add Grilled Salmon', 'Add Burrata Salad', 'Show all gluten-free options'],
    };
  }

  // Hours and location
  if (lowerMsg.includes('hour') || lowerMsg.includes('open') || lowerMsg.includes('time')) {
    return {
      content: `We're open ${menuKnowledge.hours}. We look forward to serving you!`,
      suggestions: ['Make a reservation', 'Do you deliver?', 'Show me the menu'],
    };
  }

  if (lowerMsg.includes('location') || lowerMsg.includes('address') || lowerMsg.includes('where')) {
    return {
      content: `We're located at ${menuKnowledge.location}. You can also reach us at ${menuKnowledge.phone}.`,
      suggestions: ['Make a reservation', 'Do you deliver?', 'Show me the menu'],
    };
  }

  // Cart related
  if (lowerMsg.includes('cart') || lowerMsg.includes('bag') || lowerMsg.includes('basket')) {
    if (cart.totalItems === 0) {
      return {
        content: `Your cart is empty. Would you like to browse our menu and add some delicious items?`,
        suggestions: ['Show me the menu', 'What are your specials?', 'Show starters'],
      };
    }
    return {
      content: `You have ${cart.totalItems} item(s) in your cart with a total of $${cart.totalAmount.toFixed(2)}. Ready to checkout?`,
      suggestions: ['View cart', 'Checkout', 'Add more items', 'Clear cart'],
    };
  }

  // Reservation
  if (lowerMsg.includes('reservation') || lowerMsg.includes('book') || lowerMsg.includes('table')) {
    return {
      content: `You can make a reservation through our reservation page. We recommend booking in advance for weekends and special occasions!`,
      suggestions: ['Make a reservation', 'Check availability', 'Show me the menu'],
    };
  }

  // Delivery/Takeaway
  if (lowerMsg.includes('deliver') || lowerMsg.includes('takeaway') || lowerMsg.includes('pickup')) {
    return {
      content: `Yes, we offer both delivery and takeaway options! You can place your order here and choose your preferred option at checkout.`,
      suggestions: ['Show me the menu', 'Check my cart', 'How long does delivery take?'],
    };
  }

  // Pricing
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('expensive')) {
    return {
      content: `Our prices range from $8 for starters to $45 for premium mains. We offer great value for the quality and experience!`,
      suggestions: ['Show me the menu', 'Do you have any deals?', 'What are your specials?'],
    };
  }

  // Specials
  if (lowerMsg.includes('special') || lowerMsg.includes('deal') || lowerMsg.includes('offer') || lowerMsg.includes('discount')) {
    return {
      content: `Today's specials include our Chef's Signature Wagyu Burger and Lobster Risotto. We also have a happy hour from 4-6 PM with 20% off all drinks!`,
      suggestions: ['Add Wagyu Beef Burger', 'Add Lobster Risotto', 'Show me the full menu'],
    };
  }

  // Allergies
  if (lowerMsg.includes('allerg') || lowerMsg.includes('nut') || lowerMsg.includes('dairy') || lowerMsg.includes('shellfish')) {
    return {
      content: `We take allergies very seriously. Please inform us of any allergies when ordering, and our chefs will ensure your meal is prepared safely. Would you like to know about specific ingredients in any dish?`,
      suggestions: ['Show allergen information', 'Contact staff', 'Show me the menu'],
    };
  }

  // Help
  if (lowerMsg.includes('help') || lowerMsg.includes('assist') || lowerMsg.includes('support')) {
    return {
      content: `I'm here to help! I can assist you with:
• Browsing our menu
• Checking your cart
• Making reservations
• Answering questions about dietary options
• Providing information about hours and location

What would you like to know?`,
      suggestions: ['Show me the menu', 'Make a reservation', 'Contact human support'],
    };
  }

  // Thank you
  if (lowerMsg.includes('thank') || lowerMsg.includes('thanks')) {
    return {
      content: `You're very welcome! It's my pleasure to assist you. Enjoy your dining experience with us!`,
      suggestions: ['Show me the menu', 'Make a reservation', 'Goodbye'],
    };
  }

  // Goodbye
  if (lowerMsg.includes('bye') || lowerMsg.includes('goodbye') || lowerMsg.includes('see you')) {
    return {
      content: `Goodbye! Thank you for choosing our restaurant. Have a wonderful day!`,
      suggestions: [],
    };
  }

  // Default response
  return {
    content: `I'm not sure I understood that correctly. I can help you with our menu, taking orders, making reservations, or answering questions about our restaurant. What would you like to do?`,
    suggestions: ['Show me the menu', 'Make a reservation', 'Check my cart', 'Get help'],
  };
};

export function ChatbotProvider({ 
  children, 
  cart,
  menuItems 
}: { 
  children: ReactNode;
  cart: CartState;
  menuItems: MenuItem[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi there! Welcome to our restaurant! I\'m here to help you with our menu, orders, reservations, and any questions you might have. How can I assist you today?',
      timestamp: new Date().toISOString(),
      suggestions: ['Show me the menu', 'What are your hours?', 'Make a reservation', 'Check my cart'],
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot thinking and typing
    setTimeout(() => {
      const response = generateBotResponse(content, cart, menuItems);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, botMessage]);
      setSuggestions(response.suggestions);
      setIsTyping(false);
    }, 800 + Math.random() * 700); // Random delay between 800-1500ms
  }, [cart, menuItems]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi there! Welcome to our restaurant! I\'m here to help you with our menu, orders, reservations, and any questions you might have. How can I assist you today?',
        timestamp: new Date().toISOString(),
        suggestions: ['Show me the menu', 'What are your hours?', 'Make a reservation', 'Check my cart'],
      },
    ]);
    setSuggestions(['Show me the menu', 'What are your hours?', 'Make a reservation', 'Check my cart']);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isOpen,
      isTyping,
      toggleChat,
      openChat,
      closeChat,
      sendMessage,
      clearMessages,
      suggestions,
    }),
    [messages, isOpen, isTyping, toggleChat, openChat, closeChat, sendMessage, clearMessages, suggestions]
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}
