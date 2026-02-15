import { Text, Heading, Section, Hr } from "@react-email/components";
import * as React from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { getTranslations, Locale } from "../i18n";

interface BookingConfirmationProps {
  studentName: string;
  professorName: string;
  classTime: string;
  duration: string;
  meetLink?: string;
  price?: number;
  locale?: Locale;
}

export default function BookingConfirmation({
  studentName,
  professorName,
  classTime,
  duration,
  meetLink,
  price,
  locale = "en",
}: BookingConfirmationProps) {
  const t = getTranslations(locale).bookingConfirmed;
  const common = getTranslations(locale).common;

  return (
    <Layout locale={locale}>
      <Heading style={heading}>{t.title}</Heading>
      <Text style={text}>
        {common.hello} {studentName},
      </Text>
      <Text style={text}>{t.message}</Text>

      <Section style={detailsSection}>
        <Text style={detailLabel}>{t.professorName}:</Text>
        <Text style={detailValue}>{professorName}</Text>

        <Text style={detailLabel}>{t.classTime}:</Text>
        <Text style={detailValue}>{classTime}</Text>

        <Text style={detailLabel}>Duration:</Text>
        <Text style={detailValue}>{duration}</Text>

        {price && (
          <>
            <Text style={detailLabel}>{t.price}:</Text>
            <Text style={detailValue}>{price} RSD</Text>
          </>
        )}
      </Section>

      {meetLink && (
        <Section style={buttonSection}>
          <Button href={meetLink} variant="primary">
            {t.meetLink}
          </Button>
        </Section>
      )}

      <Hr style={hr} />
      <Text style={footer}>
        {common.thanks},
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
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  margin: "24px 0",
};

const detailLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#6b7280",
  marginBottom: "4px",
  marginTop: "12px",
};

const detailValue = {
  fontSize: "16px",
  color: "#111827",
  marginBottom: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
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
