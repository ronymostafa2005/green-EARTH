export type Category = 'fruits' | 'vegetables' | 'brine';

export type ProductSpec = { label: string; value: string };

export type LocalProduct = {
  slug: string;
  name: string;
  category: Category;
  image: string;
  pack?: string;
  summary: string;
  specs?: ProductSpec[];
};

export type ProductCategory = {
  id: string;
  label: string;
};

export type Product = {
  id?: number;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  images: string[];
  summary: string;
  specs?: ProductSpec[];
};

export type NavLink = {
  href: string;
  label: string;
};
