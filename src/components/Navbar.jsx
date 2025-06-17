import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = ({ onLogout, isDrawerOpen }) => {
  const navigate = useNavigate();

  // Track if hamburger menu is toggled
  const [menuOpen, setMenuOpen] = useState(false);

  // Control whether menu is visible (so we can run animation before unmounting)
  const [menuVisible, setMenuVisible] = useState(false);

  // Handle logout and redirect to login
  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  // Control menu visibility to allow animation on close
  useEffect(() => {
    if (menuOpen) {
      setMenuVisible(true); // show immediately on open
    } else {
      // delay hide until after slide-up animation completes
      const timer = setTimeout(() => setMenuVisible(false), 500); // match animation duration
      return () => clearTimeout(timer);
    }
  }, [menuOpen]);

  return (
    <nav className="w-full bg-[#14181c] text-white py-4 shadow-md fixed top-0 left-0 z-50">
      <div
        className={`max-w-6xl mx-auto px-4 flex justify-between items-center ${
          isDrawerOpen ? "" : "pl-[60px]"
        }`}
      >
        {/* Logo - Hidden when drawer is open */}
        <Link
          to="/"
          className={`hover:opacity-80 transition-opacity ${
            isDrawerOpen ? "invisible pointer-events-none" : "pl-12 md:pl-0"
          }`}
        >
          <div>
            <h1 className="text-xl font-semibold">🎬 Movie Night</h1>
            <span className="text-xs opacity-75 block">Powered by TMDB</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 font-semibold uppercase">
          <Link
            to="/browse"
            className="text-md px-4 py-2 rounded-md bg-transparent hover:bg-purple-800 transition-colors duration-200"
          >
            Browse
          </Link>
          <Link
            to="/watchlist"
            className="text-md px-4 py-2 rounded-md bg-transparent hover:bg-purple-800 transition-colors duration-200"
          >
            Watchlist
          </Link>
          <Link
            to="/logs"
            className="text-md px-4 py-2 rounded-md bg-transparent hover:bg-purple-800 transition-colors duration-200"
          >
            Logs
          </Link>
        </div>

        {/* Desktop logout button */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-md bg-red-600 hover:bg-red-800 transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Hamburger / Close icon - shown on mobile */}
        <div className="md:hidden z-50 relative mx-10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl focus:outline-none transition-transform duration-300"
          >
            {menuOpen ? (
              <FiX className="transition-transform duration-300 rotate-180" />
            ) : (
              <FiMenu className="transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu with open/close animations */}
      {menuVisible && (
        <div
          className={`fixed inset-0 bg-[#14181c] z-40 flex flex-col justify-center items-center space-y-4 text-xl font-semibold uppercase tracking-wider transition-all duration-500 ${
            menuOpen
              ? "animate-slideDown pointer-events-auto"
              : "animate-slideUp pointer-events-none"
          }`}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-3 text-white hover:text-purple-400 no-underline transition-colors"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-3 text-white hover:text-purple-400 no-underline transition-colors"
          >
            Browse
          </Link>
          <Link
            to="/watchlist"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-3 text-white hover:text-purple-400 no-underline transition-colors"
          >
            Watchlist
          </Link>
          <Link
            to="/logs"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center py-3 text-white hover:text-purple-400 no-underline transition-colors"
          >
            Logs
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="w-full text-center py-3 text-white hover:text-red-600 no-underline uppercase transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
