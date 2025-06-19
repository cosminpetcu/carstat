import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Subscribing email:", email);
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">CARSTAT</h2>
            <p className="text-gray-300 mb-6 max-w-xs">
              Your automotive market analytics platform helping buyers and sellers make informed decisions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-gray-300 hover:text-white transition duration-200">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/detailed-search" className="text-gray-300 hover:text-white transition duration-200">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-gray-300 hover:text-white transition duration-200">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition duration-200">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/30 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} CARSTAT. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}