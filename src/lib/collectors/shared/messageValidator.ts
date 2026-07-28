import { LiveChatMessage } from "@/lib/ingestion/types";

export class MessageValidator {
  public static isValid(msg: Partial<LiveChatMessage>): boolean {
    if (!msg) return false;
    if (!msg.id || typeof msg.id !== "string" || msg.id.trim().length === 0) return false;
    if (!msg.sessionId || typeof msg.sessionId !== "string") return false;
    if (!msg.platform || typeof msg.platform !== "string") return false;
    if (!msg.timestamp || !(msg.timestamp instanceof Date || typeof msg.timestamp === "string")) return false;
    if (!msg.author || !msg.author.displayName) return false;
    if (typeof msg.message !== "string") return false;
    return true;
  }
}
