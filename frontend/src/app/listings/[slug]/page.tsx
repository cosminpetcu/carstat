import Image from "next/image";
import Link from "next/link";

export default function CarDetailPage() {
  return (
    <main className="bg-white text-black">
      {/* Navbar */}
      <header className="w-full flex items-center justify-between px-10 py-6 bg-gray-900 absolute top-0 z-30 text-white">
        <div className="text-xl font-bold">CARSTAT</div>
        <nav className="space-x-6 text-sm">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Listings</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Contact</a>
          <button className="ml-4 px-4 py-1 border border-white rounded-full text-sm hover:bg-white hover:text-black">Sign in</button>
        </nav>
      </header>

      <section className="pt-36 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">Ranger Black – 2021</h1>
            <p className="text-gray-600 mb-4">3.0DS PowerPulse Momentum 5dr AWD Geartronic Estate</p>
            <Image
              src="/cars/audi-a6.webp"
              alt="Car"
              width={800}
              height={500}
              className="rounded-xl w-full object-cover"
            />

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Car Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Make:</strong> Audi</div>
                <div><strong>Model:</strong> A6</div>
                <div><strong>Year:</strong> 2021</div>
                <div><strong>Fuel:</strong> Diesel</div>
                <div><strong>Mileage:</strong> 30,000 km</div>
                <div><strong>Transmission:</strong> Automatic</div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Audi A6 2021 cu motorizare diesel, transmisie automată, dotări premium și consum redus. Interior spațios și confortabil, ideal pentru familii sau utilizare business. Exterior elegant cu linie sportivă.
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm list-disc list-inside">
                <li>Android Auto</li>
                <li>Camera spate</li>
                <li>Senzori parcare</li>
                <li>Climatronic</li>
                <li>Volan piele</li>
                <li>Scaune încălzite</li>
              </ul>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <div className="w-full h-[300px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                Map Placeholder
              </div>
            </div>
          </div>

          <div className="md:w-1/3 bg-gray-50 p-6 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm line-through">$180,000</p>
            <p className="text-2xl font-bold text-blue-600">$165,000</p>
            <p className="text-sm text-green-600 mb-4">Instant saving: $15,000</p>

            <button className="w-full bg-blue-600 text-white py-2 rounded-md mb-2">Make an Offer</button>
            <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-md">Schedule Test Drive</button>

            <div className="mt-6 text-sm">
              <p><strong>Dealer:</strong> CarStat Admin</p>
              <p><strong>Phone:</strong> +40 712 345 678</p>
              <p><strong>Email:</strong> admin@carstat.ro</p>
              <button className="mt-2 bg-green-500 text-white px-4 py-1 rounded-md">Contact on WhatsApp</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-20">
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
