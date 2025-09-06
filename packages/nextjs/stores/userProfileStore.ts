import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Address } from "viem";

export interface UserProfile {
  walletAddress: string;
  ensName?: string;
  name: string;
  bio: string;
  avatar?: string;
  location?: {
    country: string;
    region?: string;
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  preferences?: {
    currency: "ETH" | "SANKOFA";
    language: string;
  };
  isENSRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileState {
  currentProfile: UserProfile | null;
  ensNames: Record<string, string>; // address -> ensName mapping
  ensAvailability: Record<string, boolean>; // label -> availability
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentProfile: (profile: UserProfile | null) => void;
  setENSName: (address: string, ensName: string) => void;
  setENSAvailability: (label: string, available: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Profile management
  loadProfile: (address: string) => Promise<void>;
  createProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  registerENSName: (label: string, userDetails?: any) => Promise<void>;

  // ENS utilities
  getENSName: (address: string) => string | null;
  checkENSAvailability: (label: string) => boolean | null;
  isProfileComplete: () => boolean;
  hasENSName: () => boolean;
}

export const useUserProfileStore = create<UserProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        currentProfile: null,
        ensNames: {},
        ensAvailability: {},
        isLoading: false,
        error: null,

        setCurrentProfile: (profile) => {
          set({ currentProfile: profile }, false, "setCurrentProfile");
        },

        setENSName: (address, ensName) => {
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

        setENSAvailability: (label, available) => {
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

        setLoading: (loading) => {
          set({ isLoading: loading }, false, "setLoading");
        },

        setError: (error) => {
          set({ error }, false, "setError");
        },

        clearError: () => {
          set({ error: null }, false, "clearError");
        },

        loadProfile: async (address) => {
          const state = get();
          state.setLoading(true);
          state.clearError();

          try {
            // In a real implementation, this would load from a backend or IPFS
            // For now, we'll create a basic profile structure
            const profile: UserProfile = {
              walletAddress: address,
              name: "",
              bio: "",
              isENSRegistered: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Check if we have an ENS name for this address
            const ensName = state.ensNames[address];
            if (ensName) {
              profile.ensName = ensName;
              profile.isENSRegistered = true;
            }

            state.setCurrentProfile(profile);
          } catch (error) {
            console.error("Error loading profile:", error);
            state.setError("Failed to load profile");
          } finally {
            state.setLoading(false);
          }
        },

        createProfile: async (profileData) => {
          const state = get();
          state.setLoading(true);
          state.clearError();

          try {
            const newProfile: UserProfile = {
              walletAddress: profileData.walletAddress || "",
              ensName: profileData.ensName,
              name: profileData.name || "",
              bio: profileData.bio || "",
              avatar: profileData.avatar,
              location: profileData.location,
              socialLinks: profileData.socialLinks,
              preferences: profileData.preferences || {
                currency: "ETH",
                language: "en",
              },
              isENSRegistered: Boolean(profileData.ensName),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // In a real implementation, this would save to a backend or IPFS
            state.setCurrentProfile(newProfile);

            if (newProfile.ensName) {
              state.setENSName(newProfile.walletAddress, newProfile.ensName);
            }
          } catch (error) {
            console.error("Error creating profile:", error);
            state.setError("Failed to create profile");
          } finally {
            state.setLoading(false);
          }
        },

        updateProfile: async (updates) => {
          const state = get();
          const currentProfile = state.currentProfile;

          if (!currentProfile) {
            state.setError("No profile to update");
            return;
          }

          state.setLoading(true);
          state.clearError();

          try {
            const updatedProfile: UserProfile = {
              ...currentProfile,
              ...updates,
              updatedAt: new Date().toISOString(),
            };

            // In a real implementation, this would save to a backend or IPFS
            state.setCurrentProfile(updatedProfile);

            if (updates.ensName) {
              state.setENSName(updatedProfile.walletAddress, updates.ensName);
            }
          } catch (error) {
            console.error("Error updating profile:", error);
            state.setError("Failed to update profile");
          } finally {
            state.setLoading(false);
          }
        },

        registerENSName: async (label, userDetails) => {
          const state = get();
          const currentProfile = state.currentProfile;

          if (!currentProfile) {
            state.setError("No profile to update with ENS name");
            return;
          }

          state.setLoading(true);
          state.clearError();

          try {
            const ensName = `${label}.sankofachain.eth`;
            
            // Update profile with ENS name
            await state.updateProfile({
              ensName,
              isENSRegistered: true,
            });

            // Set ENS name mapping
            state.setENSName(currentProfile.walletAddress, ensName);
          } catch (error) {
            console.error("Error registering ENS name:", error);
            state.setError("Failed to register ENS name");
          } finally {
            state.setLoading(false);
          }
        },

        getENSName: (address) => {
          const state = get();
          return state.ensNames[address] || null;
        },

        checkENSAvailability: (label) => {
          const state = get();
          return state.ensAvailability[label] ?? null;
        },

        isProfileComplete: () => {
          const state = get();
          const profile = state.currentProfile;
          return Boolean(profile && profile.name && profile.bio);
        },

        hasENSName: () => {
          const state = get();
          const profile = state.currentProfile;
          return Boolean(profile && profile.ensName);
        },
      }),
      {
        name: "sankofa-user-profile",
        partialize: (state) => ({
          currentProfile: state.currentProfile,
          ensNames: state.ensNames,
        }),
      }
    ),
    {
      name: "UserProfileStore",
    }
  )
);
