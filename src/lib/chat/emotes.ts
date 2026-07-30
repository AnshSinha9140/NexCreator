import { ChatEmoteToken } from "./types";

export type EmoteProvider = "kick" | "youtube" | "twitch" | "bttv" | "ffz" | "7tv";

export interface EmoteProviderParser {
  provider: EmoteProvider;
  parse(rawText: string): ChatEmoteToken[];
  format(rawText: string): string;
}

const KICK_EMOTE_REGEX = /\[emote:(\d+):([a-zA-Z0-9_]+)\]/g;

/**
 * Extensible Platform Emote Provider for Kick, YouTube, Twitch, BTTV, FFZ & 7TV
 */
export class KickEmoteProvider implements EmoteProviderParser {
  public readonly provider: EmoteProvider = "kick";

  public parse(rawText: string): ChatEmoteToken[] {
    if (!rawText) return [];
    const emotes: ChatEmoteToken[] = [];
    KICK_EMOTE_REGEX.lastIndex = 0;
    let match;

    while ((match = KICK_EMOTE_REGEX.exec(rawText)) !== null) {
      const id = match[1];
      const name = match[2];
      emotes.push({
        type: "emote",
        id,
        name,
        imageUrl: id ? `https://files.kick.com/emotes/${id}/fullsize` : undefined,
        platform: "kick",
      });
    }

    return emotes;
  }

  public format(rawText: string): string {
    if (!rawText) return "";
    return rawText.replace(KICK_EMOTE_REGEX, ":$2:");
  }
}

export class EmoteParser {
  private static providers: EmoteProviderParser[] = [new KickEmoteProvider()];

  /**
   * Registers new third-party emote providers (e.g. BTTV, 7TV, FFZ, YouTube, Twitch)
   */
  public static registerProvider(provider: EmoteProviderParser): void {
    this.providers.push(provider);
  }

  /**
   * Parses platform emotes across registered providers
   */
  public static parseEmotes(rawText: string, platform: string): ChatEmoteToken[] {
    if (!rawText) return [];
    const emotes: ChatEmoteToken[] = [];

    for (const provider of this.providers) {
      if (provider.provider === platform || platform === "auto" || rawText.includes("[emote:")) {
        emotes.push(...provider.parse(rawText));
      }
    }

    return emotes;
  }

  /**
   * Formats raw emote syntax into readable placeholders :EMOTE:
   */
  public static formatEmoteText(rawText: string): string {
    if (!rawText) return "";
    let formatted = rawText;
    for (const provider of this.providers) {
      formatted = provider.format(formatted);
    }
    return formatted;
  }
}
