/**
 * HomePage stories — public landing page with the paella scroll-story hero.
 *
 * The page is static marketing content (no data fetching), so stories only
 * provide the i18n + router context it needs. The scroll-scrubbed video hero
 * relies on real scroll position and IntersectionObserver-style scroll
 * progress, which Storybook's canvas does not drive — so these stories
 * document the composed page and its responsive framing rather than the
 * mid-scroll video states (those are captured as viewport screenshots in
 * docs/redesign/evidence/land-001/).
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
          "Public landing page. Dark cinematic hero with a scroll-scrubbed paella " +
          "cooking video (video.currentTime driven by scroll progress), followed by " +
          "stats, features, benefits, testimonials, and a final CTA on the Editorial " +
          "Teaching Studio semantic token system. The hero video is landscape and " +
          "full-bleed on desktop, and a square crop with a blurred slate backdrop on " +
          "mobile (<768px) so the whole pan stays visible on tall screens.",
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
          "Full landing page at desktop width. Hero shows the landscape video " +
          "(object-cover, full-bleed). Scroll the canvas to scrub the paella cooking " +
          "sequence and reveal the below-fold sections.",
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
          "Landing page at 390px. Hero uses the square video crop (object-contain) " +
          "with a blurred, dimmed poster backdrop filling the letterbox so the slate " +
          "table appears to extend past the pan. Step copy and the CTA stack " +
          "vertically instead of sitting side by side.",
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
          "Landing page at 768px — the breakpoint where the hero switches from the " +
          "mobile square crop to the desktop landscape, full-bleed treatment.",
      },
    },
  },
};
