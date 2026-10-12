import type { Category, LocalProduct } from '@/types';

export const categories: { id: Category; label: string }[] = [
  { id: 'fruits', label: 'Frozen fruits' },
  { id: 'vegetables', label: 'Frozen vegetables' },
  { id: 'brine', label: 'Vegetables in brine' },
];

export const packingSizes = ['500 g', '1 kg', '2.5 kg', '10 kg'];

const img = (name: string) => `/images/products/${name}.jpg`;

export const products: LocalProduct[] = [
  {
    slug: 'strawberries',
    name: 'Strawberries',
    category: 'fruits',
    image: img('strawberries'),
    pack: img('strawberries-pack'),
    summary:
      'Fully red inside and out with high brix levels, produced according to ISO, HACCP and Global GAP standards.',
    specs: [
      { label: 'Varieties', value: 'Festival, Fortuna, Sensation' },
      {
        label: 'Whole',
        value: 'Uncalibrated, 15–25 mm, 20–32 mm, 25–35 mm',
      },
      { label: 'Cuts', value: '10×10 mm cubes, halves' },
    ],
  },
  {
    slug: 'pomegranate',
    name: 'Pomegranate',
    category: 'fruits',
    image: img('pomegranate'),
    pack: img('pomegranate-pack'),
    summary: 'Deep red, juicy arils separated and frozen individually so they pour freely.',
  },
  {
    slug: 'sweet-corn',
    name: 'Sweet corn',
    category: 'vegetables',
    image: img('sweet-corn'),
    pack: img('sweet-corn-pack'),
    summary: 'Golden, naturally sweet kernels cut from the cob and frozen within hours.',
  },
  {
    slug: 'molokhia',
    name: 'Molokhia',
    category: 'vegetables',
    image: img('molokhia'),
    pack: img('molokhia-pack'),
    summary: 'Tender jute leaves, the heart of Egyptian home cooking, ready to use straight from the freezer.',
  },
  {
    slug: 'spinach',
    name: 'Spinach',
    category: 'vegetables',
    image: img('spinach'),
    pack: img('spinach-pack'),
    summary: 'Young, dark green leaves washed and blanched to keep their colour and nutrients.',
  },
  {
    slug: 'peas',
    name: 'Peas',
    category: 'vegetables',
    image: img('peas'),
    pack: img('peas-pack'),
    summary: 'Sweet green peas, sorted by size and frozen individually.',
  },
  {
    slug: 'broccoli',
    name: 'Broccoli',
    category: 'vegetables',
    image: img('broccoli'),
    pack: img('broccoli-pack'),
    summary: 'Firm, bright green florets trimmed to an even size for consistent cooking.',
  },
  {
    slug: 'cauliflower',
    name: 'Cauliflower',
    category: 'vegetables',
    image: img('cauliflower'),
    pack: img('cauliflower-pack'),
    summary: 'Clean white florets with a mild flavour and a firm bite.',
  },
  {
    slug: 'green-beans',
    name: 'Green beans',
    category: 'vegetables',
    image: img('green-beans'),
    pack: img('green-beans-pack'),
    summary: 'Crisp, tender beans cut and frozen at the peak of the season.',
  },
  {
    slug: 'artichoke',
    name: 'Artichoke',
    category: 'vegetables',
    image: img('artichoke'),
    summary: 'Artichoke hearts and bottoms, cleaned by hand and frozen to keep their delicate taste.',
  },
  {
    slug: 'carrot',
    name: 'Carrot',
    category: 'vegetables',
    image: img('carrot'),
    pack: img('carrot-pack'),
    summary: 'Sweet orange carrots, available diced or sliced.',
  },
  {
    slug: 'pepper',
    name: 'Pepper',
    category: 'vegetables',
    image: img('pepper'),
    summary: 'Colourful bell peppers cut into strips or dices, ready for the pan.',
  },
  {
    slug: 'sweet-potatoes',
    name: 'Sweet potatoes',
    category: 'vegetables',
    image: img('sweet-potatoes'),
    pack: img('sweet-potatoes-pack'),
    summary: 'Naturally sweet Egyptian sweet potatoes, peeled and cut.',
  },
  {
    slug: 'french-fries',
    name: 'Potatoes, French fries',
    category: 'vegetables',
    image: img('french-fries'),
    pack: img('french-fries-pack'),
    summary: 'Pre-fried potato cuts that turn golden and crisp in minutes.',
  },
  {
    slug: 'onion',
    name: 'Onion',
    category: 'vegetables',
    image: img('onion'),
    pack: img('onion-pack'),
    summary: 'Peeled and diced onions that save hours of prep in busy kitchens.',
  },
  {
    slug: 'olives-in-brine',
    name: 'Olives in brine',
    category: 'brine',
    image: img('olives-in-brine'),
    summary: 'Green olives cured in brine, firm and full of flavour.',
  },
  {
    slug: 'pepper-in-brine',
    name: 'Pepper in brine',
    category: 'brine',
    image: img('pepper-in-brine'),
    summary: 'Peppers preserved in brine for pickles, salads and sandwiches.',
  },
  {
    slug: 'artichoke-in-brine',
    name: 'Artichoke in brine',
    category: 'brine',
    image: img('artichoke-in-brine'),
    summary: 'Tender artichoke hearts preserved in brine, ready to serve.',
  },
];

export function getCategoryLabel(id: Category) {
  return categories.find((c) => c.id === id)?.label ?? '';
}
