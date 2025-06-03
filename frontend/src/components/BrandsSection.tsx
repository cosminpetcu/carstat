"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const BrandsSection = () => {
  const router = useRouter();

  const brands = [
    { name: "Audi", image: "/audi.png" },
    { name: "BMW", image: "/bmw.png" },
    { name: "Ford", image: "/ford.png" },
    { name: "Mercedes-Benz", image: "/mercedes-benz.png" },
    { name: "Peugeot", image: "/peugeot.png" },
    { name: "Volkswagen", image: "/volkswagen.png" }
  ];

  const handleBrandClick = (brand: string) => {
    router.push(`/listings?brand=${encodeURIComponent(brand)}`);
  };

  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Explore Our Premium Brands</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => handleBrandClick(brand.name)}
              className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 h-[160px]"
            >
              <div className="w-[80px] h-[80px] relative flex items-center justify-center mb-4">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <span className="text-center font-medium text-gray-800">{brand.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;