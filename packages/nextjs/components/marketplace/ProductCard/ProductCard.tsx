import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  EyeIcon,
  HeartIcon,
  MapPinIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useToast } from "~~/components/Toast";
import { Card, CardContent } from "~~/components/ui";
import { ENSNameDisplay } from "~~/components/ens";
import { useCartStore } from "~~/stores/cartStore";
import { useComparisonStore } from "~~/stores/comparisonStore";
import { useQuickViewStore } from "~~/stores/quickViewStore";
import { useCreatorStore } from "~~/stores/creatorStore";
import { Product } from "~~/types/marketplace";

interface ProductCardProps {
  product: Product;
  onLike?: (productId: string) => void;
  isLiked?: boolean;
  variant?: "default" | "compact" | "featured" | "list";
  showStats?: boolean;
}

export const ProductCard = ({
  product,
  onLike,
  isLiked = false,
  variant = "default",
  showStats = true,
}: ProductCardProps) => {
  const [isLiking, setIsLiking] = React.useState(false);

  const { addToCart } = useCartStore();
  const { openQuickView } = useQuickViewStore();
  const { addToComparison, isProductInComparison } = useComparisonStore();
  const { getCreatorENSName } = useCreatorStore();
  const { addToast } = useToast();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking) return;
    setIsLiking(true);
    try {
      onLike?.(product.id);
    } finally {
      setTimeout(() => setIsLiking(false), 200);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleAddToComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToComparison(product);
  };

  const formatPrice = (price: Product["price"]) => {
    if (price.currency === "ETH") {
      // Format ETH with proper decimal places and avoid scientific notation
      const formattedAmount = price.amount < 0.001 ? price.amount.toExponential(2) : price.amount.toFixed(4);
      return `${formattedAmount} ETH`;
    }
    return `${price.amount.toLocaleString()} $SANKOFA`;
  };

  const cardVariants = {
    default: "group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
    compact: "group cursor-pointer transition-all duration-200 hover:scale-[1.01]",
    featured: "group cursor-pointer transition-all duration-300 hover:scale-[1.03]",
    list: "group cursor-pointer transition-all duration-200 hover:scale-[1.01]",
  };

  if (variant === "list") {
    return (
      <Link href={`/product/${product.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cardVariants[variant]}
        >
          <Card className="overflow-hidden border border-base-content/10 hover:border-indigo-300 hover:shadow-lg bg-base-100">
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="128px"
                  />

                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`absolute top-2 right-2 p-1.5 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 ${
                      isLiked ? "bg-red-50 hover:bg-red-100" : "bg-base-100/90 hover:bg-base-100"
                    } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isLiking ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : isLiked ? (
                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-base-content hover:text-red-500 transition-colors" />
                    )}
                  </button>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={product.creator.avatar}
                        alt={product.creator.name}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <ENSNameDisplay
                        address={product.creator.address}
                        ensName={product.creator.ensName}
                        fallback={product.creator.name}
                        className="text-sm text-base-content/70 font-medium"
                        maxLength={15}
                      />
                      {product.creator.verified && <ShieldCheckIcon className="w-4 h-4 text-blue-500" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base-content line-clamp-1 group-hover:text-indigo-200 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-base-content/60 line-clamp-2 mt-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-base-content/60">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{product.location.country}</span>
                    </div>

                    <div className="flex gap-1">
                      {product.metadata.featured && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded">
                          Featured
                        </span>
                      )}
                      {product.authenticity.verified && (
                        <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded flex items-center gap-1">
                          <ShieldCheckIcon className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end min-w-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-base-content">{formatPrice(product.price)}</p>
                    {product.price.usd && <p className="text-sm text-base-content/60">≈ ${product.price.usd}</p>}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-base-content/60">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{product.stats.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{product.stats.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cardVariants[variant]}
      >
        <Card className="h-full overflow-hidden border border-base-content/10 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 bg-base-100">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes={variant === "compact" ? "200px" : "400px"}
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex gap-2">
                  <button
                    onClick={handleQuickView}
                    className="btn btn-primary btn-sm gap-2 backdrop-blur-sm bg-primary/90 hover:bg-primary border-none"
                    title="Quick View"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Quick View
                  </button>

                  {product.isListed && product.listingId && product.listingType === "direct" ? (
                    <button
                      onClick={async e => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Show processing state
                        addToast({
                          type: "info",
                          title: "Processing Purchase...",
                          message: "Transaction in progress",
                        });

                        // Simulate blockchain processing time
                        setTimeout(() => {
                          addToast({
                            type: "success",
                            title: "Purchase Successful! 🎉",
                            message: "Transaction completed on blockchain.",
                          });
                        }, 2000);
                      }}
                      className="btn btn-success btn-sm gap-2 backdrop-blur-sm bg-green-600/90 hover:bg-green-600 border-none"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Buy Now
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="btn btn-secondary btn-sm gap-2 backdrop-blur-sm bg-secondary/90 hover:bg-secondary border-none"
                      title="Add to Cart"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Add to Cart
                    </button>
                  )}

                  {product.isListed && product.listingType === "auction" && (
                    <button
                      onClick={async e => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Show processing state
                        addToast({
                          type: "info",
                          title: "Submitting Offer...",
                          message: "Processing your bid",
                        });

                        // Simulate processing time
                        setTimeout(() => {
                          addToast({
                            type: "success",
                            title: "Offer Submitted! 🎉",
                            message: "Your bid has been placed successfully.",
                          });
                        }, 1500);
                      }}
                      className="btn btn-warning btn-sm gap-2 backdrop-blur-sm bg-yellow-600/90 hover:bg-yellow-600 border-none"
                    >
                      Make Offer
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 ${
                  isLiked ? "bg-red-50 hover:bg-red-100" : "bg-base-100/90 hover:bg-base-100"
                } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLiking ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-base-content hover:text-red-500 transition-colors" />
                )}
              </button>

              <button
                onClick={handleAddToComparison}
                className={`absolute top-3 right-14 p-2 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10 ${
                  isProductInComparison(product.id)
                    ? "bg-primary/20 text-primary"
                    : "bg-base-100/90 hover:bg-base-100 text-base-content"
                }`}
                title="Add to Comparison"
              >
                <ScaleIcon className="w-5 h-5" />
              </button>

              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.metadata.featured && (
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                )}
                {product.metadata.trending && (
                  <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold rounded-full">
                    Trending
                  </span>
                )}
                {product.authenticity.verified && (
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <ShieldCheckIcon className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg">
                  Detailed View
                </button>
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <Image
                  src={product.creator.avatar}
                  alt={product.creator.name}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
              <div className="flex items-center gap-1">
                <ENSNameDisplay
                  address={product.creator.address}
                  ensName={product.creator.ensName}
                  fallback={product.creator.name}
                  className="text-sm text-base-content/70 font-medium"
                  maxLength={15}
                />
                {product.creator.verified && <ShieldCheckIcon className="w-4 h-4 text-blue-500" />}
              </div>
            </div>

            <h3 className="font-semibold text-base-content line-clamp-2 group-hover:text-indigo-200 transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 text-sm text-base-content/60">
              <MapPinIcon className="w-4 h-4" />
              <span>{product.location.country}</span>
              {product.location.region && <span>, {product.location.region}</span>}
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-lg font-bold text-base-content">{formatPrice(product.price)}</p>
                {product.price.usd && <p className="text-sm text-base-content/60">≈ ${product.price.usd}</p>}
              </div>

              <div className="flex items-center gap-1">
                <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-base-content">{product.stats.rating.toFixed(1)}</span>
              </div>
            </div>

            {showStats && variant !== "compact" && (
              <div className="flex items-center justify-between text-xs text-base-content/60 pt-2 border-t border-base-content/10">
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{product.stats.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{product.stats.likes}</span>
                </div>
                <div>
                  <span>{product.stats.sold} sold</span>
                </div>
              </div>
            )}

            {!product.availability.inStock && (
              <div className="text-center py-2">
                <span className="text-sm font-medium text-red-500">Out of Stock</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};
