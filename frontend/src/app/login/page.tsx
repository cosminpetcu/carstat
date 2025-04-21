"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const url = tab === "signin" ? "/auth/login" : "/auth/register";

    const payload = {
      email: email.trim(),
      password: password,
      full_name: name.trim(),
    };

    try {
      const res = await fetch(`http://localhost:8000${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Login/Register failed");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />

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

          {/* Error message */}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          {/* SIGN IN FORM */}
          {tab === "signin" && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                  required
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                  required
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                required
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
