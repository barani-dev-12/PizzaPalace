// Production fallback when Vercel build omits REACT_APP_API_URL (set it in Vercel env anyway)
const PRODUCTION_API_URL = 'https://pizzapalace-5xa5.onrender.com';

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : 'http://localhost:5000');

export const API_URL = `${API_BASE_URL}/api`;
