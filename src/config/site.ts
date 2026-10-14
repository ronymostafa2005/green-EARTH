import type { NavLink } from '@/types';

export const siteConfig = {
  name: 'Demeter Green Earth',
  url: 'https://dge-eg.com',
  description:
    'Egyptian manufacturer and exporter of premium IQF frozen fruits, frozen vegetables and vegetables in brine.',
  contact: {
    phone: '+201060330163',
    email: 'info@dge-eg.com',
    whatsapp: '201064230861',
    address: 'Zone 8, Sadat City, Monufia, Egypt',
  },
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3440.3970369408307!2d30.626773599999996!3d30.4248448!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145891cf00bf1869%3A0x2c075afeb95e3f0d!2sDemeter%20green%20Earth!5e0!3m2!1sen!2seg!4v1695044558362!5m2!1sen!2seg',
};

export const mainNav: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/quality', label: 'Quality' },
  { href: '/export', label: 'Export' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/exhibitions', label: 'Exhibitions' },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/quality', label: 'Quality' },
      { href: '/export', label: 'Export & Production' },
      { href: '/certifications', label: 'Certifications' },
      { href: '/exhibitions', label: 'Exhibitions' },
    ],
  },
  {
    title: 'Products',
    links: [
      { href: '/products?category=fruits', label: 'Frozen fruits' },
      { href: '/products?category=vegetables', label: 'Frozen vegetables' },
      { href: '/products?category=brine', label: 'Vegetables in brine' },
      { href: '/products', label: 'All products' },
    ],
  },
];
