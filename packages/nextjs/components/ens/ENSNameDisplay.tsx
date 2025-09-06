"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useENSResolution } from "~~/hooks/ens";
import { Address, isAddress } from "viem";
import { Button } from "../ui";
import { Copy, Check, ExternalLink } from "lucide-react";

interface ENSNameDisplayProps {
  address?: string;
  ensName?: string;
  fallback?: string;
  showAvatar?: boolean;
  showCopyButton?: boolean;
  showExternalLink?: boolean;
  className?: string;
  maxLength?: number;
}

export const ENSNameDisplay = ({
  address,
  ensName,
  fallback,
  showAvatar = false,
  showCopyButton = true,
  showExternalLink = false,
  className = "",
  maxLength = 20,
}: ENSNameDisplayProps) => {
  const { address: connectedAddress } = useAccount();
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [displayAddress, setDisplayAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { getENSName, resolution } = useENSResolution();

  const targetAddress = address || connectedAddress;

  useEffect(() => {
    const loadDisplayInfo = async () => {
      if (ensName) {
        setDisplayName(ensName);
        setDisplayAddress(targetAddress || "");
        return;
      }

      if (targetAddress && isAddress(targetAddress)) {
        setIsLoading(true);
        try {
          const resolvedName = await getENSName(targetAddress);
          if (resolvedName) {
            setDisplayName(resolvedName);
            setDisplayAddress(targetAddress);
          } else {
            setDisplayName(fallback || `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`);
            setDisplayAddress(targetAddress);
          }
        } catch (error) {
          console.error("Error loading ENS name:", error);
          setDisplayName(fallback || `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`);
          setDisplayAddress(targetAddress);
        } finally {
          setIsLoading(false);
        }
      } else if (fallback) {
        setDisplayName(fallback);
        setDisplayAddress("");
      }
    };

    loadDisplayInfo();
  }, [address, ensName, targetAddress, fallback, getENSName]);

  const handleCopy = async () => {
    const textToCopy = ensName || displayAddress || displayName;
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const handleExternalLink = () => {
    if (displayAddress) {
      const explorerUrl = `https://basescan.org/address/${displayAddress}`;
      window.open(explorerUrl, "_blank");
    }
  };

  const truncateText = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen - 3)}...`;
  };

  const isENS = displayName.includes('.') && displayName.includes('eth');

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showAvatar && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${isENS ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
            {truncateText(displayName, maxLength)}
          </span>
          
          {isENS && (
            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
              ENS
            </span>
          )}
        </div>
        
        {displayAddress && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {truncateText(displayAddress, maxLength + 10)}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="p-1 h-6 w-6"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        )}
        
        {showExternalLink && displayAddress && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExternalLink}
            className="p-1 h-6 w-6"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
