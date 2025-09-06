import { useState, useCallback } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useAccount } from "wagmi";
import { TextRecord, ENSRegistrationData } from "~~/services/ensService";

export interface UseENSRegistrationReturn {
  registerSubdomain: (label: string, textRecords?: TextRecord[]) => Promise<{ success: boolean; node?: string; error?: string }>;
  registerBasic: (label: string) => Promise<{ success: boolean; node?: string; error?: string }>;
  isRegistering: boolean;
  error: string | null;
  clearError: () => void;
}

export const useENSRegistration = (): UseENSRegistrationReturn => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const { writeContractAsync: writeSankofaRegistrar } = useScaffoldWriteContract({
    contractName: "SankofaRegistrar",
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const registerSubdomain = useCallback(async (
    label: string, 
    textRecords: TextRecord[] = []
  ): Promise<{ success: boolean; node?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsRegistering(true);
    setError(null);

    try {
      const result = await writeSankofaRegistrar({
        functionName: "register",
        args: [label, textRecords],
      });

      return { success: true, node: result };
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to register ENS subdomain";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRegistering(false);
    }
  }, [address, writeSankofaRegistrar]);

  const registerBasic = useCallback(async (
    label: string
  ): Promise<{ success: boolean; node?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsRegistering(true);
    setError(null);

    try {
      const result = await writeSankofaRegistrar({
        functionName: "registerBasic",
        args: [label],
      });

      return { success: true, node: result };
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to register ENS subdomain";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRegistering(false);
    }
  }, [address, writeSankofaRegistrar]);

  return {
    registerSubdomain,
    registerBasic,
    isRegistering,
    error,
    clearError,
  };
};
