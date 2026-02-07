import { useState } from 'react';
import { CartProvider } from '@/hooks/useCart';
import { OrdersProvider } from '@/hooks/useOrders';
import { StockProvider } from '@/hooks/useStock';
import { useMenu } from '@/hooks/useMenu';
import { ChatbotProvider } from '@/hooks/useChatbot';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Views
import CustomerView from '@/views/CustomerView';
import AdminDashboard from '@/views/AdminDashboard';
import KitchenView from '@/views/KitchenView';

// Components
import Chatbot from '@/components/Chatbot';
import { ChefHat, LayoutDashboard, Users, UtensilsCrossed } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin' | 'kitchen'>('customer');
  const { menuItems, cart } = useMenuForChatbot();

  return (
    <ChatbotProvider cart={cart} menuItems={menuItems}>
      <div className="min-h-screen bg-[#fbf5dc]">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-[#13120f]/95 backdrop-blur-sm border-b border-[#e39a22]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e39a22] flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-[#13120f]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#fbf5dc]">FoodieMeal</h1>
                  <p className="text-xs text-[#fbf5dc]/60">Restaurant Management</p>
                </div>
              </div>

              {/* View Switcher */}
              <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)} className="hidden md:block">
                <TabsList className="bg-[#fbf5dc]/10">
                  <TabsTrigger 
                    value="customer" 
                    className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f] text-[#fbf5dc]"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Customer
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin"
                    className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f] text-[#fbf5dc]"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin
                  </TabsTrigger>
                  <TabsTrigger 
                    value="kitchen"
                    className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f] text-[#fbf5dc]"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Kitchen
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Mobile View Switcher */}
              <div className="md:hidden flex gap-2">
                <button
                  onClick={() => setCurrentView('customer')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentView === 'customer' ? 'bg-[#e39a22] text-[#13120f]' : 'text-[#fbf5dc]/60'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentView === 'admin' ? 'bg-[#e39a22] text-[#13120f]' : 'text-[#fbf5dc]/60'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentView('kitchen')}
                  className={`p-2 rounded-lg transition-colors ${
                    currentView === 'kitchen' ? 'bg-[#e39a22] text-[#13120f]' : 'text-[#fbf5dc]/60'
                  }`}
                >
                  <ChefHat className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {currentView === 'customer' && <CustomerView />}
          {currentView === 'admin' && <AdminDashboard />}
          {currentView === 'kitchen' && <KitchenView />}
        </main>

        {/* Chatbot */}
        <Chatbot />

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#13120f',
              color: '#fbf5dc',
              border: '1px solid #e39a22',
            },
          }}
        />
      </div>
    </ChatbotProvider>
  );
}

// Wrapper to get cart and menu for chatbot
function useMenuForChatbot() {
  const { filteredItems } = useMenu();
  // We'll get cart from context in ChatbotProvider
  return { menuItems: filteredItems, cart: { items: [], totalAmount: 0, totalItems: 0 } };
}

function App() {
  return (
    <CartProvider>
      <OrdersProvider>
        <StockProvider>
          <AppContent />
        </StockProvider>
      </OrdersProvider>
    </CartProvider>
  );
}

export default App;
