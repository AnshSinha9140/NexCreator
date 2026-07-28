export interface ParsedYouTubeMessage {
  id: string;
  eventType: string;
  timestamp: string;
  authorChannelId: string;
  authorDisplayName: string;
  authorProfileImageUrl?: string;
  isVerified: boolean;
  isChatOwner: boolean;
  isChatSponsor: boolean;
  isChatModerator: boolean;
  messageText: string;
  userBadges: string[];
  amountDisplayString?: string;
  currency?: string;
  amountMicros?: string;
  rawPayload: any;
}

export class YouTubeMessageParser {
  public static parse(item: any): ParsedYouTubeMessage | null {
    if (!item || !item.snippet) return null;

    try {
      const id = item.id || `yt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const snippet = item.snippet;
      const authorDetails = item.authorDetails || {};
      const timestamp = snippet.publishedAt || new Date().toISOString();

      const authorChannelId = authorDetails.channelId || "unknown_author";
      const authorDisplayName = authorDetails.displayName || "YouTube User";
      const authorProfileImageUrl = authorDetails.profileImageUrl;

      const isVerified = Boolean(authorDetails.isVerified);
      const isChatOwner = Boolean(authorDetails.isChatOwner);
      const isChatSponsor = Boolean(authorDetails.isChatSponsor);
      const isChatModerator = Boolean(authorDetails.isChatModerator);

      const userBadges: string[] = [];
      if (isChatOwner) userBadges.push("Broadcaster");
      if (isChatModerator) userBadges.push("Moderator");
      if (isChatSponsor) userBadges.push("Sponsor");
      if (isVerified) userBadges.push("Verified");

      const type = snippet.type || "unknownEvent";
      let messageText = "";
      let amountDisplayString: string | undefined = undefined;
      let currency: string | undefined = undefined;
      let amountMicros: string | undefined = undefined;

      switch (type) {
        case "textMessageEvent": {
          messageText = snippet.textMessageDetails?.messageText || "";
          break;
        }

        case "superChatEvent": {
          const details = snippet.superChatDetails || {};
          amountDisplayString = details.amountDisplayString;
          currency = details.currency;
          amountMicros = details.amountMicros;
          const userComment = details.userComment || "";
          messageText = `[SuperChat ${amountDisplayString || ""}] ${userComment}`.trim();
          userBadges.push("SuperChat");
          break;
        }

        case "superStickerEvent": {
          const details = snippet.superStickerDetails || {};
          amountDisplayString = details.amountDisplayString;
          const altText = details.superStickerMetadata?.altText || "Sticker";
          messageText = `[SuperSticker ${amountDisplayString || ""}] ${altText}`.trim();
          userBadges.push("SuperSticker");
          break;
        }

        case "memberMilestoneChatEvent": {
          const details = snippet.memberMilestoneChatDetails || {};
          const months = details.memberMonth || details.userComment ? "" : "";
          const userComment = details.userComment || "";
          messageText = `[Member Milestone] ${userComment}`.trim();
          userBadges.push("Member");
          break;
        }

        case "membershipGiftingEvent": {
          const details = snippet.membershipGiftingDetails || {};
          const count = details.giftMembershipsCount || 1;
          const levelName = details.giftMembershipsLevelName || "Membership";
          messageText = `[Gifted ${count} ${levelName} subscriptions]`;
          userBadges.push("GiftSender");
          break;
        }

        case "newSponsorEvent": {
          const details = snippet.newSponsorDetails || {};
          const isUpgrade = details.isUpgrade;
          messageText = isUpgrade ? `[Upgraded Membership]` : `[Joined as a new member!]`;
          userBadges.push("NewMember");
          break;
        }

        default: {
          console.log(`[YouTubeMessageParser] Logged unknown YouTube event type '${type}'`);
          messageText = snippet.displayMessage || `[Event: ${type}]`;
          break;
        }
      }

      return {
        id,
        eventType: type,
        timestamp,
        authorChannelId,
        authorDisplayName,
        authorProfileImageUrl,
        isVerified,
        isChatOwner,
        isChatSponsor,
        isChatModerator,
        messageText,
        userBadges,
        amountDisplayString,
        currency,
        amountMicros,
        rawPayload: item,
      };
    } catch (err: any) {
      console.warn(`[YouTubeMessageParser] Failed to parse YouTube item safely:`, err.message);
      return null;
    }
  }
}
