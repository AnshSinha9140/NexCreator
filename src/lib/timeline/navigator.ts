export interface TimelineSeekOptions {
  timestamp: string; // HH:MM:SS or MM:SS or ISO string
  label?: string;
  source?: string; // e.g. "Highlight Studio", "Broadcast Timeline", "Chat Archive"
  platform?: string; // "kick" | "youtube" | "twitch"
  vodUrl?: string;
  sessionId?: string;
  openVodInNewTab?: boolean;
}

export class TimelineNavigator {
  private static listeners: Set<(target: TimelineSeekOptions) => void> = new Set();
  private static lastTarget: TimelineSeekOptions | null = null;

  public static parseTimestampToSeconds(timestamp: string): number {
    if (!timestamp) return 0;
    const parts = timestamp.trim().split(":").map((p) => parseInt(p, 10));
    if (parts.some((p) => isNaN(p))) return 0;

    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 1) {
      return parts[0];
    }
    return 0;
  }

  public static formatTwitchTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    let res = "";
    if (hours > 0) res += `${hours}h`;
    if (mins > 0 || hours > 0) res += `${mins}m`;
    res += `${secs}s`;
    return res;
  }

  public static buildPlatformVodUrl(options: TimelineSeekOptions): string | null {
    const seconds = this.parseTimestampToSeconds(options.timestamp);
    const platform = (options.platform || "kick").toLowerCase();
    const vodUrl = options.vodUrl;

    if (platform === "youtube") {
      if (vodUrl) {
        const separator = vodUrl.includes("?") ? "&" : "?";
        return `${vodUrl}${separator}t=${seconds}s`;
      }
      return `https://www.youtube.com/watch?t=${seconds}s`;
    }

    if (platform === "twitch") {
      const twitchTime = this.formatTwitchTimestamp(seconds);
      if (vodUrl) {
        const separator = vodUrl.includes("?") ? "&" : "?";
        return `${vodUrl}${separator}t=${twitchTime}`;
      }
      return `https://www.twitch.tv/videos?t=${twitchTime}`;
    }

    // Default: Kick
    if (vodUrl) {
      const separator = vodUrl.includes("?") ? "&" : "?";
      return `${vodUrl}${separator}t=${seconds}s`;
    }

    return null;
  }

  public static open(options: TimelineSeekOptions): void {
    this.seek(options.timestamp, options.label, options.source, options);
  }

  public static seek(
    timestamp: string,
    label: string = "Seek Target",
    source: string = "Universal Navigation",
    extraOptions?: Partial<TimelineSeekOptions>
  ): void {
    const options: TimelineSeekOptions = {
      timestamp,
      label,
      source,
      openVodInNewTab: true,
      ...extraOptions,
    };

    this.lastTarget = options;

    console.log(`[TimelineNavigator] 🎯 Seeking to ${timestamp} (${label}) from ${source}`);

    // Build and open platform VOD in new browser tab if available
    const vodUrl = this.buildPlatformVodUrl(options);
    if (vodUrl && typeof window !== "undefined" && options.openVodInNewTab !== false) {
      try {
        window.open(vodUrl, "_blank");
      } catch (err) {
        console.warn("[TimelineNavigator] Could not open external VOD window:", err);
      }
    }

    // Emit browser CustomEvents for in-app video player & timeline integration
    if (typeof window !== "undefined") {
      const event = new CustomEvent("timelineSeek", { detail: options });
      window.dispatchEvent(event);

      const chatEvent = new CustomEvent("chatScrollToTimestamp", { detail: options });
      window.dispatchEvent(chatEvent);
    }

    // Invoke direct JS subscribers
    this.listeners.forEach((listener) => {
      try {
        listener(options);
      } catch (e) {}
    });
  }

  public static subscribe(listener: (target: TimelineSeekOptions) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static getLastTarget(): TimelineSeekOptions | null {
    return this.lastTarget;
  }
}
