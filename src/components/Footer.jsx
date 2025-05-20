import React from "react";

// Footer component displaying branding, navigation links, and contact info
const Footer = () => {
  return (
    <footer className="bg-black border-t border-[#14181c] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and brief description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-xl">
                🎬 Movie Night
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-400 text-center md:text-left">
              Your personal helper in selecting movies for your next movie
              night.
            </p>
          </div>

          {/* Footer navigation links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <div className="flex flex-col items-center md:items-start space-y-2">
              <a
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="/browse"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Browse
              </a>
              <a
                href="/watchlist"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Watchlist
              </a>
              <a
                href="/logs"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Logs
              </a>
            </div>
          </div>

          {/* Contact info and social links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="flex flex-col items-center md:items-start space-y-2">
              <a
                href="mailto:support@cineselections.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                support@movienight.com
              </a>
              <a
                href="/contact"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact Form
              </a>
              <div className="flex space-x-4 mt-2">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white"
                  aria-label="Twitter"
                >
                  {/* Twitter icon */}
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white"
                  aria-label="GitHub"
                >
                  {/* GitHub icon */}
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-8 border-t border-[#14181c] pt-8">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Movie Night. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
