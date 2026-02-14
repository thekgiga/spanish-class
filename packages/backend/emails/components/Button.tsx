import { Button as EmailButton } from "@react-email/components";
import * as React from "react";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

export default function Button({ href, children, variant = "primary" }: ButtonProps) {
  const buttonStyle = {
    ...baseButton,
    ...(variant === "primary" ? primaryButton : variant === "danger" ? dangerButton : secondaryButton),
  };

  return (
    <EmailButton href={href} style={buttonStyle}>
      {children}
    </EmailButton>
  );
}

const baseButton = {
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 20px",
  borderRadius: "6px",
  margin: "16px 0",
};

const primaryButton = {
  backgroundColor: "#556cd6",
  color: "#ffffff",
};

const secondaryButton = {
  backgroundColor: "#6b7280",
  color: "#ffffff",
};

const dangerButton = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
};
