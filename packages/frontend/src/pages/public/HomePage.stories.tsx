/**
 * HomePage stories — Elite Education public landing page.
 *
 * The page is static marketing content (no data fetching), so stories only
 * provide the i18n + router context it needs. Five sections render from i18n
 * keys with no server state:
 *   1. Hero            — cinematic video/image background, headline + two CTAs.
 *   2. ValueIntro      — about pitch + mission quote, links to /about.
 *   3. Services (bento)— asymmetric showcase: one lead tile (s01, with 2–3
 *                        highlights) + two small tiles (s02/s03) + a wide
 *                        banner (s04). Every tile deep-links to
 *                        /services#s01…#s04; section id="services-preview" is
 *                        the hero ghost-CTA scroll target.
 *   4. HowItWorksTeaser— 4-step methodology row, links to /about.
 *   5. FinalCTA        — burgundy closing band, links to /contact.
 * Visual screenshots are captured in docs/redesign/evidence/land-005/.
 */
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { HomePage } from "@/pages/public/HomePage";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>{children}</MemoryRouter>
    </I18nextProvider>
  );
}

const meta: Meta<typeof HomePage> = {
  title: "Pages/Public/HomePage",
  component: HomePage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Elite Education public landing page. Cinematic hero (video/image with " +
          "left gradient), headline, and two CTAs. Below-fold sections: ValueIntro " +
          "(about + mission), Services bento showcase (lead tile + two small tiles + " +
          "wide banner, deep-linking to /services#s01…#s04), How-It-Works teaser " +
          "(4-step row → /about), Final CTA (burgundy → /contact). " +
          "All text from i18n keys (en/sr/es). Semantic tokens throughout; no raw colors.",
      },
    },
  },
  decorators: [(Story) => <Wrapper><Story /></Wrapper>],
};

export default meta;
type Story = StoryObj<typeof HomePage>;

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: "responsive" },
    docs: {
      description: {
        story:
          "Full landing page at desktop width (1280px+). Services bento is a 3-column " +
          "grid: lead tile s01 spans 2×2, s02/s03 stack in column 3, s04 is a full-width " +
          "banner row. How-It-Works teaser is a 4-column step row.",
      },
    },
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Landing page at 390px. Hero content stacks; CTAs wrap. Services bento " +
          "collapses to a single column (lead tile first, then s02, s03, s04 banner). " +
          "How-It-Works steps stack single-column. No horizontal scroll.",
      },
    },
  },
};

export const Tablet: Story = {
  globals: { viewport: { value: "tablet" } },
  parameters: {
    viewport: { defaultViewport: "tablet" },
    docs: {
      description: {
        story:
          "Landing page at 768px. Services bento uses a 2-column grid (lead tile and " +
          "s04 banner span both columns; s02/s03 sit side by side). How-It-Works steps " +
          "form a 2×2 grid. Hero CTAs appear side by side.",
      },
    },
  },
};
