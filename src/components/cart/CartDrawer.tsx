import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  ChefHat,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    onCheckout();
  };

  const tax = cart.totalAmount * 0.1; // 10% tax
  const total = cart.totalAmount + tax;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-[#fbf5dc] border-l border-[#e39a22]/30 flex flex-col">
        <SheetHeader className="border-b border-[#e39a22]/20 pb-4">
          <SheetTitle className="flex items-center gap-3 text-[#13120f]">
            <div className="w-10 h-10 rounded-full bg-[#e39a22] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#13120f]" />
            </div>
            <div>
              <span className="text-xl font-bold">Your Cart</span>
              <p className="text-sm text-[#5d5d5d] font-normal">
                {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-[#e39a22]/10 flex items-center justify-center mb-4">
              <ChefHat className="w-12 h-12 text-[#e39a22]" />
            </div>
            <h3 className="text-xl font-semibold text-[#13120f] mb-2">Your cart is empty</h3>
            <p className="text-[#5d5d5d] text-center max-w-xs mb-6">
              Browse our menu and add some delicious items to your cart
            </p>
            <Button 
              onClick={onClose}
              className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg p-4 border border-[#e39a22]/20 hover:border-[#e39a22]/50 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-[#13120f] truncate">{item.name}</h4>
                            <p className="text-sm text-[#5d5d5d] line-clamp-1">{item.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Stock Warning */}
                        {item.stock <= item.quantity + 2 && (
                          <div className="flex items-center gap-1 mt-1 text-orange-500 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>Only {item.stock} available</span>
                          </div>
                        )}

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-[#e39a22] text-[#e39a22] hover:bg-[#e39a22]/10"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-[#13120f]">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-[#e39a22] text-[#e39a22] hover:bg-[#e39a22]/10"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#13120f]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-[#5d5d5d]">
                              ${item.price} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t border-[#e39a22]/20 pt-4 flex-col gap-4">
              {/* Order Summary */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5d5d5d]">Subtotal</span>
                  <span className="text-[#13120f]">${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5d5d5d]">Tax (10%)</span>
                  <span className="text-[#13120f]">${tax.toFixed(2)}</span>
                </div>
                <Separator className="bg-[#e39a22]/20" />
                <div className="flex justify-between">
                  <span className="font-semibold text-[#13120f]">Total</span>
                  <span className="font-bold text-xl text-[#e39a22]">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-500 hover:bg-red-50"
                  onClick={() => {
                    clearCart();
                    toast.success('Cart cleared');
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button
                  className="flex-[2] bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
                  onClick={handleCheckout}
                >
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
