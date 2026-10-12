export type Category = 'fruits' | 'vegetables' | 'brine';

export type Product = {
  slug: string;
  name: string;
  category: Category;
  image: string;
  pack?: string;
  summary: string;
  specs?: { label: string; value: string }[];
};

export type NavLink = {
  href: string;
  label: string;
};
