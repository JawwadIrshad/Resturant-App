import { useState } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/hooks/useCart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, ChefHat, Star, Clock, Flame, Leaf, Fish, Coffee } from 'lucide-react';
import { toast } from 'sonner';

// Components
import MenuItemCard from '@/components/menu/MenuItemCard';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutModal from '@/components/checkout/CheckoutModal';

const categoryIcons: Record<string, React.ReactNode> = {
  all: <Star className="w-4 h-4" />,
  starters: <ChefHat className="w-4 h-4" />,
  mains: <Flame className="w-4 h-4" />,
  desserts: <Coffee className="w-4 h-4" />,
  drinks: <Coffee className="w-4 h-4" />,
};

const categoryLabels: Record<string, string> = {
  all: 'All Items',
  starters: 'Starters',
  mains: 'Main Courses',
  desserts: 'Desserts',
  drinks: 'Drinks',
};

export default function CustomerView() {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredItems,
    featuredItems,
  } = useMenu();

  const { cart, addToCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleAddToCart = (item: typeof filteredItems[0]) => {
    const result = addToCart(item);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf5dc]">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1920&h=1080&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#13120f]/90 via-[#13120f]/60 to-transparent" />
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90">
              <Star className="w-3 h-3 mr-1" />
              Award Winning Cuisine
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-[#fbf5dc] mb-4 leading-tight">
              Taste the <span className="text-[#e39a22]">Difference</span>
            </h1>
            <p className="text-lg md:text-xl text-[#fbf5dc]/80 mb-8">
              Experience culinary excellence in every bite. Our chefs craft unforgettable dishes 
              using the finest ingredients.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
                onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ChefHat className="w-5 h-5 mr-2" />
                Explore Menu
              </Button>
<Button 
  size="lg"
  className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
  onClick={() => setIsCartOpen(true)}
>
  <ShoppingCart className="w-5 h-5 mr-2" />
  View Cart
  {cart.totalItems > 0 && (
    <Badge className="ml-2 bg-[#13120f] text-[#fbf5dc] rounded-full px-2">
      {cart.totalItems}
    </Badge>
  )}
</Button>

            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#e39a22]/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-[#e39a22]" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#13120f]">Chef&apos;s Specials</h2>
            <p className="text-[#5d5d5d]">Our most popular dishes, handpicked for you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
              featured
            />
          ))}
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#13120f] mb-4">Our Menu</h2>
          <p className="text-[#5d5d5d] max-w-2xl mx-auto">
            Explore our diverse selection of dishes, crafted with passion and the finest ingredients
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5d5d5d]" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-[#e39a22]/30 focus:border-[#e39a22]"
            />
          </div>
          <Button
            variant="outline"
            className="border-[#e39a22] text-[#e39a22] hover:bg-[#e39a22]/10"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart ({cart.totalItems})
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex flex-wrap justify-start gap-2 bg-transparent mb-8">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-[#e39a22] data-[state=active]:text-[#13120f] 
                         bg-white text-[#5d5d5d] border border-[#e39a22]/30 hover:border-[#e39a22]
                         px-4 py-2 rounded-full transition-all"
              >
                {categoryIcons[category]}
                <span className="ml-2">{categoryLabels[category]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e39a22]/10 flex items-center justify-center">
                    <Search className="w-10 h-10 text-[#e39a22]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#13120f] mb-2">No items found</h3>
                  <p className="text-[#5d5d5d]">Try adjusting your search or filter</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-[#13120f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e39a22]/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#e39a22]" />
              </div>
              <h3 className="text-xl font-semibold text-[#fbf5dc] mb-2">Fast Service</h3>
              <p className="text-[#fbf5dc]/60">Average preparation time of 20 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e39a22]/20 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-[#e39a22]" />
              </div>
              <h3 className="text-xl font-semibold text-[#fbf5dc] mb-2">Fresh Ingredients</h3>
              <p className="text-[#fbf5dc]/60">Sourced daily from local suppliers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#e39a22]/20 flex items-center justify-center">
                <Fish className="w-8 h-8 text-[#e39a22]" />
              </div>
              <h3 className="text-xl font-semibold text-[#fbf5dc] mb-2">Quality Assured</h3>
              <p className="text-[#fbf5dc]/60">Premium ingredients, expertly prepared</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
