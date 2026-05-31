import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand/About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={assets.logo}
                alt="Logo"
                className="w-10 h-10 object-contain filter brightness-110"
              />
              <span className="text-lg font-black bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">
                PIZZA PALACE
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crafting premium, wood-fired gourmet pizzas with fresh organic ingredients and delivering happiness to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-bold tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-amber-400 transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-400 transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white text-sm font-bold tracking-wider uppercase mb-4">
              Opening Hours
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Monday - Friday: 11:00 AM - 11:00 PM</li>
              <li>Saturday - Sunday: 10:00 AM - 12:00 AM</li>
              <li className="text-amber-400 font-medium">Delivery: 24/7 in select areas</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-bold tracking-wider uppercase mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 123 Gourmet Blvd, Pizza City</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>✉️ support@pizzapalace.com</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Pizza Palace. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-amber-400 transition-colors cursor-default">
              Privacy Policy
            </span>
            <span className="hover:text-amber-400 transition-colors cursor-default">
              Terms of Service
            </span>
            <span className="hover:text-amber-400 transition-colors cursor-default">
              Cookie Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
