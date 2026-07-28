import { PlatformDetector } from "./types";
import { KickPlatformDetector } from "./kickDetector";
import { YouTubePlatformDetector } from "./youtubeDetector";

const detectors: Record<string, PlatformDetector> = {
  kick: new KickPlatformDetector(),
  youtube: new YouTubePlatformDetector(),
};

/**
   Factory helper returning the detector implementation for a requested platform
 */
export function getPlatformDetector(platform: string): PlatformDetector {
  const normalized = platform.toLowerCase().trim();
  const detector = detectors[normalized];
  if (!detector) {
    throw new Error(`No Live Detection Engine implementation registered for platform '${platform}'.`);
  }
  return detector;
}
