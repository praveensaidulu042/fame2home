// Sample product data for Farm2Home marketplace
// Realistic Indian market prices and farm origins

export const SAMPLE_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Farm Fresh Tomatoes',
    category: 'Vegetables',
    price: 38,
    originalPrice: 50,
    unit: '1 kg',
    stock: 85,
    rating: 4.8,
    reviewsCount: 142,
    farmer: {
      name: 'Ramesh Patil',
      location: 'Nashik, Maharashtra',
      distance: '45 km away',
      harvestDate: 'Harvested Today, 5:30 AM'
    },
    badge: 'Best Seller',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    description: 'Vine-ripened, juicy red tomatoes naturally grown without synthetic pesticides. Perfect for curries, salads, and gravies.'
  },
  {
    id: 'prod-2',
    name: 'Mountain Golden Potatoes',
    category: 'Vegetables',
    price: 32,
    originalPrice: 42,
    unit: '1 kg',
    stock: 140,
    rating: 4.7,
    reviewsCount: 98,
    farmer: {
      name: 'Suresh Verma',
      location: 'Hassan, Karnataka',
      distance: '62 km away',
      harvestDate: 'Harvested Yesterday'
    },
    badge: 'Pesticide Free',
    isOrganic: false,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    description: 'Freshly harvested firm potatoes with thin skins, ideal for crispy aloo fry, parathas, and homestyle curries.'
  },
  {
    id: 'prod-3',
    name: 'Nashik Red Onions',
    category: 'Vegetables',
    price: 45,
    originalPrice: 60,
    unit: '1 kg',
    stock: 195,
    rating: 4.9,
    reviewsCount: 215,
    farmer: {
      name: 'Balasaheb Shinde',
      location: 'Lasalgaon, Maharashtra',
      distance: '38 km away',
      harvestDate: 'Harvested 2 days ago'
    },
    badge: 'Popular',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp, pungent, nutrient-rich red onions directly from India\'s onion capital. Sun-cured for lasting freshness.'
  },
  {
    id: 'prod-4',
    name: 'Ratnagiri Alphonso Mangoes',
    category: 'Fruits',
    price: 480,
    originalPrice: 650,
    unit: '1 Dozen (12 pcs)',
    stock: 50,
    rating: 5.0,
    reviewsCount: 320,
    farmer: {
      name: 'Ganesh Sawant',
      location: 'Ratnagiri, Maharashtra',
      distance: '120 km away',
      harvestDate: 'Tree-ripened, fresh batch'
    },
    badge: 'Seasonal King',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    description: 'Naturally carbide-free, handpicked King of Mangoes with heavenly aroma, golden pulp, and rich tropical sweetness.'
  },
  {
    id: 'prod-5',
    name: 'Tender Farm Spinach (Palak)',
    category: 'Leafy Greens',
    price: 24,
    originalPrice: 35,
    unit: '500 g bunch',
    stock: 0,
    rating: 4.8,
    reviewsCount: 88,
    farmer: {
      name: 'Anandi Devi',
      location: 'Khed, Pune',
      distance: '28 km away',
      harvestDate: 'Harvested Today, 6:00 AM'
    },
    badge: 'Freshly Picked',
    isOrganic: true,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp, emerald-green iron-rich spinach leaves washed in clean spring water. Perfect for palak paneer and healthy smoothies.'
  }
];

export const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Leafy Greens'];
export const FORM_CATEGORIES = ['Vegetables', 'Fruits', 'Leafy Greens'];

