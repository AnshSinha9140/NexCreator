export interface CachedMessageEntry {
  id: string;
  author: string;
  timestamp: number;
}

export interface MessageCacheStats {
  messagesRetrieved: number;
  uniqueMessages: number;
  duplicatesRemoved: number;
  duplicatePct: number;
}

export class YouTubeMessageCache {
  private cache: Map<string, CachedMessageEntry> = new Map();
  private maxCapacity: number;

  private messagesRetrievedCount: number = 0;
  private uniqueMessagesCount: number = 0;
  private duplicatesRemovedCount: number = 0;

  constructor(maxCapacity: number = 5000) {
    this.maxCapacity = maxCapacity;
  }

  /**
   * Checks whether a message ID has already been seen in this session
   */
  public isDuplicate(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Evaluates message for deduplication. Returns true if NEW, false if DUPLICATE.
   */
  public evaluateAndAdd(id: string, author: string, timestamp?: string | Date): boolean {
    this.messagesRetrievedCount++;

    if (this.cache.has(id)) {
      this.duplicatesRemovedCount++;
      return false; // Duplicate
    }

    this.uniqueMessagesCount++;
    const ts = timestamp ? new Date(timestamp).getTime() : Date.now();

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxCapacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(id, { id, author, timestamp: ts });
    return true; // Unique
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats(): MessageCacheStats {
    const totalProcessed = this.uniqueMessagesCount + this.duplicatesRemovedCount;
    const duplicatePct =
      totalProcessed > 0
        ? Number(((this.duplicatesRemovedCount / totalProcessed) * 100).toFixed(2))
        : 0;

    return {
      messagesRetrieved: this.messagesRetrievedCount,
      uniqueMessages: this.uniqueMessagesCount,
      duplicatesRemoved: this.duplicatesRemovedCount,
      duplicatePct,
    };
  }
}
