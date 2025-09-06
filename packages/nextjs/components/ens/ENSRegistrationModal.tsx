"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../ui";
import { Check, Loader2, X, XCircle } from "lucide-react";
import { useENSAvailability, useENSRegistration } from "~~/hooks/ens";
import { TextRecord } from "~~/services/ensService";

interface ENSRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ensName: string) => void;
  userAddress: string;
}

interface FormData {
  label: string;
  name: string;
  bio: string;
  website: string;
  twitter: string;
  instagram: string;
}

export const ENSRegistrationModal = ({ isOpen, onClose, onSuccess, userAddress }: ENSRegistrationModalProps) => {
  const { address } = useAccount();
  const [formData, setFormData] = useState<FormData>({
    label: "",
    name: "",
    bio: "",
    website: "",
    twitter: "",
    instagram: "",
  });
  const [step, setStep] = useState<"form" | "confirm" | "processing" | "success">("form");

  const { available, isLoading: checkingAvailability, error: availabilityError } = useENSAvailability(formData.label);
  const { registerSubdomain, isRegistering, error: registrationError, clearError } = useENSRegistration();

  const isFormValid = formData.label.length >= 3 && formData.name.length > 0;
  const canProceed = isFormValid && available === true && !checkingAvailability;

  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setFormData({
        label: "",
        name: "",
        bio: "",
        website: "",
        twitter: "",
        instagram: "",
      });
      clearError();
    }
  }, [isOpen, clearError]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "label") {
      clearError();
    }
  };

  const handleNext = () => {
    if (step === "form") {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("form");
    }
  };

  const handleRegister = async () => {
    if (!canProceed) return;

    setStep("processing");
    clearError();

    const textRecords: TextRecord[] = [
      { key: "display", value: formData.name },
      { key: "description", value: formData.bio },
    ];

    if (formData.website) {
      textRecords.push({ key: "url", value: formData.website });
    }
    if (formData.twitter) {
      textRecords.push({ key: "com.twitter", value: formData.twitter });
    }
    if (formData.instagram) {
      textRecords.push({ key: "com.instagram", value: formData.instagram });
    }

    const result = await registerSubdomain(formData.label, textRecords);

    if (result.success) {
      setStep("success");
      setTimeout(() => {
        onSuccess(`${formData.label}.sankofachain.eth`);
        onClose();
      }, 2000);
    } else {
      setStep("confirm");
    }
  };

  const getAvailabilityStatus = () => {
    if (checkingAvailability) {
      return (
        <div className="flex items-center text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Checking availability...
        </div>
      );
    }

    if (availabilityError) {
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="w-4 h-4 mr-2" />
          {availabilityError}
        </div>
      );
    }

    if (formData.label.length >= 3) {
      if (available === true) {
        return (
          <div className="flex items-center text-green-600">
            <Check className="w-4 h-4 mr-2" />
            {formData.label}.sankofachain.eth is available!
          </div>
        );
      } else if (available === false) {
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="w-4 h-4 mr-2" />
            {formData.label}.sankofachain.eth is already taken
          </div>
        );
      }
    }

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Register ENS Name</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === "form" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose your ENS name
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.label}
                    onChange={e => handleInputChange("label", e.target.value.toLowerCase())}
                    placeholder="alice"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md text-gray-600 dark:text-gray-300">
                    .sankofachain.eth
                  </span>
                </div>
                {getAvailabilityStatus()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  placeholder="Alice Johnson"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => handleInputChange("website", e.target.value)}
                    placeholder="https://alice.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={e => handleInputChange("twitter", e.target.value)}
                    placeholder="@alice"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleNext} disabled={!canProceed}>
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Confirm Registration</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  You are about to register <strong>{formData.label}.sankofachain.eth</strong> for your wallet address.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ENS Name:</span>
                  <span className="font-medium">{formData.label}.sankofachain.eth</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Display Name:</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Wallet:</span>
                  <span className="font-mono text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
              </div>

              {registrationError && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-200">{registrationError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleRegister} disabled={isRegistering}>
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    "Register ENS Name"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Registering your ENS name...</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we register {formData.label}.sankofachain.eth
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Success!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your ENS name <strong>{formData.label}.sankofachain.eth</strong> has been registered successfully.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">This window will close automatically...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
