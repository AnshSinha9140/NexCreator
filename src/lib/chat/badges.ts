import { ChatBadge, BadgeType } from "./types";

export class BadgeParser {
  /**
   * Normalizes raw badge names into structured ChatBadge objects
   */
  public static parseBadges(rawBadges: (string | any)[], platform: string): ChatBadge[] {
    if (!Array.isArray(rawBadges)) return [];
    const badges: ChatBadge[] = [];

    for (const item of rawBadges) {
      const rawType = (typeof item === "string" ? item : item?.type || item?.name || "").toLowerCase().trim();
      if (!rawType) continue;

      let type: BadgeType = "subscriber";
      let label = "Subscriber";
      let color = "#a855f7";

      if (rawType.includes("broadcaster") || rawType.includes("owner") || rawType.includes("streamer")) {
        type = "broadcaster";
        label = platform === "youtube" ? "Owner" : "Broadcaster";
        color = "#e11d48";
      } else if (rawType.includes("mod")) {
        type = "moderator";
        label = "Mod";
        color = "#10b981";
      } else if (rawType.includes("vip")) {
        type = "vip";
        label = "VIP";
        color = "#ec4899";
      } else if (rawType.includes("founder")) {
        type = "founder";
        label = "Founder";
        color = "#eab308";
      } else if (rawType.includes("verified")) {
        type = "verified";
        label = "Verified";
        color = "#3b82f6";
      } else if (rawType.includes("member")) {
        type = "member";
        label = "Member";
        color = "#06b6d4";
      } else if (rawType.includes("sub")) {
        type = "subscriber";
        label = "Sub";
        color = "#a855f7";
      }

      badges.push({
        type,
        label,
        color,
      });
    }

    return badges;
  }
}
