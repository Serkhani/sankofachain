"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdjustmentsHorizontalIcon, ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import { ErrorBoundary } from "~~/components/ErrorBoundary";
import { ProductGrid, SearchBar } from "~~/components/marketplace";
import { Button } from "~~/components/ui";
import { useThirdwebMarketplace } from "~~/hooks/thirdweb/useThirdwebMarketplace";
import { useMarketplaceStore } from "~~/stores/marketplaceStore";

const MarketplacePage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  // Get thirdweb data
  const { products: blockchainProducts, isLoading: isLoadingBlockchain } = useThirdwebMarketplace();

  const {
    filteredProducts,
    isLoading: isLoadingStore,
    currentPage,
    itemsPerPage,
    filters,
    setCurrentPage,
    setFilters,
    applyFilters,
    resetFilters,
  } = useMarketplaceStore();

  // Combine blockchain products with store products (blockchain products first)
  const allProducts = [...blockchainProducts, ...filteredProducts];
  const isLoading = isLoadingStore || isLoadingBlockchain;

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = allProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);

  const handleLike = (productId: string) => {
    setLikedProducts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(productId)) {
        newLiked.delete(productId);
      } else {
        newLiked.add(productId);
      }
      return newLiked;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div
        className="relative bg-cover bg-center bg-no-repeat border-b border-base-content/10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1621419203897-20b66b98d495?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Sankofa Marketplace
              </span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Discover authentic products, patterns, and experiences from verified African creators
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <SearchBar onToggleFilters={() => setShowFilters(!showFilters)} showFilterToggle={true} />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-base-100 rounded-2xl border border-base-content/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base-content">Filters</h3>
                  {filters.searchQuery || filters.categories.length > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      Clear All
                    </Button>
                  ) : null}
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-base-content mb-3">Categories</h4>
                    <div className="space-y-2">
                      {["textiles", "jewelry", "art", "beverages", "experiences", "skincare"].map(category => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={filters.categories.includes(category)}
                            onChange={e => {
                              const newCategories = e.target.checked
                                ? [...filters.categories, category]
                                : filters.categories.filter(c => c !== category);
                              setFilters({ categories: newCategories });
                            }}
                          />
                          <span className="text-sm text-base-content/80 capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-base-content mb-3">Price Range (ETH)</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          step="0.01"
                          min="0"
                          className="input input-sm input-bordered flex-1"
                          value={filters.priceRange.min}
                          onChange={e =>
                            setFilters({
                              priceRange: { ...filters.priceRange, min: parseFloat(e.target.value) || 0 },
                            })
                          }
                        />
                        <span className="text-base-content/60">to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          step="0.01"
                          min="0"
                          className="input input-sm input-bordered flex-1"
                          value={filters.priceRange.max}
                          onChange={e =>
                            setFilters({
                              priceRange: { ...filters.priceRange, max: parseFloat(e.target.value) || 10 },
                            })
                          }
                        />
                      </div>
                      <div className="text-xs text-base-content/60">
                        Showing: {filters.priceRange.min} - {filters.priceRange.max} ETH
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-base-content mb-3">Location</h4>
                    <div className="space-y-2">
                      {["Ghana", "Nigeria", "Kenya", "South Africa", "Ethiopia"].map(location => (
                        <label key={location} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={filters.location.includes(location)}
                            onChange={e => {
                              const newLocations = e.target.checked
                                ? [...filters.location, location]
                                : filters.location.filter(l => l !== location);
                              setFilters({ location: newLocations });
                            }}
                          />
                          <span className="text-sm text-base-content/80">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-base-content mb-3">Verification</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={filters.verified}
                        onChange={e => setFilters({ verified: e.target.checked })}
                      />
                      <span className="text-sm text-base-content/80">Verified creators only</span>
                    </label>
                  </div>

                  <div>
                    <h4 className="font-medium text-base-content mb-3">Availability</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={filters.inStock}
                        onChange={e => setFilters({ inStock: e.target.checked })}
                      />
                      <span className="text-sm text-base-content/80">In stock only</span>
                    </label>
                  </div>

                  <div>
                    <h4 className="font-medium text-base-content mb-3">Sort By</h4>
                    <select
                      className="select select-sm select-bordered w-full"
                      value={filters.sortBy}
                      onChange={e => setFilters({ sortBy: e.target.value as any })}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-base-content/10">
                  <div className="text-sm text-base-content/60 mb-2">Results</div>
                  <div className="text-lg font-semibold text-base-content">
                    {allProducts.length.toLocaleString()} products
                  </div>
                  {blockchainProducts.length > 0 && (
                    <div className="text-xs text-green-600 mt-1">{blockchainProducts.length} from blockchain</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-base-content/60">
                  Showing {startIndex + 1}-{Math.min(endIndex, allProducts.length)} of{" "}
                  {allProducts.length.toLocaleString()} products
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-base-100 border border-base-content/20 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid" ? "bg-indigo-600 text-white" : "text-base-content/60 hover:text-base-content"
                    }`}
                    title="Grid view"
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list" ? "bg-indigo-600 text-white" : "text-base-content/60 hover:text-base-content"
                    }`}
                    title="List view"
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>

                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <ErrorBoundary>
                <ProductGrid
                  products={currentProducts}
                  isLoading={isLoading}
                  variant="default"
                  viewMode={viewMode}
                  onLike={handleLike}
                  likedProducts={likedProducts}
                />
              </ErrorBoundary>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
