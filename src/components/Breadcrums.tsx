import React from "react";
import { HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "../assets/assets";

interface BreadcrumbsProps {
  activeCategory?: string;
  activeCategoryLabel?: string;
  activeProductName?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  activeCategory = "all",
  activeCategoryLabel,
  activeProductName,
}) => {
  const navigate = useNavigate();

  const displayCategoryLabel =
    activeCategoryLabel ||
    (activeCategory === "all"
      ? "All Products"
      : categoriesData.find((c) => c.slug === activeCategory)?.name ||
        activeCategory);

  const handleCategoryClick = () => {
    if (activeCategory && activeCategory !== "all") {
      navigate(`/products?category=${activeCategory}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 py-2.5 px-4 rounded-xl border border-app-border w-fit font-sans">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 hover:text-app-green font-medium transition-colors cursor-pointer"
      >
        <HomeIcon className="size-4" />
        Home
      </button>
      <span className="text-zinc-300">/</span>
      <button
        onClick={handleCategoryClick}
        className="text-zinc-800 font-semibold cursor-pointer hover:bg-app-cream px-2 py-0.5 rounded-lg transition-colors border-none bg-transparent"
      >
        {displayCategoryLabel}
      </button>
      {activeProductName && (
        <>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-800 font-semibold">
            {activeProductName}
          </span>
        </>
      )}
    </div>
  );
};

export default Breadcrumbs;
