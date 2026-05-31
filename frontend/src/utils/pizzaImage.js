import { assets } from '../assets/assets';
import { API_BASE_URL } from '../config/api';

export const getPizzaImageUrl = (image, category = '') => {
  if (image) {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    if (image.startsWith('/uploads')) {
      return `${API_BASE_URL}${image}`;
    }
  }

  const catKey = category.toLowerCase().replace('-', '');
  const assetKey = `${catKey}_pizza`;
  return assets[assetKey] || assets.default_pizza;
};
