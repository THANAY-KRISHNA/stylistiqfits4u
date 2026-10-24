import { Product } from '../types';

export const CATEGORIES_DATA = [
  { name: 'Kurtis', count: 24, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', description: 'Graceful straight, A-line & flared kurtas' },
  { name: 'Sets', count: 18, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', description: 'Kurta with matching bottoms and dupattas' },
  { name: 'Dresses', count: 16, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80', description: 'Flowy tiered maxis, wraps & festive wear' },
  { name: 'Tops', count: 20, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=600&q=80', description: 'Everyday casual shirts, peplums & blouses' },
  { name: 'Bottoms', count: 12, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80', description: 'Palazzos, cigarette pants & culottes' },
  { name: 'Co-ords', count: 14, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', description: 'Effortless coordinated matching separates' },
  { name: 'Accessories', count: 10, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', description: 'Jhumkas, potlis & handcrafted jewelry' }
];

export const PRODUCTS: Product[] = [
  {
    id: 'floral-kurti-set',
    name: 'Floral Kurti Set',
    category: 'Kurtis',
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviewCount: 120,
    badge: 'NEW',
    inStock: true,
    description: 'Elegant floral printed kurti set crafted in breathable rayon blend, paired with coordinating bottoms and lightweight matching dupatta. Perfect for casual outings, college wear, or small intimate gatherings.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Lavender', hex: '#BCA4D2' },
      { name: 'Sage Green', hex: '#9EAD9B' },
      { name: 'Blush Pink', hex: '#E6B8B8' },
      { name: 'Ivory Gold', hex: '#E3D7C5' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fabric: 'Premium Rayon Blend with Soft Sheen',
    kurtiLength: '46 inches (Calf Length)',
    dupatta: '2.4 meters lightweight flowy dupatta',
    setIncludes: 'Kurti, Tailored Pant & Dupatta',
    occasion: 'Casual Day Out, College, Small Gatherings, Office Casual',
    care: 'Hand wash / Gentle cold machine wash inside out',
    featured: true,
    newArrival: true,
    reviews: [
      {
        id: 'rev-1',
        author: 'Ananya Sharma',
        rating: 5,
        date: '14 Oct 2026',
        comment: 'Absolutely in love with the lavender shade! The fabric feels so soft and breezy for warm weather. True to size.',
        verified: true,
        sizePurchased: 'M'
      },
      {
        id: 'rev-2',
        author: 'Pooja Verma',
        rating: 4.8,
        date: '02 Oct 2026',
        comment: 'Got so many compliments at college. The dupatta print matches the sleeves so well. Fast delivery too!',
        verified: true,
        sizePurchased: 'S'
      }
    ]
  },
  {
    id: 'embroidered-co-ord-set',
    name: 'Embroidered Co-ord Set',
    category: 'Co-ords',
    price: 1599,
    originalPrice: 1999,
    rating: 4.7,
    reviewCount: 98,
    badge: 'BESTSELLER',
    inStock: true,
    description: 'Sophisticated dark chocolate noir co-ord featuring intricate golden thread embroidery along the placket and cuffs. High-slit longline tunic with matching straight trousers for an effortless modern ethnic silhouette.',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Midnight Chocolate', hex: '#261D1A' },
      { name: 'Olive Bronze', hex: '#58533F' },
      { name: 'Deep Wine', hex: '#4E2129' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: 'Fine Slub Rayon with Zari Thread Detailing',
    kurtiLength: '42 inches',
    dupatta: 'Not applicable (2-Piece Set)',
    setIncludes: 'Embroidered Tunic Top & Straight Pants',
    occasion: 'Festive Dinners, Evening Brunches, Friday Formals',
    care: 'Dry clean recommended for initial wash',
    featured: true,
    newArrival: false,
    reviews: [
      {
        id: 'rev-3',
        author: 'Meera Iyer',
        rating: 5,
        date: '28 Sep 2026',
        comment: 'Looks far more expensive than ₹1,599! The embroidery is neat and pants have comfortable deep pockets.',
        verified: true,
        sizePurchased: 'L'
      }
    ]
  },
  {
    id: 'printed-a-line-kurti',
    name: 'Printed A-Line Kurti',
    category: 'Kurtis',
    price: 1199,
    originalPrice: 1499,
    rating: 4.6,
    reviewCount: 76,
    badge: 'NEW',
    inStock: true,
    description: 'Refreshing botanical sage print A-line kurti with delicate V-neckline and bell sleeve cuffs. Graceful movement with comfortable side pockets for daily wear.',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Botanical Sage', hex: '#879F84' },
      { name: 'Earthy Rust', hex: '#A85A48' },
      { name: 'Pale Mustard', hex: '#D6AE58' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fabric: '100% Breathable Pure Cotton',
    kurtiLength: '44 inches',
    setIncludes: 'Single Kurti',
    occasion: 'Everyday Wear, Workwear, Casual Brunch',
    care: 'Machine wash with like colors',
    featured: true,
    newArrival: true
  },
  {
    id: 'tiered-maxi-dress',
    name: 'Tiered Maxi Dress',
    category: 'Dresses',
    price: 1499,
    originalPrice: 1899,
    rating: 4.6,
    reviewCount: 64,
    badge: 'BESTSELLER',
    inStock: true,
    description: 'Whimsical three-tiered maxi dress in romantic blush rose. Designed with soft flutter sleeves, a cinched drawstring waist, and gentle volume that twirls effortlessly.',
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Blush Rose', hex: '#DE9C97' },
      { name: 'Teal Lagoon', hex: '#4B7B82' },
      { name: 'Champagne Sand', hex: '#E4D5C5' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Flowy Georgette with Butter-Crepe Lining',
    kurtiLength: '52 inches (Ankle Length)',
    setIncludes: 'Full Length Tiered Dress with Tie Belt',
    occasion: 'Vacation, Sunday Brunch, Sunset Parties',
    care: 'Gentle hand wash in cold water',
    featured: true,
    newArrival: false
  },
  {
    id: 'cotton-co-ord-set',
    name: 'Cotton Linen Co-ord Set',
    category: 'Co-ords',
    price: 1399,
    originalPrice: 1699,
    rating: 4.7,
    reviewCount: 91,
    inStock: true,
    description: 'Chic resort-inspired co-ord set in breathable cotton linen. Features a smart camp collar shirt with tortoise buttons and relaxed high-waisted cropped trousers.',
    images: [
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Natural Sand', hex: '#DFD3C3' },
      { name: 'Terracotta', hex: '#B85D43' },
      { name: 'Slate Teal', hex: '#52797C' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: 'Premium Washed Cotton-Linen Blend',
    setIncludes: 'Notched Collar Shirt & Elasticated Back Pants',
    occasion: 'Resort Wear, Travel, Casual Workday',
    care: 'Warm iron inside out, gentle wash',
    featured: false,
    newArrival: true
  },
  {
    id: 'embroidered-kurti-set',
    name: 'Embroidered Festive Kurti Set',
    category: 'Sets',
    price: 1699,
    originalPrice: 2199,
    rating: 4.8,
    reviewCount: 83,
    badge: 'NEW',
    inStock: true,
    description: 'Opulent festive kurti set with delicate resham and sitara embroidery on organza paneling. Paired with a shimmering scallop-bordered organza dupatta.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Lilac Mist', hex: '#CDB7D9' },
      { name: 'Mint Frost', hex: '#BBD5C6' },
      { name: 'Powder Blue', hex: '#B4CDE0' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Chanderi Silk Blend with Organza Scallops',
    kurtiLength: '45 inches',
    dupatta: '2.5 meters scalloped organza dupatta',
    setIncludes: 'Silk Blend Kurti, Pants & Embroidered Dupatta',
    occasion: 'Festivals, Puja, Intimate Weddings, Eid, Diwali',
    care: 'Dry clean only',
    featured: true,
    newArrival: true
  },
  {
    id: 'casual-button-top',
    name: 'Casual Button-Down Cotton Top',
    category: 'Tops',
    price: 899,
    originalPrice: 1099,
    rating: 4.5,
    reviewCount: 50,
    inStock: true,
    description: 'Everyday staple top in soft organic cotton. Features subtle front pintucks, wooden buttons, and a relaxed boxy cut that tucks seamlessly into palazzos or jeans.',
    images: [
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Pistachio Sage', hex: '#9BB29B' },
      { name: 'Warm Vanilla', hex: '#F3EDE2' },
      { name: 'Dusty Peach', hex: '#E7B8A4' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Khadi Weave Cotton',
    setIncludes: 'Single Top',
    occasion: 'Daily College, Casual Office, Cafe Hangouts',
    care: 'Machine wash regular',
    featured: false,
    newArrival: false
  },
  {
    id: 'palazzo-pants-black',
    name: 'Pleated Flared Palazzo Pants',
    category: 'Bottoms',
    price: 999,
    originalPrice: 1299,
    rating: 4.6,
    reviewCount: 48,
    inStock: true,
    description: 'Ultra-comfortable wide-leg palazzos with deep double side pockets, a clean flat front waist, and an elasticated back waistband for all-day comfort.',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Midnight Black', hex: '#1C1917' },
      { name: 'Raw Off-White', hex: '#ECE8DF' },
      { name: 'Forest Olive', hex: '#4A5340' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fabric: 'Heavy Rayon Twill with Fluid Drape',
    setIncludes: 'Single Palazzo Pant',
    occasion: 'Versatile Ethnic & Indo-Western Pairings',
    care: 'Gentle wash inside out',
    featured: false,
    newArrival: false
  },
  {
    id: 'printed-boho-dress',
    name: 'Printed Boho Midi Dress',
    category: 'Dresses',
    price: 1299,
    originalPrice: 1699,
    rating: 4.6,
    reviewCount: 67,
    inStock: true,
    description: 'Vintage-inspired bohemian midi dress with hand-block inspired floral motifs, tassel tie-ups at the collar, and subtle smocked cuffs.',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Indigo Night', hex: '#1F2A38' },
      { name: 'Maroon Spice', hex: '#59252A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: 'Mulmul Cotton with Cotton Lining',
    kurtiLength: '48 inches',
    setIncludes: 'Single Midi Dress with Fabric Belt',
    occasion: 'Weekend Getaways, Art Exhibits, Dinners',
    care: 'Cold hand wash with mild detergent',
    featured: false,
    newArrival: true
  },
  {
    id: 'potli-embroidered-bag',
    name: 'Zari Embroidered Velvet Potli',
    category: 'Accessories',
    price: 849,
    originalPrice: 1199,
    rating: 4.9,
    reviewCount: 42,
    badge: 'LIMITED',
    inStock: true,
    description: 'Handcrafted plush velvet potli purse adorned with resham threadwork, golden pearls, and heavy braided drawstring with custom latkan tassels.',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Old Rose', hex: '#B57C76' },
      { name: 'Emerald', hex: '#264A38' },
      { name: 'Deep Burgundy', hex: '#4B1C24' }
    ],
    sizes: ['Free Size'],
    fabric: 'Micro Velvet with Satin Lining and Metal Zari',
    setIncludes: 'Handcrafted Potli with Pearl Handle Strap',
    occasion: 'Weddings, Sangeet, Festive Receptions',
    care: 'Spot clean only. Store in provided dust bag.',
    featured: false,
    newArrival: false
  },
  {
    id: 'oxidized-jhumka-earrings',
    name: 'Heritage Oxidized Silver Jhumkas',
    category: 'Accessories',
    price: 699,
    originalPrice: 999,
    rating: 4.8,
    reviewCount: 88,
    inStock: true,
    description: 'Traditional Kashmiri-inspired bell jhumkas with intricate floral filigree, tiny dangling ghungroo droplets, and hypoallergenic ear posts.',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Antique Silver', hex: '#8F9094' }
    ],
    sizes: ['Free Size'],
    fabric: 'German Silver Alloy (Nickel Free)',
    setIncludes: 'Pair of Drop Earrings with Secure Stoppers',
    occasion: 'Ethnic Ensembles, Festive Celebrations',
    care: 'Keep away from perfumes, sweat and water',
    featured: false,
    newArrival: true
  },
  {
    id: 'chikankari-straight-kurti',
    name: 'Chikankari Modal Straight Kurti',
    category: 'Kurtis',
    price: 1399,
    originalPrice: 1799,
    rating: 4.9,
    reviewCount: 112,
    badge: 'BESTSELLER',
    inStock: true,
    description: 'Exquisite Lucknowi chikankari inspired embroidery on buttery modal fabric. Straight fit with side slits, detailed sleeves, and round keyhole neck.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=85'
    ],
    colors: [
      { name: 'Seafoam Green', hex: '#95C0B5' },
      { name: 'Peach Sorbet', hex: '#EBB4A2' },
      { name: 'Pristine White', hex: '#F9F8F6' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    fabric: 'Pure Modal Chanderi with Shadow Embroidery',
    kurtiLength: '45 inches',
    setIncludes: 'Single Straight Kurti (Inner Slip Recommended)',
    occasion: 'Day Events, Office, Festive Brunches',
    care: 'Dry clean or gentle hand wash with liquid detergent',
    featured: true,
    newArrival: false
  }
];

export const INSTAGRAM_POSTS = [
  {
    id: 'ig-1',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    caption: 'Breezy mornings in our Floral Kurti Set 🌸 #WearYourStory #StylIsTiq',
    likes: '1.2k'
  },
  {
    id: 'ig-2',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    caption: 'Power dressing with ethnic flair. Embroidered Co-ord Set noir edition ✨',
    likes: '942'
  },
  {
    id: 'ig-3',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
    caption: 'Tiered elegance for sunset evenings 🌅 Shop our dresses online now.',
    likes: '1.5k'
  },
  {
    id: 'ig-4',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    caption: 'Festive grace meets everyday modesty. Swipe to see the organza details 💫',
    likes: '2.1k'
  }
];
