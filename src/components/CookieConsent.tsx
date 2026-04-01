"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  getDefaultConsentState,
  getStoredConsent,
  saveConsent,
} from "@/lib/cookieConsent";
import { trackConsentAudit } from "@/lib/consentAudit";

interface PreferenceState {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const DEFAULT_PREFERENCES: PreferenceState = {
  analytics: false,
  marketing: false,
  functional: false,
};

export default function CookieConsent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] =
    useState<PreferenceState>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const forcePreferences = searchParams.get("cookies") === "preferencias";
    const consent = getStoredConsent();

    if (!consent || forcePreferences) {
      if (consent) {
        setPreferences({
          analytics: consent.analytics,
          marketing: consent.marketing,
          functional: consent.functional,
        });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
  }, [pathname, searchParams]);

  const dispatchConsentUpdated = () => {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT));
  };

  const acceptAll = () => {
    const consent = saveConsent({
      analytics: true,
      marketing: true,
      functional: true,
    });
    trackConsentAudit({
      action: "accepted_all",
      consent,
      occurredAt: Date.now(),
      source: "banner",
    });
    dispatchConsentUpdated();
    setIsVisible(false);
  };

  const acceptEssentialOnly = () => {
    const consent = saveConsent({
      analytics: false,
      marketing: false,
      functional: false,
    });
    trackConsentAudit({
      action: "accepted_essential_only",
      consent,
      occurredAt: Date.now(),
      source: "banner",
    });
    dispatchConsentUpdated();
    setIsVisible(false);
  };

  const saveCustomPreferences = () => {
    const consent = saveConsent(preferences);
    trackConsentAudit({
      action: "updated_preferences",
      consent,
      occurredAt: Date.now(),
      source: "banner",
    });
    dispatchConsentUpdated();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-3xl rounded-xl border bg-white p-5 shadow-xl">
      <div role="dialog" aria-label="Preferências de cookies" className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Preferências de cookies</h2>
          <p className="text-muted-foreground text-sm">
            Utilizamos cookies essenciais para o funcionamento do site e cookies
            opcionais para analytics e marketing. Você pode aceitar todos, recusar
            os opcionais ou personalizar as categorias.
          </p>
          <p className="text-muted-foreground text-xs">
            Consulte nossa <Link href="/politica-de-privacidade" className="underline">Política de Privacidade</Link> e a{" "}
            <Link href="/cookies" className="underline">Política de Cookies</Link>.
          </p>
        </div>

        {isCustomizing && (
          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cookie-functional" className="text-sm">
                Cookies funcionais
              </label>
              <Checkbox
                id="cookie-functional"
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    functional: checked === true,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cookie-analytics" className="text-sm">
                Cookies de analytics (Google Analytics/GTM - futuro)
              </label>
              <Checkbox
                id="cookie-analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    analytics: checked === true,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="cookie-marketing" className="text-sm">
                Cookies de marketing (Meta Pixel - futuro)
              </label>
              <Checkbox
                id="cookie-marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    marketing: checked === true,
                  }))
                }
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Cookies essenciais permanecem sempre ativos para garantir segurança e
              registro das suas preferências.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={acceptAll}>
            Aceitar todos
          </Button>
          <Button type="button" variant="outline" onClick={acceptEssentialOnly}>
            Recusar opcionais
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsCustomizing((prev) => !prev)}
          >
            {isCustomizing ? "Fechar personalização" : "Personalizar"}
          </Button>
          {isCustomizing && (
            <Button
              type="button"
              variant="outline"
              onClick={saveCustomPreferences}
            >
              Salvar preferências
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

