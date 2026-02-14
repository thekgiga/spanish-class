import { Text, Heading, Section, Hr } from "@react-email/components";
import * as React from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { getTranslations, Locale } from "../i18n";

interface ConfirmationRequestProps {
  professorName: string;
  studentName: string;
  classTime: string;
  duration: string;
  confirmUrl: string;
  rejectUrl: string;
  expiresIn: string;
  locale?: Locale;
}

export default function ConfirmationRequest({
  professorName,
  studentName,
  classTime,
  duration,
  confirmUrl,
  rejectUrl,
  expiresIn,
  locale = "en",
}: ConfirmationRequestProps) {
  const t = getTranslations(locale).confirmationRequest;
  const common = getTranslations(locale).common;

  return (
    <Layout locale={locale}>
      <Heading style={heading}>{t.title}</Heading>
      <Text style={text}>
        {common.hello} {professorName},
      </Text>
      <Text style={text}>{t.message}</Text>

      <Section style={detailsSection}>
        <Text style={detailLabel}>{t.studentName}:</Text>
        <Text style={detailValue}>{studentName}</Text>

        <Text style={detailLabel}>{t.classTime}:</Text>
        <Text style={detailValue}>{classTime}</Text>

        <Text style={detailLabel}>{t.duration}:</Text>
        <Text style={detailValue}>{duration}</Text>
      </Section>

      <Section style={buttonSection}>
        <Button href={confirmUrl} variant="primary">
          {t.confirmButton}
        </Button>
        <Button href={rejectUrl} variant="danger">
          {t.rejectButton}
        </Button>
      </Section>

      <Section style={warningSection}>
        <Text style={warningText}>
          ⏰ {t.expiryNote}
        </Text>
        <Text style={expiryTime}>Expires in: {expiresIn}</Text>
      </Section>

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
  display: "flex",
  gap: "12px",
  justifyContent: "center",
};

const warningSection = {
  backgroundColor: "#fef3c7",
  padding: "16px",
  borderRadius: "8px",
  margin: "24px 0",
  borderLeft: "4px solid #f59e0b",
};

const warningText = {
  fontSize: "14px",
  color: "#78350f",
  marginBottom: "8px",
  lineHeight: "20px",
};

const expiryTime = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#92400e",
  marginBottom: "0",
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
