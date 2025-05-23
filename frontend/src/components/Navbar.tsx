"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { PendingActionsManager } from '@/utils/pendingActions';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ id: number; email: string; full_name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";
  const isListings = pathname === "/listings";
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
  
    setIsLoggedIn(!!token);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isListings) {
      const searchParam = searchParams.get("search");
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    } else {
      if (!searchOpen) {
        setSearchQuery("");
      }
    }
  }, [isListings, searchParams]);

  useEffect(() => {
    setMobileMenuOpen(false);
    
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [pathname, searchOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isListings) {
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set("search", searchQuery.trim());
        currentParams.set("page", "1");
        window.history.pushState({}, "", `/listings?${currentParams.toString()}`);
        window.location.reload();
      } else {
        window.location.href = `/listings?search=${encodeURIComponent(searchQuery.trim())}`;
      }
    }
  };

  const handleClearSearch = () => {
    setSearchOpen(false);
  };

  const handleProtectedNavigation = (targetPath: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      PendingActionsManager.saveNavigationIntent(targetPath);
      window.location.href = '/login';
    } else {
      router.push(targetPath);
    }
  };

  return (
    <header 
      className={`w-full z-30 ${
        isHome 
          ? "absolute top-0 text-white" 
          : "bg-gray-900 text-white shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">CARSTAT</span>
              <span className={`ml-1 font-light text-xs mt-1 ${isHome ? 'text-white' : 'text-blue-400'}`}>BETA</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <NavLink href="/" label="Home" active={pathname === "/"} />
            <NavLink href="/listings" label="Listings" active={pathname === "/listings" || pathname.startsWith("/listings/")} />
            <button
              onClick={() => handleProtectedNavigation('/favorites')}
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                pathname === "/favorites"
                  ? "text-white bg-gray-700/50 rounded-md" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => handleProtectedNavigation('/dashboard')}
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                pathname === "/dashboard"
                  ? "text-white bg-gray-700/50 rounded-md" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleProtectedNavigation('/get-estimation')}
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                pathname === "/get-estimation"
                  ? "text-white bg-gray-700/50 rounded-md" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Get Estimation
            </button>
            <NavLink href="/detailed-search" label="Advanced Search" active={pathname === "/detailed-search"} />
            
            {(!searchOpen) && (
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full text-gray-300 hover:text-white focus:outline-none transition-all duration-200"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <Link href="/login">
                <button className={`hidden md:flex items-center px-6 py-2.5 ${
                  isHome 
                    ? "text-white border border-white/80 hover:bg-white hover:text-gray-900" 
                    : "text-blue-400 border border-blue-400 hover:bg-blue-500 hover:text-white"
                } transition duration-200 text-sm font-medium rounded-md`}>
                  Sign In
                </button>
              </Link>
            ) : (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.full_name || user?.email?.split("@")[0] || "User"}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                    </div>
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Favorites
                    </Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    <Link href="/get-estimation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Get Estimation
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700">
            <MobileNavLink href="/" label="Home" active={pathname === "/"} />
            <MobileNavLink href="/listings" label="Listings" active={pathname === "/listings" || pathname.startsWith("/listings/")} />
            <button
              onClick={() => handleProtectedNavigation('/favorites')}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                pathname === "/favorites"
                  ? "bg-gray-800 text-white rounded-md" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white hover:rounded-md"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => handleProtectedNavigation('/dashboard')}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                pathname === "/dashboard"
                  ? "bg-gray-800 text-white rounded-md" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white hover:rounded-md"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleProtectedNavigation('/get-estimation')}
              className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors ${
                pathname === "/get-estimation"
                  ? "bg-gray-800 text-white rounded-md" 
                  : "text-gray-300 hover:bg-gray-700 hover:text-white hover:rounded-md"
              }`}
            >
              Get Estimation
            </button>
            <MobileNavLink href="/detailed-search" label="Advanced Search" active={pathname === "/detailed-search"} />
            
            <div className="pt-2">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search for cars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-blue-900/20 border border-blue-500/30 text-white px-3 py-2"
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 ml-2"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 pb-3">
            {isLoggedIn ? (
              <div className="px-4 flex flex-col space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-lg">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user?.full_name || "User"}</div>
                    <div className="text-sm font-medium text-gray-400">{user?.email}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link 
                    href="/favorites" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Favorites
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/get-estimation" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Get Estimation
                  </Link>
                  <Link 
                    href="/saved-searches" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Saved Searches
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2">
                <Link 
                  href="/login" 
                  className="block w-full text-center px-6 py-2.5 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="hidden md:block absolute left-0 right-0 bg-gray-900 backdrop-blur-sm shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for cars by brand, model, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-blue-900/20 border border-blue-500/30 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors ml-2"
              >
                Search
              </button>
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="ml-2 p-3 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700 transition-colors"
                title="Close search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

const NavLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link 
    href={href}
    className={`px-3 py-2 text-sm font-medium transition-colors duration-200
      ${active 
        ? "text-white bg-gray-700/50 rounded-md" 
        : "text-gray-300 hover:text-white"
      }`}
  >
    {label}
  </Link>
);

const MobileNavLink = ({ href, label, active }: { href: string; label: string; active: boolean }) => (
  <Link 
    href={href}
    className={`block px-3 py-2 text-base font-medium
      ${active 
        ? "bg-gray-800 text-white rounded-md" 
        : "text-gray-300 hover:bg-gray-700 hover:text-white hover:rounded-md"
      }`}
  >
    {label}
  </Link>
);