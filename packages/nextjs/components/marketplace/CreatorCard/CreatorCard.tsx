"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EyeIcon, MapPinIcon, ShieldCheckIcon, StarIcon } from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldCheckSolidIcon } from "@heroicons/react/24/solid";
import FollowButton from "~~/components/ui/FollowButton/FollowButton";
import { ENSNameDisplay } from "~~/components/ens";
import { formatNumber } from "~~/lib/utils";
import { CreatorProfile } from "~~/types/marketplace";

interface CreatorCardProps {
  creator: CreatorProfile;
  onFollow?: (creatorId: string) => void;
  isFollowing?: boolean;
  variant?: "default" | "compact" | "featured";
  showActions?: boolean;
}

export const CreatorCard = ({ creator, variant = "default", showActions = true }: CreatorCardProps) => {
  const cardVariants = {
    default:
      "bg-base-100 border border-base-300 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30",
    compact:
      "bg-base-100 border border-base-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:border-primary/30",
    featured:
      "bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary/50",
  };

  const sizeVariants = {
    default: { banner: "h-32", avatar: "w-16 h-16", padding: "p-6" },
    compact: { banner: "h-24", avatar: "w-12 h-12", padding: "p-4" },
    featured: { banner: "h-40", avatar: "w-20 h-20", padding: "p-8" },
  };

  const sizes = sizeVariants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={cardVariants[variant]}
    >
      <div
        className={`relative ${sizes.banner} overflow-hidden ${variant === "default" ? "rounded-t-xl" : variant === "compact" ? "rounded-t-lg" : "rounded-t-xl"}`}
      >
        <Image
          src={creator.bannerImage || "/api/placeholder/400/200"}
          alt={`${creator.name} banner`}
          fill
          className="object-cover"
          sizes="400px"
        />

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute top-3 left-3 flex gap-2">
          {creator.featured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">Featured</span>
          )}
          {creator.verified && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <ShieldCheckSolidIcon className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {showActions && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-2">
              <Link href={`/creator/${creator.id}`} className="btn btn-primary btn-sm">
                <EyeIcon className="w-4 h-4" />
                View Store
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className={`${sizes.padding} relative`}>
        <div className="absolute -top-8 left-6">
          <div className={`relative ${sizes.avatar} rounded-full overflow-hidden border-4 border-base-100 shadow-lg`}>
            <Image src={creator.avatar} alt={creator.name} fill className="object-cover" sizes="80px" />
            {creator.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                <ShieldCheckSolidIcon className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className={variant === "compact" ? "mt-6" : "mt-8"}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold ${variant === "featured" ? "text-xl" : "text-lg"} flex items-center gap-2`}>
                <Link href={`/creator/${creator.id}`} className="hover:text-primary transition-colors truncate">
                  <ENSNameDisplay
                    address={creator.address}
                    ensName={creator.ensName}
                    fallback={creator.name}
                    className="truncate"
                    maxLength={20}
                  />
                </Link>
                {creator.verified && <ShieldCheckIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              </h3>
              <div className="flex items-center gap-1 text-sm text-base-content/60">
                <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {creator.city && `${creator.city}, `}
                  {creator.country}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <FollowButton
                lookupAddress={creator.address}
                onDisconnectedClick={() => alert("Please connect your wallet")}
              />
            </div>
          </div>

          <p className={`text-sm text-base-content/80 mb-4 ${variant === "compact" ? "line-clamp-1" : "line-clamp-2"}`}>
            {creator.bio}
          </p>

          <div className={`grid ${variant === "compact" ? "grid-cols-2" : "grid-cols-3"} gap-4 text-center mb-4`}>
            <div>
              <div className="font-bold text-primary">{formatNumber(creator.stats.followers)}</div>
              <div className="text-xs text-base-content/60">Followers</div>
            </div>
            <div>
              <div className="font-bold text-primary">{creator.stats.totalProducts}</div>
              <div className="text-xs text-base-content/60">Products</div>
            </div>
            {variant !== "compact" && (
              <div>
                <div className="font-bold text-primary flex items-center justify-center gap-1">
                  <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                  {creator.stats.rating.toFixed(1)}
                </div>
                <div className="text-xs text-base-content/60">Rating</div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {(variant === "featured" ? creator.specialties : creator.categories || [])
              .slice(0, variant === "compact" ? 1 : 2)
              .map(item => (
                <span key={item} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {item}
                </span>
              ))}
            {(variant === "featured" ? creator.specialties : creator.categories || []).length >
              (variant === "compact" ? 1 : 2) && (
              <span className="px-2 py-1 bg-base-200 text-base-content/60 text-xs rounded-full">
                +
                {(variant === "featured" ? creator.specialties : creator.categories || []).length -
                  (variant === "compact" ? 1 : 2)}
              </span>
            )}
          </div>

          {variant === "featured" && creator.achievements.length > 0 && (
            <div className="mt-4 pt-4 border-t border-base-300">
              <div className="flex items-center gap-2 text-sm text-base-content/80">
                <span className="text-lg">{creator.achievements[0].icon}</span>
                <span>{creator.achievements[0].title}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
