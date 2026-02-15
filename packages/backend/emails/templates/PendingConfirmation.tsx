import { Text, Heading, Section, Hr } from "@react-email/components";
import * as React from "react";
import Layout from "../components/Layout";
import { getTranslations, Locale } from "../i18n";

interface PendingConfirmationProps {
  studentName: string;
  professorName: string;
  classTime: string;
  locale?: Locale;
}

export default function PendingConfirmation({
  studentName,
  professorName,
  classTime,
  locale = "en",
}: PendingConfirmationProps) {
  const t = getTranslations(locale).pendingConfirmation;
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
      </Section>

      <Section style={stepsSection}>
        <Text style={stepsHeading}>{t.nextSteps}</Text>
        <Text style={step}>✓ {t.step1}</Text>
        <Text style={step}>✓ {t.step2}</Text>
        <Text style={step}>✓ {t.step3}</Text>
      </Section>

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

const stepsSection = {
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  borderLeft: "4px solid #3b82f6",
};

const stepsHeading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e40af",
  marginBottom: "12px",
};

const step = {
  fontSize: "14px",
  color: "#1e3a8a",
  marginBottom: "8px",
  lineHeight: "20px",
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
