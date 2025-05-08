"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ id: number; email: string; full_name: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";


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
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  return (
    <header className={`w-full flex items-center justify-between px-10 py-6 z-30 ${isHome ? "absolute top-0 text-white" : "bg-gray-900 text-white shadow"}`}>
      <div className="text-xl font-bold">CARSTAT</div>
      <nav className="space-x-6 text-sm flex items-center relative">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/listings" className="hover:underline">Listings</Link>
        <Link href="/favorites" className="hover:underline">Favorites</Link>
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="#" className="hover:underline">About</Link>
        <Link href="#" className="hover:underline">Contact</Link>

        {!isLoggedIn ? (
          <Link href="/login">
            <button className="ml-4 px-4 py-1 border border-white rounded-full text-sm hover:bg-white hover:text-black">
              Sign in
            </button>
          </Link>
        ) : (
          <div className="relative inline-block text-left">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="ml-4 px-4 py-1 border border-white rounded-full text-sm hover:bg-white hover:text-black"
            >
              {user?.full_name || "Profile"} ▾
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 text-black">
                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Settings</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
