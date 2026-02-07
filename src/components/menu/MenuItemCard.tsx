import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Clock, 
  Flame, 
  AlertCircle,
  Check,
  Wheat,
  Egg,
  Milk,
  Fish,
  Shell
} from 'lucide-react';
import type { MenuItem } from '@/types';
import { useCart } from '@/hooks/useCart';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  featured?: boolean;
}

const allergenIcons: Record<string, React.ReactNode> = {
  gluten: <Wheat className="w-3 h-3" />,
  dairy: <Milk className="w-3 h-3" />,
  eggs: <Egg className="w-3 h-3" />,
  fish: <Fish className="w-3 h-3" />,
  shellfish: <Shell className="w-3 h-3" />,
  sesame: <span className="text-[10px]">Ses</span>,
};

export default function MenuItemCard({ item, featured = false }: MenuItemCardProps) {
  const { getItemQuantity, updateQuantity, addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const quantity = getItemQuantity(item.id);

  const handleAdd = () => {
    if (quantity === 0) {
      addToCart(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
  };

  const handleRemove = () => {
    updateQuantity(item.id, quantity - 1);
  };

  const isLowStock = item.stock > 0 && item.stock <= 5;
  const isOutOfStock = item.stock === 0 || !item.isAvailable;

  return (
    <Card 
      className={`group overflow-hidden bg-white border-[#e39a22]/20 hover:border-[#e39a22] 
                 transition-all duration-300 hover:shadow-xl hover:shadow-[#e39a22]/10
                 ${featured ? 'ring-2 ring-[#e39a22]/30' : ''}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#fbf5dc] animate-pulse" />
        )}
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-500 
                     group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13120f]/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {featured && (
            <Badge className="bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]">
              <Flame className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Out of Stock
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge className="bg-orange-500 text-white">
              <AlertCircle className="w-3 h-3 mr-1" />
              Low Stock
            </Badge>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-[#13120f]/90 text-[#fbf5dc] text-lg font-bold px-3 py-1">
            ${item.price}
          </Badge>
        </div>

        {/* Prep Time */}
        {item.prepTime && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-[#13120f]">
              <Clock className="w-3 h-3 mr-1" />
              {item.prepTime} min
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-[#13120f] mb-1 group-hover:text-[#e39a22] transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-[#5d5d5d] line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.allergens.map((allergen) => (
              <div
                key={allergen}
                className="w-6 h-6 rounded-full bg-[#e39a22]/10 flex items-center justify-center"
                title={`Contains ${allergen}`}
              >
                {allergenIcons[allergen] || <AlertCircle className="w-3 h-3 text-[#e39a22]" />}
              </div>
            ))}
          </div>
        )}

        {/* Stock Info */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm ${isLowStock ? 'text-orange-500' : 'text-[#5d5d5d]'}`}>
            {isOutOfStock ? 'Unavailable' : `${item.stock} in stock`}
          </span>
          {item.calories && (
            <span className="text-sm text-[#5d5d5d]">
              {item.calories} cal
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {quantity === 0 ? (
          <Button
            className="w-full bg-[#e39a22] text-[#13120f] hover:bg-[#e39a22]/90"
            onClick={handleAdd}
            disabled={isOutOfStock}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-[#e39a22] text-[#e39a22] hover:bg-[#e39a22]/10"
              onClick={handleRemove}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 flex items-center justify-center gap-2 bg-[#e39a22]/10 rounded-md py-2">
              <Check className="w-4 h-4 text-[#e39a22]" />
              <span className="font-semibold text-[#13120f]">{quantity}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-[#e39a22] text-[#e39a22] hover:bg-[#e39a22]/10"
              onClick={handleAdd}
              disabled={quantity >= item.stock}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
