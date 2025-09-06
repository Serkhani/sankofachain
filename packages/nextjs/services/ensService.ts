import { Address, isAddress } from "viem";
import { normalize } from "viem/ens";

export interface TextRecord {
  key: string;
  value: string;
}

export interface ENSRegistrationData {
  label: string;
  owner: string;
  textRecords?: TextRecord[];
}

export interface ENSAvailabilityResult {
  available: boolean;
  reason?: string;
}

export interface ENSResolutionResult {
  address: string | null;
  name: string | null;
  avatar: string | null;
}

export class ENSService {
  private static instance: ENSService;
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  static getInstance(): ENSService {
    if (!ENSService.instance) {
      ENSService.instance = new ENSService();
    }
    return ENSService.instance;
  }

  /**
   * Validate ENS label format
   */
  validateLabel(label: string): { valid: boolean; error?: string } {
    if (!label || label.length < 3) {
      return { valid: false, error: "Label must be at least 3 characters long" };
    }
    
    if (label.length > 63) {
      return { valid: false, error: "Label must be less than 64 characters" };
    }

    // Check for valid characters (alphanumeric and hyphens, but not starting/ending with hyphen)
    const validPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    if (!validPattern.test(label)) {
      return { 
        valid: false, 
        error: "Label can only contain letters, numbers, and hyphens (not at start/end)" 
      };
    }

    return { valid: true };
  }

  /**
   * Check if a subdomain is available for registration
   */
  async checkAvailability(label: string): Promise<ENSAvailabilityResult> {
    const validation = this.validateLabel(label);
    if (!validation.valid) {
      return { available: false, reason: validation.error };
    }

    const cacheKey = `availability_${label}`;
    const cached = this.getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      // This will be implemented with the contract hook
      // For now, return a mock response
      const result = { available: true };
      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error checking ENS availability:", error);
      return { available: false, reason: "Failed to check availability" };
    }
  }

  /**
   * Register a new ENS subdomain
   */
  async registerSubdomain(data: ENSRegistrationData): Promise<{ success: boolean; node?: string; error?: string }> {
    const validation = this.validateLabel(data.label);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      // This will be implemented with the contract hook
      // For now, return a mock response
      const node = `0x${Math.random().toString(16).substr(2, 64)}`;
      return { success: true, node };
    } catch (error) {
      console.error("Error registering ENS subdomain:", error);
      return { success: false, error: "Failed to register subdomain" };
    }
  }

  /**
   * Get ENS name for an address
   */
  async getENSName(address: string): Promise<string | null> {
    if (!isAddress(address)) {
      return null;
    }

    const cacheKey = `ens_name_${address}`;
    const cached = this.getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      // This will be implemented with the contract hook
      // For now, return null
      return null;
    } catch (error) {
      console.error("Error getting ENS name:", error);
      return null;
    }
  }

  /**
   * Resolve ENS name to address
   */
  async resolveENSName(ensName: string): Promise<string | null> {
    if (!ensName || !ensName.includes('.')) {
      return null;
    }

    const cacheKey = `resolve_${ensName}`;
    const cached = this.getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      // This will be implemented with the contract hook
      // For now, return null
      return null;
    } catch (error) {
      console.error("Error resolving ENS name:", error);
      return null;
    }
  }

  /**
   * Get full ENS resolution data (name, address, avatar)
   */
  async getENSResolution(ensNameOrAddress: string): Promise<ENSResolutionResult> {
    if (isAddress(ensNameOrAddress)) {
      const name = await this.getENSName(ensNameOrAddress);
      return {
        address: ensNameOrAddress,
        name,
        avatar: null, // Will be implemented with avatar resolution
      };
    } else {
      const address = await this.resolveENSName(ensNameOrAddress);
      return {
        address,
        name: ensNameOrAddress,
        avatar: null, // Will be implemented with avatar resolution
      };
    }
  }

  /**
   * Update text records for an ENS name
   */
  async updateTextRecords(node: string, records: TextRecord[]): Promise<{ success: boolean; error?: string }> {
    try {
      // This will be implemented with the contract hook
      return { success: true };
    } catch (error) {
      console.error("Error updating text records:", error);
      return { success: false, error: "Failed to update text records" };
    }
  }

  /**
   * Get text record for an ENS name
   */
  async getTextRecord(node: string, key: string): Promise<string | null> {
    try {
      // This will be implemented with the contract hook
      return null;
    } catch (error) {
      console.error("Error getting text record:", error);
      return null;
    }
  }

  /**
   * Format ENS name with domain
   */
  formatENSName(label: string, domain: string = "sankofachain.eth"): string {
    return `${label}.${domain}`;
  }

  /**
   * Extract label from full ENS name
   */
  extractLabel(ensName: string, domain: string = "sankofachain.eth"): string | null {
    if (ensName.endsWith(`.${domain}`)) {
      return ensName.slice(0, -(domain.length + 1));
    }
    return null;
  }

  /**
   * Check if a string is a valid ENS name
   */
  isENSName(value: string): boolean {
    return value.includes('.') && value.length > 0;
  }

  /**
   * Cache management
   */
  private getCached(key: string): any {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.CACHE_TTL) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const ensService = ENSService.getInstance();

// Export utility functions
export const validateENSLabel = (label: string) => ensService.validateLabel(label);
export const formatENSName = (label: string, domain?: string) => ensService.formatENSName(label, domain);
export const extractLabel = (ensName: string, domain?: string) => ensService.extractLabel(ensName, domain);
export const isENSName = (value: string) => ensService.isENSName(value);
