"use client";

export type ConsentCategory = "essential" | "analytics" | "marketing" | "functional";

export interface CookieConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: number;
  version: number;
}

export interface SaveConsentInput {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 365;
export const COOKIE_CONSENT_UPDATED_EVENT = "cookie-consent-updated";

const CONSENT_CATEGORIES: ConsentCategory[] = [
  "essential",
  "analytics",
  "marketing",
  "functional",
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getDefaultConsentState(): CookieConsentState {
  return {
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
    timestamp: Date.now(),
    version: COOKIE_CONSENT_VERSION,
  };
}

function isValidConsent(raw: unknown): raw is CookieConsentState {
  if (!raw || typeof raw !== "object") return false;

  const consent = raw as Partial<CookieConsentState>;
  const hasValidBooleans = CONSENT_CATEGORIES.every(
    (category) => typeof consent[category] === "boolean",
  );

  return (
    hasValidBooleans &&
    typeof consent.timestamp === "number" &&
    Number.isFinite(consent.timestamp) &&
    typeof consent.version === "number"
  );
}

function hasConsentExpired(consent: CookieConsentState): boolean {
  return Date.now() - consent.timestamp > COOKIE_CONSENT_MAX_AGE_MS;
}

function migrateConsent(consent: CookieConsentState): CookieConsentState {
  if (consent.version >= COOKIE_CONSENT_VERSION) return consent;

  return {
    ...consent,
    essential: true,
    version: COOKIE_CONSENT_VERSION,
  };
}

export function getStoredConsent(): CookieConsentState | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidConsent(parsed)) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    const migrated = migrateConsent(parsed);
    if (hasConsentExpired(migrated)) {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      return null;
    }

    if (migrated.version !== parsed.version) {
      window.localStorage.setItem(
        COOKIE_CONSENT_STORAGE_KEY,
        JSON.stringify(migrated),
      );
    }

    return migrated;
  } catch {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    return null;
  }
}

export function saveConsent(input: SaveConsentInput): CookieConsentState {
  const state: CookieConsentState = {
    essential: true,
    analytics: input.analytics,
    marketing: input.marketing,
    functional: input.functional,
    timestamp: Date.now(),
    version: COOKIE_CONSENT_VERSION,
  };

  if (isBrowser()) {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
  }

  return state;
}

export function clearStoredConsent(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
}

export function hasAnalyticsConsent(): boolean {
  return getStoredConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return getStoredConsent()?.marketing === true;
}

export function hasOptionalConsent(): boolean {
  const consent = getStoredConsent();
  return Boolean(consent?.analytics || consent?.marketing || consent?.functional);
}

