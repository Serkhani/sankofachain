"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserProfileStore } from "~~/stores/userProfileStore";
import { ENSRegistrationModal, ENSNameDisplay, ENSQuickRegister } from "~~/components/ens";
import { Button } from "~~/components/ui/Button";
import { User, Edit, Globe, Twitter, Instagram, Linkedin, ExternalLink } from "lucide-react";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const {
    currentProfile,
    loadProfile,
    createProfile,
    updateProfile,
    isLoading,
    error,
    isProfileComplete,
    hasENSName,
  } = useUserProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showENSModal, setShowENSModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });

  useEffect(() => {
    if (address && isConnected) {
      loadProfile(address);
    }
  }, [address, isConnected, loadProfile]);

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        name: currentProfile.name || "",
        bio: currentProfile.bio || "",
        website: currentProfile.socialLinks?.website || "",
        twitter: currentProfile.socialLinks?.twitter || "",
        instagram: currentProfile.socialLinks?.instagram || "",
        linkedin: currentProfile.socialLinks?.linkedin || "",
      });
    }
  }, [currentProfile]);

  const handleSave = async () => {
    if (!address) return;

    const profileData = {
      walletAddress: address,
      name: formData.name,
      bio: formData.bio,
      socialLinks: {
        website: formData.website || undefined,
        twitter: formData.twitter || undefined,
        instagram: formData.instagram || undefined,
        linkedin: formData.linkedin || undefined,
      },
    };

    if (currentProfile) {
      await updateProfile(profileData);
    } else {
      await createProfile(profileData);
    }

    setIsEditing(false);
  };

  const handleENSRegistration = (ensName: string) => {
    if (currentProfile) {
      updateProfile({ ensName });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please connect your wallet to view your profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {currentProfile?.name || "Your Profile"}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <ENSNameDisplay
                      address={address}
                      ensName={currentProfile?.ensName}
                      showAvatar={false}
                      className="text-white/90"
                    />
                    {!hasENSName() && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowENSModal(true)}
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        Register ENS
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}

            {!currentProfile ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create Your Profile
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Set up your profile to get started on SankofaChain
                </p>
                <div className="space-y-4">
                  <ENSQuickRegister onSuccess={handleENSRegistration} />
                  <Button onClick={() => setIsEditing(true)}>
                    Create Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{currentProfile.name || "Not set"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ENS Name
                      </label>
                      <ENSNameDisplay
                        address={address}
                        ensName={currentProfile.ensName}
                        showCopyButton={true}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{currentProfile.bio || "No bio provided"}</p>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Social Links
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://yourwebsite.com"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-900 dark:text-white">
                            {currentProfile.socialLinks?.website || "Not set"}
                          </p>
                          {currentProfile.socialLinks?.website && (
                            <a
                              href={currentProfile.socialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Twitter className="w-4 h-4 inline mr-2" />
                        Twitter
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.twitter}
                          onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                          placeholder="@username"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {currentProfile.socialLinks?.twitter || "Not set"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Instagram className="w-4 h-4 inline mr-2" />
                        Instagram
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.instagram}
                          onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                          placeholder="@username"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {currentProfile.socialLinks?.instagram || "Not set"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Linkedin className="w-4 h-4 inline mr-2" />
                        LinkedIn
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.linkedin}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                          placeholder="username"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {currentProfile.socialLinks?.linkedin || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ENS Management */}
                {hasENSName() && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      ENS Management
                    </h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-200 text-sm">
                        Your ENS name is registered and active. You can update your profile information
                        and it will be reflected in your ENS text records.
                      </p>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!formData.name.trim()}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ENS Registration Modal */}
        <ENSRegistrationModal
          isOpen={showENSModal}
          onClose={() => setShowENSModal(false)}
          onSuccess={handleENSRegistration}
          userAddress={address || ""}
        />
      </div>
    </div>
  );
}
