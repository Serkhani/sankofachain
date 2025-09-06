import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { CreatorProfile, Product } from "~~/types/marketplace";

interface CreatorState {
  creators: CreatorProfile[];
  selectedCreator: CreatorProfile | null;
  creatorProducts: Record<string, Product[]>;
  followedCreators: string[];

  // ENS-related state
  ensNames: Record<string, string>; // address -> ensName mapping
  ensAvailability: Record<string, boolean>; // label -> availability

  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: "name" | "followers" | "rating" | "joinedDate" | "totalSales";
  filterBy: {
    location: string[];
    categories: string[];
    verified: boolean;
    featured: boolean;
  };

  setCreators: (creators: CreatorProfile[]) => void;
  setSelectedCreator: (creator: CreatorProfile | null) => void;
  setCreatorProducts: (creatorId: string, products: Product[]) => void;
  followCreator: (creatorId: string) => void;
  unfollowCreator: (creatorId: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: CreatorState["sortBy"]) => void;
  setFilterBy: (filters: Partial<CreatorState["filterBy"]>) => void;
  clearFilters: () => void;

  // ENS-related actions
  setENSName: (address: string, ensName: string) => void;
  setENSAvailability: (label: string, available: boolean) => void;
  updateCreatorENSName: (creatorId: string, ensName: string) => void;

  getFilteredCreators: () => CreatorProfile[];
  isFollowing: (creatorId: string) => boolean;
  getCreatorById: (id: string) => CreatorProfile | undefined;
  getCreatorProducts: (creatorId: string) => Product[];
  getFeaturedCreators: () => CreatorProfile[];
  getTopCreators: () => CreatorProfile[];
  getCreatorENSName: (address: string) => string | null;
}

export const useCreatorStore = create<CreatorState>()(
  devtools(
    persist(
      (set, get) => ({
        creators: [],
        selectedCreator: null,
        creatorProducts: {},
        followedCreators: [],
        ensNames: {},
        ensAvailability: {},
        isLoading: false,
        error: null,
        searchQuery: "",
        sortBy: "followers",
        filterBy: {
          location: [],
          categories: [],
          verified: false,
          featured: false,
        },

        setCreators: (creators: CreatorProfile[]) => {
          set({ creators, isLoading: false, error: null }, false, "setCreators");
        },

        setSelectedCreator: (creator: CreatorProfile | null) => {
          set({ selectedCreator: creator }, false, "setSelectedCreator");
        },

        setCreatorProducts: (creatorId: string, products: Product[]) => {
          set(
            state => ({
              creatorProducts: {
                ...state.creatorProducts,
                [creatorId]: products,
              },
            }),
            false,
            "setCreatorProducts",
          );
        },

        followCreator: (creatorId: string) => {
          set(
            state => {
              if (state.followedCreators.includes(creatorId)) {
                return state;
              }
              return {
                followedCreators: [...state.followedCreators, creatorId],
                creators: state.creators.map(creator =>
                  creator.id === creatorId
                    ? { ...creator, stats: { ...creator.stats, followers: creator.stats.followers + 1 } }
                    : creator,
                ),
              };
            },
            false,
            "followCreator",
          );
        },

        unfollowCreator: (creatorId: string) => {
          set(
            state => ({
              followedCreators: state.followedCreators.filter(id => id !== creatorId),
              creators: state.creators.map(creator =>
                creator.id === creatorId
                  ? { ...creator, stats: { ...creator.stats, followers: Math.max(0, creator.stats.followers - 1) } }
                  : creator,
              ),
            }),
            false,
            "unfollowCreator",
          );
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query }, false, "setSearchQuery");
        },

        setSortBy: (sort: CreatorState["sortBy"]) => {
          set({ sortBy: sort }, false, "setSortBy");
        },

        setFilterBy: (filters: Partial<CreatorState["filterBy"]>) => {
          set(
            state => ({
              filterBy: { ...state.filterBy, ...filters },
            }),
            false,
            "setFilterBy",
          );
        },

        clearFilters: () => {
          set(
            {
              searchQuery: "",
              filterBy: {
                location: [],
                categories: [],
                verified: false,
                featured: false,
              },
            },
            false,
            "clearFilters",
          );
        },

        getFilteredCreators: () => {
          const state = get();
          let filtered = [...state.creators];

          if (state.searchQuery.trim()) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(
              creator =>
                creator.name.toLowerCase().includes(query) ||
                creator.bio.toLowerCase().includes(query) ||
                creator.categories?.some(cat => cat.toLowerCase().includes(query)) ||
                creator.country.toLowerCase().includes(query),
            );
          }

          if (state.filterBy.verified) {
            filtered = filtered.filter(creator => creator.verified);
          }

          if (state.filterBy.featured) {
            filtered = filtered.filter(creator => creator.featured);
          }

          if (state.filterBy.location.length > 0) {
            filtered = filtered.filter(creator => state.filterBy.location.includes(creator.country));
          }

          if (state.filterBy.categories.length > 0) {
            filtered = filtered.filter(creator =>
              creator.categories?.some(cat => state.filterBy.categories.includes(cat)),
            );
          }

          filtered.sort((a, b) => {
            switch (state.sortBy) {
              case "name":
                return a.name.localeCompare(b.name);
              case "followers":
                return b.stats.followers - a.stats.followers;
              case "rating":
                return b.stats.rating - a.stats.rating;
              case "joinedDate":
                return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
              case "totalSales":
                return b.stats.totalSales - a.stats.totalSales;
              default:
                return 0;
            }
          });

          return filtered;
        },

        isFollowing: (creatorId: string) => {
          const state = get();
          return state.followedCreators.includes(creatorId);
        },

        getCreatorById: (id: string) => {
          const state = get();
          return state.creators.find(creator => creator.id === id);
        },

        getCreatorProducts: (creatorId: string) => {
          const state = get();
          return state.creatorProducts[creatorId] || [];
        },

        getFeaturedCreators: () => {
          const state = get();
          return state.creators.filter(creator => creator.featured);
        },

        getTopCreators: () => {
          const state = get();
          return [...state.creators].sort((a, b) => b.stats.followers - a.stats.followers).slice(0, 10);
        },

        // ENS-related methods
        setENSName: (address: string, ensName: string) => {
          set(
            (state) => ({
              ensNames: {
                ...state.ensNames,
                [address]: ensName,
              },
            }),
            false,
            "setENSName"
          );
        },

        setENSAvailability: (label: string, available: boolean) => {
          set(
            (state) => ({
              ensAvailability: {
                ...state.ensAvailability,
                [label]: available,
              },
            }),
            false,
            "setENSAvailability"
          );
        },

        updateCreatorENSName: (creatorId: string, ensName: string) => {
          set(
            (state) => ({
              creators: state.creators.map(creator =>
                creator.id === creatorId
                  ? { ...creator, ensName }
                  : creator
              ),
            }),
            false,
            "updateCreatorENSName"
          );
        },

        getCreatorENSName: (address: string) => {
          const state = get();
          return state.ensNames[address] || null;
        },
      }),
      {
        name: "sankofa-creators",
        partialize: state => ({
          followedCreators: state.followedCreators,
        }),
      },
    ),
    {
      name: "CreatorStore",
    },
  ),
);
