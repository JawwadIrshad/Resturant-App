import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Wallet,
  Check,
  Loader2,
  MapPin,
  User,
  Phone,
  UtensilsCrossed,
  Package,
  Truck
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const paymentMethods = [
  { id: 'card' as PaymentMethod, label: 'Card', icon: CreditCard },
  { id: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote },
  { id: 'upi' as PaymentMethod, label: 'UPI', icon: Smartphone },
  { id: 'wallet' as PaymentMethod, label: 'Wallet', icon: Wallet },
];

const orderTypes = [
  { id: 'dine-in', label: 'Dine In', icon: UtensilsCrossed },
  { id: 'takeaway', label: 'Takeaway', icon: Package },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, clearCart } = useCart();
  const { createOrder } = useOrders();
  
  const [step, setStep] = useState<'details' | 'payment' | 'confirm'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');

  const tax = cart.totalAmount * 0.1;
  const total = cart.totalAmount + tax;

  const handleSubmitDetails = () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (orderType === 'dine-in' && !tableNumber.trim()) {
      toast.error('Please enter table number');
      return;
    }
    setStep('payment');
  };

  const handleSubmitPayment = () => {
    setStep('confirm');
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const order = createOrder({
      items: cart.items,
      customerName,
      customerPhone,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      orderType,
      paymentMethod,
      notes: notes || undefined,
    });
    
    setCreatedOrderId(order.id);
    setIsProcessing(false);
    setOrderComplete(true);
    clearCart();
    toast.success('Order placed successfully!');
  };

  const handleClose = () => {
    if (orderComplete) {
      setOrderComplete(false);
      setStep('details');
      setCustomerName('');
      setCustomerPhone('');
      setTableNumber('');
      setNotes('');
    }
    onClose();
  };

  if (orderComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-[#fbf5dc] border-[#e39a22]/30">
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#13120f] mb-2">Order Confirmed!</h2>
            <p className="text-[#5d5d5d] text-center mb-4">
              Your order <span className="font-semibold text-[#e39a22]">{createdOrderId}</span> has been placed successfully
            </p>
            <div className="bg-white rounded-lg p-4 w-full mb-4 border border-[#e39a22]/20">
              <div className="flex justify-between mb-2">
                <span className="text-[#5d5d5d]">Total Amount</span>
                <span className="font-bold text-[#13120f]">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5d5d5d]">Estimated Time</span>
                <span className="font-semibold text-[#e39a22]">25-30 min</span>
              </div>
            </div>
            <Button 
              onClick={handleClose}
              className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90 w-full"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-[#fbf5dc] border-[#e39a22]/30 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#13120f]">
            {step === 'details' && 'Customer Details'}
            {step === 'payment' && 'Payment Method'}
            {step === 'confirm' && 'Confirm Order'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {['details', 'payment', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${step === s ? 'bg-[#e39a22] text-[#13120f]' : 
                    ['details', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-[#e9e9e9] text-[#5d5d5d]'}`}
              >
                {['details', 'payment', 'confirm'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && (
                <div className={`flex-1 h-1 mx-2 ${['details', 'payment', 'confirm'].indexOf(step) > i ? 'bg-green-500' : 'bg-[#e9e9e9]'}`} />
              )}
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1 pr-4">
          {step === 'details' && (
            <div className="space-y-4">
              {/* Order Type */}
              <div>
                <Label className="text-[#13120f] mb-2 block">Order Type</Label>
                <RadioGroup 
                  value={orderType} 
                  onValueChange={(v) => setOrderType(v as any)}
                  className="grid grid-cols-3 gap-2"
                >
                  {orderTypes.map((type) => (
                    <div key={type.id}>
                      <RadioGroupItem
                        value={type.id}
                        id={type.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={type.id}
                        className="flex flex-col items-center justify-center p-3 border-2 border-[#e39a22]/30 rounded-lg cursor-pointer
                                 peer-data-[state=checked]:border-[#e39a22] peer-data-[state=checked]:bg-[#e39a22]/10
                                 hover:border-[#e39a22]/50 transition-all"
                      >
                        <type.icon className="w-5 h-5 mb-1 text-[#e39a22]" />
                        <span className="text-sm text-[#13120f]">{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Customer Name */}
              <div>
                <Label htmlFor="name" className="text-[#13120f]">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5d5d5d]" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-10 bg-white border-[#e39a22]/30 focus:border-[#e39a22]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-[#13120f]">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5d5d5d]" />
                  <Input
                    id="phone"
                    placeholder="+1 234-567-8900"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="pl-10 bg-white border-[#e39a22]/30 focus:border-[#e39a22]"
                  />
                </div>
              </div>

              {/* Table Number (for dine-in) */}
              {orderType === 'dine-in' && (
                <div>
                  <Label htmlFor="table" className="text-[#13120f]">Table Number</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5d5d5d]" />
                    <Input
                      id="table"
                      placeholder="e.g., A5"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="pl-10 bg-white border-[#e39a22]/30 focus:border-[#e39a22]"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-[#13120f]">Special Instructions (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any allergies or special requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white border-[#e39a22]/30 focus:border-[#e39a22]"
                />
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <Label className="text-[#13120f]">Select Payment Method</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="grid grid-cols-2 gap-3"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id}>
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.id}
                      className="flex flex-col items-center justify-center p-4 border-2 border-[#e39a22]/30 rounded-lg cursor-pointer
                               peer-data-[state=checked]:border-[#e39a22] peer-data-[state=checked]:bg-[#e39a22]/10
                               hover:border-[#e39a22]/50 transition-all"
                    >
                      <method.icon className="w-8 h-8 mb-2 text-[#e39a22]" />
                      <span className="font-medium text-[#13120f]">{method.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="bg-white rounded-lg p-4 border border-[#e39a22]/20 mt-4">
                <h4 className="font-semibold text-[#13120f] mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5d5d5d]">Subtotal</span>
                    <span className="text-[#13120f]">${cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5d5d5d]">Tax (10%)</span>
                    <span className="text-[#13120f]">${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-[#e39a22]/20" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#13120f]">Total</span>
                    <span className="text-[#e39a22]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Order Details */}
              <div className="bg-white rounded-lg p-4 border border-[#e39a22]/20">
                <h4 className="font-semibold text-[#13120f] mb-3">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5d5d5d]">Customer</span>
                    <span className="text-[#13120f]">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5d5d5d]">Phone</span>
                    <span className="text-[#13120f]">{customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5d5d5d]">Order Type</span>
                    <Badge variant="secondary" className="bg-[#e39a22]/10 text-[#e39a22]">
                      {orderType}
                    </Badge>
                  </div>
                  {tableNumber && (
                    <div className="flex justify-between">
                      <span className="text-[#5d5d5d]">Table</span>
                      <span className="text-[#13120f]">{tableNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#5d5d5d]">Payment</span>
                    <span className="text-[#13120f] capitalize">{paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-lg p-4 border border-[#e39a22]/20">
                <h4 className="font-semibold text-[#13120f] mb-3">Items ({cart.totalItems})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#13120f]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-[#5d5d5d]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-[#e39a22]/10 rounded-lg p-4 border border-[#e39a22]/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#13120f]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#e39a22]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2">
          {step !== 'details' && (
            <Button
              variant="outline"
              onClick={() => setStep(step === 'payment' ? 'details' : 'payment')}
              className="border-[#e39a22]/30 text-[#13120f]"
            >
              Back
            </Button>
          )}
          {step === 'details' && (
            <Button
              onClick={handleSubmitDetails}
              className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
            >
              Continue
            </Button>
          )}
          {step === 'payment' && (
            <Button
              onClick={handleSubmitPayment}
              className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
            >
              Review Order
            </Button>
          )}
          {step === 'confirm' && (
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
