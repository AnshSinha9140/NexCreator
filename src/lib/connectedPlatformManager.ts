import { ConnectedPlatformAccount, VerifiedChannelMeta } from "@/types";

export interface AddPlatformInput {
  platform: string;
  username: string;
  displayName: string;
  avatar?: string;
  channelUrl: string;
  stableChannelId?: string;
  followersCount?: number;
  verified?: boolean;
  monitoringEnabled?: boolean;
  isDefault?: boolean;
}

export class ConnectedPlatformManager {
  /**
   * Transforms a VerifiedChannelMeta object into a complete ConnectedPlatformAccount entity
   */
  static createAccountFromVerification(input: VerifiedChannelMeta): ConnectedPlatformAccount {
    const now = new Date().toISOString();
    return {
      id: `conn_${input.platform}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      platform: input.platform.toLowerCase(),
      username: input.username,
      displayName: input.displayName,
      avatar: input.avatar || "",
      channelUrl: input.channelUrl,
      stableChannelId: input.stableChannelId || "",
      followersCount: input.followersCount || 0,
      verified: input.verified ?? true,
      monitoringEnabled: true,
      isDefault: false,
      connectedAt: now,
      lastVerifiedAt: now,
      // Persist platform-specific stable identifiers resolved at verification time
      kickMetadata: input.kickMetadata,
    };
  }

  /**
   * Adds a new platform connection to the list while preventing duplicates (One per platform per user)
   */
  static addPlatform(
    existingAccounts: ConnectedPlatformAccount[],
    input: AddPlatformInput
  ): ConnectedPlatformAccount[] {
    const platformLower = input.platform.toLowerCase();
    
    // Prevent duplicate connection of the same platform
    const duplicate = existingAccounts.find((a) => a.platform.toLowerCase() === platformLower);
    if (duplicate) {
      throw new Error(`A ${input.platform} account (@${duplicate.username}) is already connected. Disconnect it first to link a new channel.`);
    }

    const now = new Date().toISOString();
    const isFirstAccount = existingAccounts.length === 0;

    const newAccount: ConnectedPlatformAccount = {
      id: `conn_${platformLower}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      platform: platformLower,
      username: input.username,
      displayName: input.displayName,
      avatar: input.avatar || "",
      channelUrl: input.channelUrl,
      stableChannelId: input.stableChannelId || "",
      followersCount: input.followersCount || 0,
      verified: input.verified ?? true,
      monitoringEnabled: input.monitoringEnabled ?? true,
      isDefault: input.isDefault ?? isFirstAccount, // Auto-set default if first
      connectedAt: now,
      lastVerifiedAt: now,
      kickMetadata: (input as any).kickMetadata,
    };

    return [...existingAccounts, newAccount];
  }

  /**
   * Removes a connected platform account by ID or platform name
   */
  static removePlatform(
    existingAccounts: ConnectedPlatformAccount[],
    platformOrId: string
  ): ConnectedPlatformAccount[] {
    const targetLower = platformOrId.toLowerCase();
    const filtered = existingAccounts.filter(
      (a) => a.id !== platformOrId && a.platform.toLowerCase() !== targetLower
    );

    // If we removed the default account, set the next available as default
    const removedAccountWasDefault = existingAccounts.some(
      (a) => (a.id === platformOrId || a.platform.toLowerCase() === targetLower) && a.isDefault
    );

    if (removedAccountWasDefault && filtered.length > 0) {
      filtered[0].isDefault = true;
    }

    return filtered;
  }

  /**
   * Sets a specific platform account as the default primary account
   */
  static setDefaultPlatform(
    existingAccounts: ConnectedPlatformAccount[],
    targetIdOrPlatform: string
  ): ConnectedPlatformAccount[] {
    const targetLower = targetIdOrPlatform.toLowerCase();
    return existingAccounts.map((account) => {
      const isTarget = account.id === targetIdOrPlatform || account.platform.toLowerCase() === targetLower;
      return {
        ...account,
        isDefault: isTarget,
      };
    });
  }

  /**
   * Toggles or sets monitoringEnabled status for a connected platform
   */
  static setMonitoringEnabled(
    existingAccounts: ConnectedPlatformAccount[],
    targetIdOrPlatform: string,
    enabled: boolean
  ): ConnectedPlatformAccount[] {
    const targetLower = targetIdOrPlatform.toLowerCase();
    return existingAccounts.map((account) => {
      if (account.id === targetIdOrPlatform || account.platform.toLowerCase() === targetLower) {
        return { ...account, monitoringEnabled: enabled };
      }
      return account;
    });
  }

  /**
   * Updates verification timestamp & refreshed metadata for an existing platform
   */
  static updateVerification(
    existingAccounts: ConnectedPlatformAccount[],
    targetIdOrPlatform: string,
    updates: Partial<ConnectedPlatformAccount>
  ): ConnectedPlatformAccount[] {
    const targetLower = targetIdOrPlatform.toLowerCase();
    const now = new Date().toISOString();

    return existingAccounts.map((account) => {
      if (account.id === targetIdOrPlatform || account.platform.toLowerCase() === targetLower) {
        return {
          ...account,
          ...updates,
          lastVerifiedAt: now,
        };
      }
      return account;
    });
  }

  /**
   * Returns the primary default connected platform account
   */
  static getDefaultAccount(accounts: ConnectedPlatformAccount[]): ConnectedPlatformAccount | null {
    if (accounts.length === 0) return null;
    return accounts.find((a) => a.isDefault) || accounts[0];
  }

  /**
   * Returns all connected platform accounts where monitoring is enabled
   */
  static getMonitoredAccounts(accounts: ConnectedPlatformAccount[]): ConnectedPlatformAccount[] {
    return accounts.filter((a) => a.monitoringEnabled && a.verified);
  }
}
