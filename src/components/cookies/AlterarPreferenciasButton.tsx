"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  clearStoredConsent,
} from "@/lib/cookieConsent";
import { trackConsentAudit } from "@/lib/consentAudit";

export default function AlterarPreferenciasButton() {
  const router = useRouter();

  const handleClick = () => {
    clearStoredConsent();
    trackConsentAudit({
      action: "revoked_preferences",
      consent: null,
      occurredAt: Date.now(),
      source: "cookies-page",
    });
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT));
    router.push("/?cookies=preferencias");
  };

  return (
    <Button type="button" variant="outline" onClick={handleClick}>
      Alterar preferências de cookies
    </Button>
  );
}

