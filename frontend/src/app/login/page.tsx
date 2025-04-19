"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-10 py-6 z-30 bg-gray-900 text-white">
        <div className="text-xl font-bold">CARSTAT</div>
        <nav className="space-x-6 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/listings" className="hover:underline">Listings</Link>
          <Link href="#" className="hover:underline">About</Link>
          <Link href="#" className="hover:underline">Contact</Link>
          <Link href="/login">
            <button className="ml-4 px-4 py-1 border border-white rounded-full text-sm hover:bg-white hover:text-black">Sign in</button>
          </Link>
        </nav>
      </header>

      {/* Auth Box */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Tabs */}
          <div className="flex justify-center border-b pb-2 mb-4 text-sm font-medium">
            <button
              onClick={() => setTab("signin")}
              className={`px-3 pb-1 ${tab === "signin" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-black"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab("register")}
              className={`px-3 pb-1 ${tab === "register" ? "text-black border-b-2 border-black" : "text-gray-500 hover:text-black"}`}
            >
              Register
            </button>
          </div>

          {/* SIGN IN FORM */}
          {tab === "signin" && (
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Username Or Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Keep me signed in</span>
                </label>
                <Link href="#" className="text-blue-600 hover:underline">Lost Your Password?</Link>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md text-sm"
              >
                Login →
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md text-sm"
              >
                Register →
              </button>
            </form>
          )}

          {/* Separator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span className="w-full border-t" />
            <span>OR</span>
            <span className="w-full border-t" />
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button className="flex items-center justify-center border border-blue-600 text-blue-600 rounded-md py-2 text-sm w-full gap-2">
              <span className="text-lg">📘</span>
              Login with Facebook
            </button>
            <button className="flex items-center justify-center border border-red-500 text-red-500 rounded-md py-2 text-sm w-full gap-2">
              <span className="text-lg">🔴</span>
              Login with Google
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-bold mb-2">Company</h3>
            <ul className="space-y-1 text-sm">
              <li>About Us</li>
              <li>Services</li>
              <li>FAQs</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li>Help Center</li>
              <li>How it works</li>
              <li>Sign Up</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Our Brands</h3>
            <ul className="space-y-1 text-sm">
              <li>Audi</li>
              <li>BMW</li>
              <li>Ford</li>
              <li>Volkswagen</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Get Updates</h3>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 text-black rounded-md mb-2"
            />
            <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-md">
              Sign Up
            </button>
          </div>
        </div>
        <p className="text-center text-sm mt-8">© 2025 carstat.com. All rights reserved.</p>
      </footer>
    </main>
  );
}
