export const APP_NAME = 'Diwali Wishes';
export const TAGLINE = "Light Up Someone's World";

export const LIMITS = {
  name: 30,
  customMessage: 200,
  cardMessage: 450,
  wishText: 900,
};

export const SCREENS = ['intro', 'studio', 'gift', 'celebration', 'rangoli', 'card', 'share'];
/** Screens that need a generated wish before they can be shown. */
export const NEEDS_WISH = new Set(['gift', 'celebration', 'card', 'share']);

export const STORAGE_KEY = 'diwali-wishes:prefs:v1';

export const PALETTE = {
  royalPurple: '#160D2C',
  richViolet: '#291542',
  antiqueGold: '#D6A84D',
  champagneGold: '#F5CC75',
  warmIvory: '#FFF8EB',
  mutedLavender: '#C7B9D7',
};

export const RANGOLI_COLORS = [
  { id: 'champagne', label: 'Champagne gold', value: '#F5CC75' },
  { id: 'antique', label: 'Antique gold', value: '#D6A84D' },
  { id: 'ivory', label: 'Ivory', value: '#FFF8EB' },
  { id: 'magenta', label: 'Magenta', value: '#D6336C' },
  { id: 'saffron', label: 'Saffron', value: '#F08A24' },
  { id: 'teal', label: 'Peacock teal', value: '#1FA6A0' },
  { id: 'lavender', label: 'Lavender', value: '#C7B9D7' },
  { id: 'leaf', label: 'Leaf green', value: '#6BBF59' },
];

export const FIREWORK_COLORS = ['#F5CC75', '#D6A84D', '#FFF8EB', '#F08A24', '#D6336C', '#C7B9D7', '#1FA6A0'];

export const CARD_FONTS = [
  { id: 'cormorant', label: 'Cormorant Garamond', css: '"Cormorant Garamond", "Noto Serif Devanagari", Georgia, serif' },
  { id: 'playfair', label: 'Playfair Display', css: '"Playfair Display", "Noto Serif Devanagari", Georgia, serif' },
  { id: 'script', label: 'Great Vibes (script)', css: '"Great Vibes", "Noto Serif Devanagari", cursive' },
  { id: 'poppins', label: 'Poppins', css: '"Poppins", "Noto Serif Devanagari", system-ui, sans-serif' },
  { id: 'devanagari', label: 'Noto Serif Devanagari', css: '"Noto Serif Devanagari", "Cormorant Garamond", serif' },
];

export const CARD_TEMPLATES = [
  { id: 'royal', label: 'Royal Gold' },
  { id: 'traditional', label: 'Traditional Diwali' },
  { id: 'minimal', label: 'Modern Minimal' },
];

export const CARD_SIZE = { width: 600, height: 800 };
