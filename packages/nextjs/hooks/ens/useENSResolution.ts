import { useState, useEffect, useCallback } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useAccount } from "wagmi";
import { Address, isAddress } from "viem";
import { normalize } from "viem/ens";

export interface ENSResolutionResult {
  address: string | null;
  name: string | null;
  avatar: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseENSResolutionReturn {
  resolveENSName: (ensName: string) => Promise<string | null>;
  getENSName: (address: string) => Promise<string | null>;
  getCurrentENSName: () => Promise<string | null>;
  resolution: ENSResolutionResult;
  clearError: () => void;
}

export const useENSResolution = (): UseENSResolutionReturn => {
  const [resolution, setResolution] = useState<ENSResolutionResult>({
    address: null,
    name: null,
    avatar: null,
    isLoading: false,
    error: null,
  });

  const { address } = useAccount();

  const clearError = useCallback(() => {
    setResolution(prev => ({ ...prev, error: null }));
  }, []);

  const resolveENSName = useCallback(async (ensName: string): Promise<string | null> => {
    if (!ensName || !ensName.includes('.')) {
      return null;
    }

    setResolution(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // This would typically use a resolver contract
      // For now, we'll return null as the contract doesn't have resolution
      // In a real implementation, you'd call the resolver contract
      setResolution(prev => ({ 
        ...prev, 
        isLoading: false, 
        name: ensName,
        address: null 
      }));
      return null;
    } catch (error) {
      const errorMessage = "Failed to resolve ENS name";
      setResolution(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, []);

  const getENSName = useCallback(async (address: string): Promise<string | null> => {
    if (!isAddress(address)) {
      return null;
    }

    setResolution(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // This would typically use a reverse resolver
      // For now, we'll return null as the contract doesn't have reverse resolution
      setResolution(prev => ({ 
        ...prev, 
        isLoading: false, 
        address,
        name: null 
      }));
      return null;
    } catch (error) {
      const errorMessage = "Failed to get ENS name";
      setResolution(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return null;
    }
  }, []);

  const getCurrentENSName = useCallback(async (): Promise<string | null> => {
    if (!address) {
      return null;
    }

    return getENSName(address);
  }, [address, getENSName]);

  return {
    resolveENSName,
    getENSName,
    getCurrentENSName,
    resolution,
    clearError,
  };
};
