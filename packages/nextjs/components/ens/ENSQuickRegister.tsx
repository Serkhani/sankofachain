"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../ui";
import { Check, Loader2, Plus, XCircle } from "lucide-react";
import { useENSAvailability, useENSRegistration } from "~~/hooks/ens";

interface ENSQuickRegisterProps {
  onSuccess?: (ensName: string) => void;
  className?: string;
}

export const ENSQuickRegister = ({ onSuccess, className = "" }: ENSQuickRegisterProps) => {
  const { address } = useAccount();
  const [label, setLabel] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const { available, isLoading: checkingAvailability, error: availabilityError } = useENSAvailability(label);
  const { registerBasic, isRegistering, error: registrationError } = useENSRegistration();

  const canRegister = label.length >= 3 && available === true && !checkingAvailability && !isRegistering;

  const handleRegister = async () => {
    if (!canRegister) return;

    const result = await registerBasic(label);
    if (result.success) {
      onSuccess?.(`${label}.sankofachain.eth`);
      setLabel("");
      setIsExpanded(false);
    }
  };

  const getAvailabilityStatus = () => {
    if (checkingAvailability) {
      return (
        <div className="flex items-center text-blue-600 text-sm">
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
          Checking...
        </div>
      );
    }

    if (availabilityError) {
      return (
        <div className="flex items-center text-red-600 text-sm">
          <XCircle className="w-3 h-3 mr-1" />
          Error
        </div>
      );
    }

    if (label.length >= 3) {
      if (available === true) {
        return (
          <div className="flex items-center text-green-600 text-sm">
            <Check className="w-3 h-3 mr-1" />
            Available
          </div>
        );
      } else if (available === false) {
        return (
          <div className="flex items-center text-red-600 text-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Taken
          </div>
        );
      }
    }

    return null;
  };

  if (!address) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Connect your wallet to register an ENS name</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {!isExpanded ? (
        <Button onClick={() => setIsExpanded(true)} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Register ENS Name
        </Button>
      ) : (
        <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose your ENS name
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value.toLowerCase())}
                placeholder="alice"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md text-gray-600 dark:text-gray-300 text-sm">
                .sankofachain.eth
              </span>
            </div>
            {getAvailabilityStatus()}
          </div>

          {registrationError && (
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm text-red-700 dark:text-red-200">
              {registrationError}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsExpanded(false);
                setLabel("");
              }}
              className="flex-1"
              size="sm"
            >
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={!canRegister} className="flex-1" size="sm">
              {isRegistering ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
