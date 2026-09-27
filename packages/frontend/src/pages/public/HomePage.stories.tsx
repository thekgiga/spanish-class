/**
 * HomePage stories — Elite Education public landing page.
 *
 * The page is static marketing content (no data fetching), so stories only
 * provide the i18n + router context it needs. All 11 sections (Hero, About,
 * Founder, Services, Approach, How We Work, Why Us, Elite Guide Teaser,
 * FAQ, Final CTA) render from i18n keys with no server state.
 * Visual screenshots are captured in docs/redesign/evidence/land-001/.
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
          "Elite Education public landing page. Burgundy hero with logo card, Playfair Display " +
          "headline, and two CTAs. Below-fold sections: About, Founder, Services (4 cards), " +
          "Approach, How We Work, Why Us (burgundy), Elite Guide Teaser, FAQ accordion, Final CTA. " +
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
          "Full landing page at desktop width (1280px+). Sections stack vertically. " +
          "Services grid uses 2-column layout; Founder uses flex row; FAQ uses 3-column grid.",
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
          "Landing page at 390px. Hero stacks logo card + title + CTAs vertically. " +
          "Services grid collapses to single column; Founder portrait above bio text.",
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
          "Landing page at 768px. Most sections switch from single-column to two-column. " +
          "CTAs appear side-by-side in the hero.",
      },
    },
  },
};
