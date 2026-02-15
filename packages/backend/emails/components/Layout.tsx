import { Html, Head, Body, Container, Section, Hr, Text, Link } from "@react-email/components";
import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
  locale?: "en" | "sr" | "es";
}

const footerText = {
  en: {
    copyright: "© 2026 Spanish Class Platform. All rights reserved.",
    unsubscribe: "If you no longer wish to receive these emails, you can",
    unsubscribeLink: "unsubscribe here",
  },
  sr: {
    copyright: "© 2026 Platforma za Španski. Sva prava zadržana.",
    unsubscribe: "Ako više ne želite da primate ove imejlove, možete se",
    unsubscribeLink: "odjaviti ovde",
  },
  es: {
    copyright: "© 2026 Plataforma de Clase de Español. Todos los derechos reservados.",
    unsubscribe: "Si ya no deseas recibir estos correos, puedes",
    unsubscribeLink: "darte de baja aquí",
  },
};

export default function Layout({ children, locale = "en" }: LayoutProps) {
  const footer = footerText[locale];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>{children}</Section>
          <Hr style={hr} />
          <Section style={footerSection}>
            <Text style={footerText}>{footer.copyright}</Text>
            <Text style={footerText}>
              {footer.unsubscribe}{" "}
              <Link href="#" style={link}>
                {footer.unsubscribeLink}
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const content = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerSection = {
  padding: "0 48px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
};

const link = {
  color: "#556cd6",
  textDecoration: "underline",
};
