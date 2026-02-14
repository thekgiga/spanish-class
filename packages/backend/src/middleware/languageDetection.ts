import { Request, Response, NextFunction } from "express";

export type Locale = "en" | "sr" | "es";

export interface LanguageDetectionResult {
  detectedLocale: Locale;
  confidence: number;
  source: "header" | "ip" | "cloudflare" | "default";
}

/**
 * Detect user's preferred language from various sources
 */
export function detectLanguage(req: Request): LanguageDetectionResult {
  // Priority 1: Accept-Language header (highest confidence - direct user preference)
  const acceptLanguage = req.headers["accept-language"];
  if (acceptLanguage) {
    const primaryLang = acceptLanguage.split(",")[0].split("-")[0].toLowerCase();

    if (primaryLang === "sr" || primaryLang === "sr-latn" || primaryLang === "sr-cyrl") {
      return { detectedLocale: "sr", confidence: 0.95, source: "header" };
    }
    if (primaryLang === "es") {
      return { detectedLocale: "es", confidence: 0.95, source: "header" };
    }
    if (primaryLang === "en") {
      return { detectedLocale: "en", confidence: 0.95, source: "header" };
    }
  }

  // Priority 2: Cloudflare CF-IPCountry header (high confidence - IP geolocation)
  const cfCountry = req.headers["cf-ipcountry"] as string;
  if (cfCountry) {
    if (cfCountry === "RS") {
      // Serbia
      return { detectedLocale: "sr", confidence: 0.85, source: "cloudflare" };
    }
    if (["ES", "MX", "AR", "CO", "CL", "PE", "VE"].includes(cfCountry)) {
      // Spanish-speaking countries
      return { detectedLocale: "es", confidence: 0.85, source: "cloudflare" };
    }
  }

  // Priority 3: Try to detect from IP using a geolocation service (fallback)
  // This would require an external API call, so we'll skip it for now
  // and use it only if needed in production

  // Default: English
  return { detectedLocale: "en", confidence: 0.5, source: "default" };
}

/**
 * Middleware to attach detected language to request
 */
export function languageDetectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const detection = detectLanguage(req);
  (req as any).detectedLanguage = detection;
  next();
}

/**
 * Get the detected language from the request
 */
export function getDetectedLanguage(req: Request): LanguageDetectionResult {
  return (req as any).detectedLanguage || detectLanguage(req);
}
