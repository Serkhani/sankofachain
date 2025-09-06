import { useState, useEffect, useCallback } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useDebounceValue } from "usehooks-ts";

export interface UseENSAvailabilityReturn {
  available: boolean | null;
  isLoading: boolean;
  error: string | null;
  checkAvailability: (label: string) => void;
  clearError: () => void;
}

export const useENSAvailability = (label: string): UseENSAvailabilityReturn => {
  const [error, setError] = useState<string | null>(null);
  const [debouncedLabel] = useDebounceValue(label, 500);

  const {
    data: available,
    isLoading,
    error: contractError,
  } = useScaffoldReadContract({
    contractName: "SankofaRegistrar",
    functionName: "available",
    args: debouncedLabel ? [debouncedLabel] : undefined,
    query: {
      enabled: Boolean(debouncedLabel && debouncedLabel.length >= 3),
    },
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkAvailability = useCallback((newLabel: string) => {
    if (newLabel.length < 3) {
      setError("Label must be at least 3 characters long");
      return;
    }
    
    if (newLabel.length > 63) {
      setError("Label must be less than 64 characters");
      return;
    }

    const validPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    if (!validPattern.test(newLabel)) {
      setError("Label can only contain letters, numbers, and hyphens (not at start/end)");
      return;
    }

    setError(null);
  }, []);

  useEffect(() => {
    if (contractError) {
      setError("Failed to check availability");
    }
  }, [contractError]);

  useEffect(() => {
    if (debouncedLabel) {
      checkAvailability(debouncedLabel);
    }
  }, [debouncedLabel, checkAvailability]);

  return {
    available: available as boolean | null,
    isLoading,
    error: error || (contractError ? "Failed to check availability" : null),
    checkAvailability,
    clearError,
  };
};
