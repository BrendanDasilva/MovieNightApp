import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = ({ onLogout, isDrawerOpen }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

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
            className="text-sm px-4 py-2 rounded-md bg-[#ff8000] hover:bg-orange-600 transition-colors duration-200"
          >
            Browse
          </Link>
          <Link
            to="/watchlist"
            className="text-sm px-4 py-2 rounded-md bg-[#00e054] hover:bg-green-600 transition-colors duration-200"
          >
            Watchlist
          </Link>
          <Link
            to="/logs"
            className="text-sm px-4 py-2 rounded-md bg-[#40bcf4] hover:bg-blue-600 transition-colors duration-200"
          >
            Logs
          </Link>
        </div>

        {/* Desktop logout button */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-600 transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Hamburger / Close icon - stays above mobile menu */}
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

      {/* Full-screen mobile menu */}
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
          className="w-full text-center py-3 text-white hover:text-[#ff8000] no-underline transition-colors"
        >
          Home
        </Link>
        <Link
          to="/browse"
          onClick={() => setMenuOpen(false)}
          className="w-full text-center py-3 text-white hover:text-[#ff8000] no-underline transition-colors"
        >
          Browse
        </Link>
        <Link
          to="/watchlist"
          onClick={() => setMenuOpen(false)}
          className="w-full text-center py-3 text-white hover:text-[#ff8000] no-underline transition-colors"
        >
          Watchlist
        </Link>
        <Link
          to="/logs"
          onClick={() => setMenuOpen(false)}
          className="w-full text-center py-3 text-white hover:text-[#ff8000] no-underline transition-colors"
        >
          Logs
        </Link>
        <button
          onClick={() => {
            handleLogout();
            setMenuOpen(false);
          }}
          className="w-full text-center py-3 text-white hover:text-[#ff8000] no-underline uppercase transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
