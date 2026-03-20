import * as React from "react";

import { ExternalLink, MapPin } from "lucide-react";

import { companyData } from "@/lib/data/institutional-information";

type LocationProps = {
  isVisible?: boolean;
};

export default function Location({ isVisible = true }: LocationProps) {
  const rootClassName = `transition-all duration-600 delay-300 ${
    isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
  }`;

  return React.createElement(
    "div",
    { className: rootClassName },
    React.createElement(
      "h3",
      {
        className: "font-heading font-semibold text-text-primary text-lg mb-4",
      },
      "Encontre-nos",
    ),
    React.createElement(
      "div",
      { className: "space-y-6 relative" },
      companyData.units.map((unit) =>
        React.createElement(
          "div",
          {
            key: unit.name,
            className:
              "bg-bg-card border border-border-default rounded-2xl overflow-hidden",
          },
          React.createElement(
            "div",
            { className: "p-4" },
            React.createElement(
              "div",
              { className: "flex items-start gap-3 mb-2" },
              React.createElement(MapPin, {
                className: "w-5 h-5 text-primary shrink-0 mt-0.5",
              }),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "p",
                  {
                    className:
                      "font-heading font-semibold text-text-primary text-sm",
                  },
                  unit.name,
                ),
                React.createElement(
                  "p",
                  {
                    className: "text-text-muted text-xs font-body mt-1",
                  },
                  unit.address,
                ),
              ),
            ),
            React.createElement(
              "a",
              {
                href: unit.mapsLinkUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className:
                  "inline-flex items-center gap-1.5 no-underline text-primary text-xs font-heading font-semibold hover:underline absolute top-4 right-4",
              },
              "Abrir no Maps",
              React.createElement(ExternalLink, {
                className: "w-3.5 h-3.5 ",
              }),
            ),
          ),
          React.createElement(
            "div",
            { className: "relative w-full aspect-16/10 bg-bg-base" },
            React.createElement("iframe", {
              title: `Mapa ${unit.name}`,
              src: unit.mapsEmbedUrl,
              width: "100%",
              height: "100%",
              style: { border: 0 },
              allowFullScreen: true,
              loading: "lazy",
              referrerPolicy: "no-referrer-when-downgrade",
              className: "absolute inset-0 w-full h-full",
            }),
          ),
        ),
      ),
    ),
  );
}
