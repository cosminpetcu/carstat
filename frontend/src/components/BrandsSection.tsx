"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const BrandsSection = () => {
  const router = useRouter();

  const brands = ["audi", "bmw", "ford", "mercedes-Benz", "peugeot", "volkswagen"];

  const handleBrandClick = (brand: string) => {
    const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1);
    router.push(`/listings?brand=${encodeURIComponent(formattedBrand)}`);
  };

  return (
    <section className="py-12 px-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Explore Our Premium Brands</h2>
      <div className="flex justify-center gap-6 flex-wrap">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => handleBrandClick(brand)}
            className="flex flex-col items-center w-[100px] h-[120px] bg-white rounded-xl shadow p-4 hover:shadow-lg transition"
          >
            <Image src={`/${brand}.png`} alt={brand} width={50} height={50} />
            <span className="mt-2 capitalize text-black text-sm">{brand}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default BrandsSection;
