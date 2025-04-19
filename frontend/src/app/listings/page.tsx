import Image from "next/image";

export default function ListingsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-10 py-6 z-30 bg-gray-900 text-white border-b">
        <div className="text-xl font-bold">CARSTAT</div>
        <nav className="space-x-6 text-sm">
          <a href="/" className="hover:underline">Home</a>
          <a href="/listings" className="hover:underline">Listings</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Contact</a>
          <button className="ml-4 px-4 py-1 border border-white rounded-full text-sm hover:bg-black hover:text-white">Sign in</button>
        </nav>
      </header>

      {/* Listing Title */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Listing v1</h1>
            <p className="text-sm text-gray-600">Showing 1–12 of 12 results</p>
          </div>
          <div>
            <select className="border border-gray-300 rounded-md px-4 py-2 text-sm">
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-md">
              <Image
                src={`/cars/ford-explorer.webp`}
                alt="Car"
                width={400}
                height={300}
                className="rounded-lg object-cover w-full h-[180px]"
              />
              <div className="mt-2">
                <h3 className="font-semibold text-lg">Car Model {idx + 1}</h3>
                <p className="text-sm text-gray-600">2023 • Petrol • Automatic</p>
                <p className="text-blue-600 font-semibold mt-1">$35,000</p>
                <button className="text-sm text-blue-500 underline mt-1">View Details</button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-10">
          <button className="px-4 py-2 rounded-full border">1</button>
          <button className="px-4 py-2 rounded-full border ml-2 bg-gray-200">2</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
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
