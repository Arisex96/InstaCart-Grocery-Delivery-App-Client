import { Truck, Tag, X, ArrowRight } from "lucide-react";
import { useState } from "react";

const Banner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white">

      {/* Container */}
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2 text-xs sm:text-sm">

        {/* Left */}
        <div className="flex items-center gap-2">
          <Truck className="size-4 shrink-0" />
          <span>
            Free Delivery on orders above{" "}
            <span className="font-semibold text-yellow-300">₹499</span>
          </span>
        </div>

        {/* Divider */}
        <span className="hidden text-white/40 md:block">|</span>

        {/* Middle */}
        <div className="hidden items-center gap-2 md:flex">
          <Tag className="size-4 shrink-0 text-yellow-300" />
          <span>
            Flat <span className="font-semibold">20% OFF</span> on your first
            order
          </span>
        </div>

        {/* CTA */}
        <button className="hidden items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-medium transition-all duration-300 hover:bg-white/25 lg:flex">
          Shop Now
          <ArrowRight className="size-4" />
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:bg-white/20"
      >
        <X className="size-4" />
      </button>

    </div>
  );
};

export default Banner;