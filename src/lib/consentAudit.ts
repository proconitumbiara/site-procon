"use client";

import type { CookieConsentState } from "@/lib/cookieConsent";

export type ConsentAuditAction =
  | "accepted_all"
  | "accepted_essential_only"
  | "updated_preferences"
  | "revoked_preferences";

export interface ConsentAuditEntry {
  action: ConsentAuditAction;
  consent: CookieConsentState | null;
  occurredAt: number;
  source: "banner" | "cookies-page";
}

export const CONSENT_AUDIT_STORAGE_KEY = "cookie_consent_audit";
const MAX_AUDIT_ENTRIES = 50;

export function trackConsentAudit(entry: ConsentAuditEntry): void {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(CONSENT_AUDIT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ConsentAuditEntry[]) : [];
    const safeParsed = Array.isArray(parsed) ? parsed : [];

    const nextEntries = [entry, ...safeParsed].slice(0, MAX_AUDIT_ENTRIES);
    window.localStorage.setItem(
      CONSENT_AUDIT_STORAGE_KEY,
      JSON.stringify(nextEntries),
    );
  } catch {
    // Fail silently: auditing should not block consent flow.
  }
}

