import { Text, Heading, Section, Hr } from "@react-email/components";
import * as React from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { getTranslations, Locale } from "../i18n";

interface BookingRejectionProps {
  studentName: string;
  professorName: string;
  classTime: string;
  reason?: string;
  browseSlotsUrl?: string;
  locale?: Locale;
}

export default function BookingRejection({
  studentName,
  professorName,
  classTime,
  reason,
  browseSlotsUrl = "https://unlimited.rs/slots",
  locale = "en",
}: BookingRejectionProps) {
  const t = getTranslations(locale).bookingRejected;
  const common = getTranslations(locale).common;

  return (
    <Layout locale={locale}>
      <Heading style={heading}>{t.title}</Heading>
      <Text style={text}>
        {common.hello} {studentName},
      </Text>
      <Text style={text}>{t.message}</Text>

      <Section style={detailsSection}>
        <Text style={detailLabel}>Professor:</Text>
        <Text style={detailValue}>{professorName}</Text>

        <Text style={detailLabel}>Requested Time:</Text>
        <Text style={detailValue}>{classTime}</Text>

        {reason && (
          <>
            <Text style={detailLabel}>{t.reason}:</Text>
            <Text style={detailValue}>{reason}</Text>
          </>
        )}
      </Section>

      <Section style={buttonSection}>
        <Button href={browseSlotsUrl} variant="primary">
          {t.browseSlots}
        </Button>
      </Section>

      <Text style={supportText}>{t.contactSupport}</Text>

      <Hr style={hr} />
      <Text style={footer}>
        {common.regards},
        <br />
        {common.team}
      </Text>
    </Layout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#333",
  marginBottom: "12px",
};

const detailsSection = {
  backgroundColor: "#fef2f2",
  padding: "16px",
  borderRadius: "8px",
  margin: "24px 0",
  borderLeft: "4px solid #dc2626",
};

const detailLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#991b1b",
  marginBottom: "4px",
  marginTop: "12px",
};

const detailValue = {
  fontSize: "16px",
  color: "#450a0a",
  marginBottom: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const supportText = {
  fontSize: "14px",
  color: "#6b7280",
  textAlign: "center" as const,
  marginTop: "16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  lineHeight: "20px",
};
