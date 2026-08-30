import Breadcrumbs from "../components/Breadcrums";
import { useParams } from "react-router";
import { dummyReviews } from "../assets/assets";
import { ArrowLeft, CheckIcon, Leaf, Star, XIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useMemo, useEffect } from "react";
import useCartStore from "../store/useCartStore";
import useUserStore from "../store/useUserStore";
import ProductGrid from "../components/ProductGrid";
import api from "../api/axios";
import type { Product } from "../types";
import toast from "react-hot-toast";

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

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUserStore();
  const isLoggedIn = !!user.email;
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [dbReviews, setDbReviews] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        const p = data.product;
        const mapped: Product = {
          _id: p.id,
          name: p.name,
          description: p.description ?? "",
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
          category: p.category,
          unit: p.unit,
          stock: p.stock,
          isOrganic: p.isOrganic,
          rating: p.rating,
          reviewCount: p.reviewCount,
          discount: p.discount ?? 0,
        };
        if (!cancelled) {
          setProduct(mapped);
          setDbReviews(p.reviews || []);
        }

        const simRes = await api.get("/products", {
          params: { category: p.category },
        });
        if (!cancelled) {
          setSimilarProducts(
            simRes.data.products
              .filter((sp: any) => sp.id !== p.id)
              .map((sp: any) => ({
                _id: sp.id,
                name: sp.name,
                description: sp.description ?? "",
                price: sp.price,
                originalPrice: sp.originalPrice,
                image: sp.image,
                category: sp.category,
                unit: sp.unit,
                stock: sp.stock,
                isOrganic: sp.isOrganic,
                rating: sp.rating,
                reviewCount: sp.reviewCount,
                discount: sp.discount ?? 0,
              })),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, {
        rating: newRating,
        comment: newComment,
      });
      if (data.success) {
        toast.success("Review submitted successfully!");
        setNewComment("");
        setNewRating(5);
        setDbReviews((prev) => [data.review, ...prev]);

        // Refresh the product details to update rating and reviewCount
        const prodRes = await api.get(`/products/${productId}`);
        const p = prodRes.data.product;
        const mapped: Product = {
          _id: p.id,
          name: p.name,
          description: p.description ?? "",
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image,
          category: p.category,
          unit: p.unit,
          stock: p.stock,
          isOrganic: p.isOrganic,
          rating: p.rating,
          reviewCount: p.reviewCount,
          discount: p.discount ?? 0,
        };
        setProduct(mapped);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to submit review";
      toast.error(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviews = useMemo(() => {
    if (!product) return [];

    const dbMappedReviews = dbReviews.map((r: any) => ({
      _id: r.id,
      productId: r.productId,
      userImage:
        r.user?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.user?.name || "User")}`,
      name: r.user?.name || "Anonymous",
      date: r.createdAt,
      rating: r.rating,
      comment: r.comment,
    }));

    const staticReviews = dummyReviews.filter(
      (r) => r.productId === product._id,
    );

    if (dbMappedReviews.length > 0) {
      return [...dbMappedReviews, ...staticReviews];
    }

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

    const count = Math.min(product.reviewCount ?? 0, 3);
    const list = [];
    for (let i = 0; i < count; i++) {
      const rating = Math.max(
        3,
        Math.min(
          5,
          Math.round((product.rating ?? 5) + (i % 2 === 0 ? 0.5 : -0.5)),
        ),
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
  }, [product, dbReviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-green"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-lg">Product not found</div>;
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
                  <span className="text-green-600">
                    In Stock ({product.stock})
                  </span>
                </>
              ) : (
                <>
                  <XIcon className="size-4 text-red-600" />
                  <span className="text-red-600">Out of Stock</span>
                </>
              )}
            </p>{" "}
            {/* Quantity and Add to Cart */}
            {product.stock > 0 ? (
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
                <button
                  className="bg-app-orange text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    addToCart(product, quantity);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ) : (
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
            {/* Left Column (Breakdown & Add Review) */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <RatingBar product={product} reviews={reviews} />

              <div className="bg-white rounded-xl border border-zinc-100 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Add a Review
                </h3>
                {isLoggedIn ? (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                        Your Rating
                      </span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              size={24}
                              className={
                                star <= newRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
                        Review Comment
                      </span>
                      <textarea
                        required
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts about this product..."
                        className="w-full text-sm border border-zinc-200 rounded-lg p-2.5 bg-zinc-50 focus:bg-white focus:border-app-green focus:ring-1 focus:ring-app-green outline-none resize-none transition-all duration-200"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-app-green hover:bg-app-green-dark text-white rounded-lg py-2.5 font-semibold text-sm transition-all shadow-sm focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                    <p className="text-sm text-zinc-500 mb-2">
                      You need to be logged in to write a review
                    </p>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-xs font-bold text-app-green hover:underline focus:outline-none"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>
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
          <h2 className="text-2xl text-black font-semibold">
            Similar Products
          </h2>
          <ProductGrid products={similarProducts} category={product.category} />
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
