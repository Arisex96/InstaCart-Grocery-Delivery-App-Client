import Breadcrumbs from "../components/Breadcrums";
import { useParams } from "react-router";
import { dummyProducts, dummyReviews } from "../assets/assets";
import { ArrowLeft, CheckIcon, Leaf, Star, XIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import useCartStore from "../store/useCartStore";
import ProductGrid from "../components/ProductGrid";

const HalfStar = ({ size = 16 }: { size?: number }) => (
  <div
    className="relative flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    {/* Background gray star */}
    <Star
      size={size}
      className="absolute inset-0 fill-gray-300 text-gray-300 pointer-events-none"
    />

    {/* Yellow half overlay */}
    <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden pointer-events-none">
      <Star
        size={size}
        className="fill-yellow-400 text-yellow-400 max-w-none"
      />
    </div>
  </div>
);

const ProductPage = () => {
  const productId = useParams().id;
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.add_item);

  const product = dummyProducts.find((p) => p._id === productId);

  const reviews = useMemo(() => {
    if (!product) return [];
    const staticReviews = dummyReviews.filter(
      (r) => r.productId === product._id,
    );
    if (staticReviews.length > 0) {
      return staticReviews;
    }

    // For non-pantry products, dynamic placeholder reviews
    const names = [
      "Ananya S.",
      "Rahul M.",
      "Priya K.",
      "Vikram J.",
      "Meera D.",
    ];
    const avatars = [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    ];
    const comments = [
      "Absolutely love this product! Fresh and great quality. Will definitely order again.",
      "Good value for the price. Packaging was neat and delivery was on time.",
      "Quality is decent but I expected it to be a bit fresher. Still a solid buy overall.",
      "This has become a staple in my kitchen now. Highly recommended for everyone!",
      "Exceeded my expectations. The taste and freshness were top-notch. Five stars!",
    ];

    const count = Math.min(product.reviewCount, 3);
    const list = [];
    for (let i = 0; i < count; i++) {
      const rating = Math.max(
        3,
        Math.min(5, Math.round(product.rating + (i % 2 === 0 ? 0.5 : -0.5))),
      );
      list.push({
        _id: `generated-${product._id}-${i}`,
        productId: product._id,
        userImage: avatars[i % avatars.length],
        name: names[i % names.length],
        date: `2026-06-${20 - i * 2}`,
        rating,
        comment: comments[i % comments.length],
      });
    }
    return list;
  }, [product]);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 font-sans">
        <Breadcrumbs
          activeCategory={product.category}
          activeProductName={product.name}
        />
        <div
          className="flex items-center justify-between gap-2 text-md font-semibold bg-zinc-50 py-2.5 px-4 rounded-xl border border-app-border w-fit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft className="size-4" />
          <button>Back</button>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-6 bg-white rounded-2xl">
          <div className="w-full md:w-1/2">
            <div className="relative bg-app-cream/40 rounded-xl flex h-[400px] items-center justify-center p-2 overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.discount > 0 && (
                  <span className="bg-red-500 text-white  sm:text-[15px] font-bold rounded-full px-2.5 py-1 shadow-sm leading-none">
                    {product.discount}% OFF
                  </span>
                )}
                {product.isOrganic && (
                  <span className="bg-emerald-600 text-white sm:text-[15px] font-bold rounded-full px-2 py-1 shadow-sm flex items-center gap-0.5 leading-none">
                    <Leaf className="size-2.5 fill-white" /> Organic
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 flex flex-col gap-4 px-10 my-4">
            <p className="text-sm text-zinc-500">{product.category}</p>
            <h1 className="text-2xl font-semibold  text-black ">
              {product.name}
            </h1>
            {/** Review starts out of 5 */}
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} />
              <div>{product.rating}</div>
              <div className="text-sm text-gray-500">
                ({product.reviewCount} reviews)
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">${product.price}</span>
              <span className="text-gray-400 text-lg">
                $<del>{product.originalPrice}</del>
              </span>
            </div>
            <p className="text-lg">{product.description}</p>
            <p className="flex items-center gap-1 text-sm font-semibold">
              {product.stock ? (
                <>
                  <CheckIcon className="size-4  text-green-600" />
                  <span  className="text-green-600">In Stock ({product.stock})</span>
                </>
              ) : (
                <>
                  <XIcon className="size-4 text-red-600" />
                  <span className="text-red-600">Out of Stock</span>
                </>
              )}
            </p>{" "}

            {/* Quantity and Add to Cart */}
            {product.stock>0?(
              <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2">
                <button
                  className=" text-gray-600 border border-gray-300 px-4 py-2 rounded-lg"
                  onClick={() => {
                    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
                  }}
                >
                  -
                </button>
                <div className=" text-gray-600 border border-gray-300 px-4 py-2 rounded-lg font-semibold w-[50px] text-center">
                  {quantity}
                </div>
                <button
                  className=" text-gray-600 border border-gray-300 px-4 py-2 rounded-lg"
                  onClick={() => {
                    setQuantity((prev) =>
                      prev === product.stock ? prev : prev + 1,
                    );
                  }}
                >
                  +
                </button>
              </div>
              <button className="bg-app-orange text-white px-4 py-2 rounded-lg"
              onClick={() => {
                addToCart(product, quantity);
              }}>
                Add to Cart
              </button>
            </div>
            ):(
              <div className="flex items-center gap-2 mb-4">
              <button className="bg-app-orange text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                Out of Stock
              </button>
            </div>
            )}
            </div>
            

        </div>
        {/** =Customer review */}
        <div className="flex flex-col gap-6 mt-10">
          <div>
            <h2 className="text-2xl text-black font-semibold">
              Customer Reviews
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left Column (Breakdown) */}
            <div className="md:col-span-1">
              <RatingBar product={product} reviews={reviews} />
            </div>

            {/* Right Column (Reviews List) */}
            <div className="md:col-span-2 space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <img
                      src={review.userImage}
                      alt={review.name}
                      className="size-10 rounded-full object-cover shrink-0 border border-zinc-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/7.x/initials/svg?seed=${review.name}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap justify-between gap-1 mb-1">
                        <span className="text-sm font-semibold text-gray-950">
                          {review.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="mb-2">
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-6">
                  No reviews yet for this product.
                </p>
              )}
            </div>
          </div>
        </div>
        {/**View similar category products */}
        <div className="flex flex-col gap-4 mt-10">
          <h2 className="text-2xl text-black font-semibold">Similar Products</h2>
          <ProductGrid products={dummyProducts} category={product.category} />
        </div>
      </div>
    </>
  );
};

const StarRating = ({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) => {
  const pixelSize = size === 4 ? 16 : size;

  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= rating) {
          return (
            <Star
              key={star}
              size={pixelSize}
              className="fill-yellow-400 text-yellow-400"
            />
          );
        }

        if (star - 0.5 <= rating) {
          return <HalfStar key={star} size={pixelSize} />;
        }

        return (
          <Star
            key={star}
            size={pixelSize}
            className="fill-gray-300 text-gray-300"
          />
        );
      })}
    </div>
  );
};

const RatingBar = ({ product, reviews }: { product: any; reviews: any[] }) => {
  const array = [0, 0, 0, 0, 0]; // 1★,2★,3★,4★,5★
  let total = 0;

  reviews.forEach((it) => {
    const rating = Math.floor(it.rating);

    if (rating >= 1 && rating <= 5) {
      array[rating - 1]++;
      total++;
    }
  });

  const per_array = array.map((count) =>
    total === 0 ? 0 : (count / total) * 100,
  );

  return (
    <div className="flex flex-col justify-center items-center w-full bg-white rounded-lg p-4 py-6">
      <div className="flex flex-col justify-center items-center gap-3">
        <p className="text-6xl font-bold">{product.rating}</p>
        {/** starts but bigger*/}

        <StarRating rating={product.rating} size={30} />

        <p className="text-sm text-gray-500">{total} reviews</p>
      </div>

      <div className="w-full space-y-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center  justify-center gap-3">
            {/* Left */}
            <div className="w-10 flex items-center justify-center gap-1">
              <span>{star}</span>
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
            </div>

            {/* Bar */}
            <div className="flex-1 h-2.5 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{ width: `${per_array[star - 1]}%` }}
              />
            </div>

            {/* Count */}
            <div className="w-6 text-center">{array[star - 1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
