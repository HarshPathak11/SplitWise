import React, { useState } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full relative z-50">
      {/* Background with blur effect */}
      {/* <div className="absolute inset-0  bg-black/40 border-b border-gray-700/50"></div> */}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            {/* <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 group-hover:scale-110 transition-all duration-300">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 group-hover:rotate-12 transition-transform duration-300" /> 
            </div> */}
            <span className="font-bold text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-400 transition-all duration-300">
              FairFare
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="md:flex items-center space-x-1 lg:space-x-1">
            <a
              href="/features"
              className="group relative px-4 lg:px-6 py-2 lg:py-3 text-gray-300 hover:text-white font-medium text-sm lg:text-base transition-all duration-300 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10">Features</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
            </a>
            
            <a
              href="/#doc"
              className="group relative px-4 lg:px-6 py-2 lg:py-3 text-gray-300 hover:text-white font-medium text-sm lg:text-base transition-all duration-300 rounded-lg hover:bg-white/5"
            >
              <span className="relative z-10">Docs</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
            </a>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-2 lg:space-x-3 ml-4 lg:ml-6">
              <a
                href="/login"
                className="px-4 lg:px-5 py-2 lg:py-2.5 text-gray-300 hover:text-white font-medium text-sm lg:text-base transition-all duration-300 rounded-lg hover:bg-white/5 border border-transparent hover:border-gray-600/50"
              >
                Login
              </a>
              
              <a
                href="/signup"
                className="group relative px-4 lg:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm lg:text-base rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 border border-blue-500/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 group-hover:rotate-12 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-white/5 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100 pb-6' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="space-y-2 pt-4 border-t border-gray-700/50">
            <a
              href="/features"
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            

            <a
              href="/#doc"
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Docs
            </a>

            <div className="pt-4 space-y-3 border-t border-gray-700/30">
              <a
                href="/login"
                className="block px-4 py-3 text-center text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 font-medium border border-gray-600/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </a>
              
              <a
                href="/signup"
                className="block px-4 py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 border border-blue-500/30"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </nav>
  );
};

export default Navbar;
