import { useState, useCallback, useMemo } from 'react';
import type { MenuItem } from '@/types';

// Sample menu data with images
const sampleMenuItems: MenuItem[] = [
  // Starters
  {
    id: '1',
    name: 'Truffle Arancini',
    description: 'Crispy risotto balls infused with black truffle, served with garlic aioli',
    price: 12,
    category: 'starters',
    image: 'https://img.freepik.com/free-photo/tasty-food-croquettes-bowl_23-2149202674.jpg?t=st=1770305356~exp=1770308956~hmac=11728e2bf974292ef36bf0b4066dc2d7eb35c60a99aef7835de49cf61a96d733',
    stock: 15,
    isAvailable: true,
    isFeatured: true,
    prepTime: 15,
    calories: 320,
    allergens: ['gluten', 'dairy'],
  },
  {
    id: '2',
    name: 'Tuna Tartare',
    description: 'Fresh yellowfin tuna with avocado, sesame, and citrus soy dressing',
    price: 18,
    category: 'starters',
    image: 'https://img.freepik.com/free-photo/salmon-tartare-with-avocado-mousse_2829-8090.jpg?t=st=1770465631~exp=1770469231~hmac=e80c3fbc2b81bdee14cb0d0030cb43ef4fa026edceb8da95efc1fdbeff2698b4&w=1060',
    stock: 8,
    isAvailable: true,
    prepTime: 12,
    calories: 240,
    allergens: ['fish', 'sesame', 'soy'],
  },
  {
    id: '3',
    name: 'Burrata Salad',
    description: 'Creamy burrata with heirloom tomatoes, basil oil, and balsamic glaze',
    price: 16,
    category: 'starters',
    image: 'https://img.freepik.com/free-photo/delicious-cheese-tomatoes-high-angle_23-2150062793.jpg?t=st=1770465730~exp=1770469330~hmac=06396a99d2693f7dcb2c215fafdfd571bcf2ef85a8b437b4d1e9368ac45fec40&w=1060',
    stock: 12,
    isAvailable: true,
    prepTime: 10,
    calories: 380,
    allergens: ['dairy'],
  },
  {
    id: '4',
    name: 'Crispy Calamari',
    description: 'Tender calamari rings with lemon herb seasoning and marinara sauce',
    price: 14,
    category: 'starters',
    image: 'https://img.freepik.com/free-photo/fried-squid-calamari-rings_1339-5032.jpg?t=st=1770465811~exp=1770469411~hmac=b90ee2c1f2ea16e1045e9988d2c68fe548e6be724c6d839347f08b102619a296&w=1060',
    stock: 20,
    isAvailable: true,
    prepTime: 12,
    calories: 420,
    allergens: ['gluten', 'shellfish'],
  },
  // Mains
  {
    id: '5',
    name: 'Wagyu Beef Burger',
    description: 'Premium wagyu patty with caramelized onions, aged cheddar, and truffle mayo',
    price: 28,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
    stock: 10,
    isAvailable: true,
    isFeatured: true,
    prepTime: 20,
    calories: 850,
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: '6',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter sauce, asparagus, and herb potatoes',
    price: 32,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    stock: 8,
    isAvailable: true,
    prepTime: 25,
    calories: 620,
    allergens: ['fish', 'dairy'],
  },
  {
    id: '7',
    name: 'Lobster Risotto',
    description: 'Creamy arborio rice with butter-poached lobster and saffron',
    price: 42,
    category: 'mains',
    image: 'https://img.freepik.com/free-photo/salad-with-herbs-topped-with-srimp_141793-838.jpg?t=st=1770465352~exp=1770468952~hmac=28e9b0112301807f3fb71edfb89a122c728eccf70a68437c95b198eaa3b0784d&w=1060',
    stock: 6,
    isAvailable: true,
    isFeatured: true,
    prepTime: 30,
    calories: 720,
    allergens: ['shellfish', 'dairy'],
  },
  {
    id: '8',
    name: 'Margherita Pizza',
    description: 'Wood-fired pizza with San Marzano tomatoes, fresh mozzarella, and basil',
    price: 22,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop',
    stock: 15,
    isAvailable: true,
    prepTime: 18,
    calories: 780,
    allergens: ['gluten', 'dairy'],
  },
  {
    id: '9',
    name: 'Chicken Parmigiana',
    description: 'Breaded chicken breast with marinara, mozzarella, and parmesan',
    price: 26,
    category: 'mains',
    image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop',
    stock: 12,
    isAvailable: true,
    prepTime: 22,
    calories: 920,
    allergens: ['gluten', 'dairy'],
  },
  // Desserts
  {
    id: '10',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    price: 14,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop',
    stock: 20,
    isAvailable: true,
    isFeatured: true,
    prepTime: 15,
    calories: 520,
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: '11',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
    price: 12,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',
    stock: 15,
    isAvailable: true,
    prepTime: 5,
    calories: 380,
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    id: '12',
    name: 'Crème Brûlée',
    description: 'Rich vanilla custard with a caramelized sugar crust',
    price: 13,
    category: 'desserts',
    image: 'https://img.freepik.com/free-photo/delicious-creme-brulee-delight_23-2151940282.jpg?t=st=1770465948~exp=1770469548~hmac=4e32507bf6e3bd7cc5dd2094e04941ceb09d46c2c74c04b38924210b2f1358bc&w=1060',
    stock: 10,
    isAvailable: true,
    prepTime: 5,
    calories: 340,
    allergens: ['dairy', 'eggs'],
  },
  {
    id: '13',
    name: 'Panna Cotta',
    description: 'Silky vanilla panna cotta with berry compote',
    price: 11,
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop',
    stock: 12,
    isAvailable: true,
    prepTime: 5,
    calories: 280,
    allergens: ['dairy'],
  },
  // Drinks
  {
    id: '14',
    name: 'Signature Mojito',
    description: 'Fresh mint, lime, rum, and soda water with a hint of passion fruit',
    price: 14,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=400&fit=crop',
    stock: 50,
    isAvailable: true,
    prepTime: 5,
    calories: 180,
    allergens: [],
  },
  {
    id: '15',
    name: 'Old Fashioned',
    description: 'Bourbon, bitters, sugar, and orange peel - a timeless classic',
    price: 16,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop',
    stock: 50,
    isAvailable: true,
    prepTime: 5,
    calories: 160,
    allergens: [],
  },
  {
    id: '16',
    name: 'Fresh Lemonade',
    description: 'House-made lemonade with fresh mint and a touch of honey',
    price: 8,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop',
    stock: 30,
    isAvailable: true,
    prepTime: 3,
    calories: 120,
    allergens: [],
  },
  {
    id: '17',
    name: 'Espresso Martini',
    description: 'Vodka, coffee liqueur, and fresh espresso with a creamy foam',
    price: 15,
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop',
    stock: 40,
    isAvailable: true,
    prepTime: 5,
    calories: 200,
    allergens: [],
  },
];

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category));
    return ['all', ...Array.from(cats)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const featuredItems = useMemo(() => {
    return menuItems.filter((item) => item.isFeatured);
  }, [menuItems]);

  const getItemsByCategory = useCallback((category: string) => {
    return menuItems.filter((item) => item.category === category);
  }, [menuItems]);

  const getItemById = useCallback((id: string) => {
    return menuItems.find((item) => item.id === id);
  }, [menuItems]);

  const updateItemStock = useCallback((id: string, newStock: number) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: Math.max(0, newStock), isAvailable: newStock > 0 }
          : item
      )
    );
  }, []);

  const updateItemAvailability = useCallback((id: string, isAvailable: boolean) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable } : item
      )
    );
  }, []);

  const decrementStock = useCallback((id: string, amount: number = 1) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock - amount);
          return { ...item, stock: newStock, isAvailable: newStock > 0 };
        }
        return item;
      })
    );
  }, []);

  return {
    menuItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredItems,
    featuredItems,
    getItemsByCategory,
    getItemById,
    updateItemStock,
    updateItemAvailability,
    decrementStock,
  };
}
