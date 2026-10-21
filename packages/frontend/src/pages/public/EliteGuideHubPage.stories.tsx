/**
 * EliteGuideHubPage stories — public Elite Guide content hub (/elite-guide).
 *
 * Static marketing/content page (article metadata is a bundled import, no data
 * fetching), so stories only provide the i18n + router context it needs.
 * Information architecture, top to bottom:
 *   1. Hero             — burgundy band, eyebrow + Playfair headline + subtitle.
 *   2. Start here       — single cornerstone card promoting the featured
 *                         article ("Why I started Elite Education").
 *   3. Choose your path — 3 intent shortcuts (study / language / parent-camps)
 *                         that anchor-scroll to the themed sections below.
 *   4. Themed sections  — the 12 articles grouped into 4 visitor-facing themes
 *                         (Study in Spain, Learn Spanish, Living & settling in,
 *                         Stories & experience), each with a "who it's for" line.
 *   5. Consultation CTA — burgundy closing band → /contact.
 * All text from i18n keys (en/sr/es). Semantic tokens throughout; no raw colors.
 * Visual evidence: docs/redesign/evidence/elite-guide-hub/hub-{390,768,1280,1440}.png
 */
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { EliteGuideHubPage } from "@/pages/public/EliteGuideHubPage";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>{children}</MemoryRouter>
    </I18nextProvider>
  );
}

const meta: Meta<typeof EliteGuideHubPage> = {
  title: "Pages/Public/EliteGuideHubPage",
  component: EliteGuideHubPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Elite Guide content hub, organized by visitor intent rather than internal " +
          "taxonomy: a single 'Start here' cornerstone, three 'Choose your path' shortcuts, " +
          "and four themed sections (Study in Spain, Learn Spanish, Living & settling in, " +
          "Stories & experience) each with a one-line 'who it's for'. Closes with one " +
          "consultation CTA. All text from i18n keys (en/sr/es); semantic tokens only.",
      },
    },
  },
  decorators: [(Story) => <Wrapper><Story /></Wrapper>],
};

export default meta;
type Story = StoryObj<typeof EliteGuideHubPage>;

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: "responsive" },
    docs: {
      description: {
        story:
          "Full hub at desktop width (1280px+). Path shortcuts form a 3-column row; each " +
          "themed section renders its article cards in a 3-column grid (2-article themes " +
          "leave the third column empty, which is intentional).",
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
          "Hub at 390px. Hero stacks; the cornerstone card uses tighter padding; path " +
          "shortcuts and article cards collapse to a single column. No horizontal scroll.",
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
          "Hub at 768px. Path shortcuts sit in a 3-column row; article cards use a " +
          "2-column grid within each themed section.",
      },
    },
  },
};
