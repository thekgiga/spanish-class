/**
 * Header stories — the public site header.
 *
 * The header has two layouts:
 *  - Default (sticky top) on every route except the landing page.
 *  - Landing (fixed top) on "/" once the visitor scrolls past the video hero;
 *    while the hero is on screen the header is not rendered at all.
 *
 * The landing behavior is driven at runtime by an IntersectionObserver on the
 * `#landing-hero-end` sentinel that HomePage renders, so it cannot be fully
 * exercised in an isolated Storybook canvas. These stories cover the default
 * top layout in both auth states; the landing reveal is captured as viewport
 * screenshots in docs/redesign/evidence/land-001/ (390/1440-04-top-header).
 */
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/stores/auth";

function Wrapper({
  route = "/contact",
  children,
}: {
  route?: string;
  children: React.ReactNode;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </I18nextProvider>
  );
}

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Public site header. Sticky at the top on standard routes; on the landing " +
          "page it is hidden during the video hero and slides down to pin at the top " +
          "once the visitor scrolls past it.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

/** Logged-out: Contact link + Login button (top sticky layout). */
export const LoggedOut: Story = {
  render: () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    return (
      <Wrapper route="/contact">
        <Header />
        <div style={{ height: "150vh" }} />
      </Wrapper>
    );
  },
};

/** Logged-in: avatar dropdown replaces the Login button (top sticky layout). */
export const LoggedIn: Story = {
  render: () => {
    useAuthStore.setState({
      isAuthenticated: true,
      // Minimal shape needed by the header (initials + menu links).
      user: {
        id: "1",
        firstName: "María",
        lastName: "García",
        email: "maria@example.com",
        isAdmin: false,
      } as ReturnType<typeof useAuthStore.getState>["user"],
    });
    return (
      <Wrapper route="/contact">
        <Header />
        <div style={{ height: "150vh" }} />
      </Wrapper>
    );
  },
};
