import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm font-semibold transition-all duration-300 hover:text-amber-500 ${
      isActive ? "text-amber-600 font-bold" : "text-gray-600"
    }`;

  const activeIndicator = ({ isActive }) =>
    isActive ? (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full" />
    ) : null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <img
                src={assets.logo}
                alt="Pizza Palace Logo"
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md transition-transform duration-300 group-hover:scale-110 ring-2 ring-white"
              />
            </div>
            <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent tracking-tight hidden sm:block">
              PIZZA PALACE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <NavLink to="/" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Home
                  {activeIndicator({ isActive })}
                </>
              )}
            </NavLink>
            <NavLink to="/menu" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Menu
                  {activeIndicator({ isActive })}
                </>
              )}
            </NavLink>

            {/* Admin Links */}
            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin" end className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Dashboard
                      {activeIndicator({ isActive })}
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/pizzas" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Pizzas
                      {activeIndicator({ isActive })}
                    </>
                  )}
                </NavLink>
                <NavLink to="/admin/orders" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Orders
                      {activeIndicator({ isActive })}
                    </>
                  )}
                </NavLink>
              </>
            )}

            {/* Customer Links */}
            {isAuthenticated && !isAdmin && (
              <NavLink to="/orders" className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    My Orders
                    {activeIndicator({ isActive })}
                  </>
                )}
              </NavLink>
            )}
          </div>

          {/* Desktop Actions (Cart, Profile, Auth) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Icon for Customers & Guests */}
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-amber-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                  <span className="text-[10px] font-medium text-amber-600 capitalize">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Cart Buttons */}
          <div className="flex md:hidden items-center gap-3">
            {/* Cart Icon for Mobile */}
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-amber-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-amber-500 hover:bg-gray-50 rounded-lg focus:outline-none transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md animate-fadeIn">
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                  isActive ? "bg-amber-50 text-amber-600" : "text-gray-700 hover:bg-gray-50 hover:text-amber-500"
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                  isActive ? "bg-amber-50 text-amber-600" : "text-gray-700 hover:bg-gray-50 hover:text-amber-500"
                }`
              }
            >
              Menu
            </NavLink>

            {/* Admin Mobile Links */}
            {isAuthenticated && isAdmin && (
              <>
                <div className="border-t border-gray-100 my-2 pt-2">
                  <span className="px-3 text-xs font-bold text-gray-400 tracking-wider uppercase">
                    Admin Panel
                  </span>
                </div>
                <NavLink
                  to="/admin"
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                      isActive ? "bg-amber-50 text-amber-600" : "text-gray-700 hover:bg-gray-50 hover:text-amber-500"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/pizzas"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                      isActive ? "bg-amber-50 text-amber-600" : "text-gray-700 hover:bg-gray-50 hover:text-amber-500"
                    }`
                  }
                >
                  Manage Pizzas
                </NavLink>
                <NavLink
                  to="/admin/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                      isActive ? "bg-amber-50 text-amber-600" : "text-gray-700 hover:bg-gray-50 hover:text-amber-500"
                    }`
                  }
                >
                  Manage Orders
                </NavLink>
              </>
            )}

            {/* Customer Mobile Links */}
            {isAuthenticated && !isAdmin && (
              <NavLink
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                    isActive ? "bg-amber-50 text-amber-600" : "text-gray-700 hover:bg-gray-50 hover:text-amber-500"
                  }`
                }
              >
                My Orders
              </NavLink>
            )}

            {/* Auth Buttons / Profile for Mobile */}
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 pb-2 flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                    <span className="text-xs text-amber-600 capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2.5 text-base font-bold text-white bg-gradient-to-r from-red-500 to-amber-500 rounded-lg shadow-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-base font-semibold text-amber-500 border border-amber-500 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-base font-bold text-white bg-amber-500 rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;