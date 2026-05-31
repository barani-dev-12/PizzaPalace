import { assets } from '../assets/assets';
import { API_BASE_URL } from '../config/api';

export const getCategoryFallbackUrl = (category = '') => {
  const catKey = category.toLowerCase().replace(/-/g, '');
  const assetKey = `${catKey}_pizza`;
  return assets[assetKey] || assets.default_pizza;
};

export const getPizzaImageUrl = (image, category = '') => {
  if (image) {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    if (image.startsWith('/uploads')) {
      return `${API_BASE_URL}${image}`;
    }
  }

  return getCategoryFallbackUrl(category);
};

/** Use when /uploads/... file is missing (e.g. after Render redeploy) */
export const handlePizzaImageError = (e, category = '') => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = getCategoryFallbackUrl(category);
};
