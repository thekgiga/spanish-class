# Email System - Multi-Language Support

This directory contains React Email templates with full i18n (internationalization) support for English (en), Serbian (sr), and Spanish (es).

## Directory Structure

```
emails/
├── components/          # Reusable email components
│   ├── Button.tsx       # Styled button component
│   └── Layout.tsx       # Email layout wrapper with header/footer
├── templates/           # Email templates
│   ├── BookingConfirmation.tsx
│   ├── BookingRejection.tsx
│   ├── ConfirmationRequest.tsx
│   └── PendingConfirmation.tsx
├── i18n/               # Translation files
│   ├── index.ts        # Exports getTranslations() helper
│   ├── en.ts           # English translations
│   ├── sr.ts           # Serbian translations
│   └── es.ts           # Spanish translations
└── README.md           # This file
```

## How It Works

### 1. Translation Files

Each language has its own translation file in `emails/i18n/`:

```typescript
// emails/i18n/en.ts
export const en: EmailTranslations = {
  common: {
    hello: "Hello",
    thanks: "Thank you",
    team: "Spanish Class Team"
  },
  bookingConfirmed: {
    title: "Class Confirmed!",
    message: "Your class has been confirmed",
    professorName: "Professor",
    classTime: "Class Time",
    price: "Price",
    meetLink: "Join Video Class"
  },
  // ... more email types
};
```

### 2. Using Translations in Templates

All email templates accept a `locale` prop:

```typescript
// emails/templates/BookingConfirmation.tsx
import { getTranslations, Locale } from "../i18n";

interface BookingConfirmationProps {
  studentName: string;
  professorName: string;
  classTime: string;
  duration: string;
  meetLink?: string;
  price?: number;
  locale?: Locale; // "en" | "sr" | "es"
}

export default function BookingConfirmation({
  studentName,
  professorName,
  classTime,
  duration,
  meetLink,
  price,
  locale = "en", // Default to English
}: BookingConfirmationProps) {
  const t = getTranslations(locale).bookingConfirmed;
  const common = getTranslations(locale).common;

  return (
    <Layout locale={locale}>
      <Heading>{t.title}</Heading>
      <Text>
        {common.hello} {studentName},
      </Text>
      <Text>{t.message}</Text>

      <Section>
        <Text>{t.professorName}: {professorName}</Text>
        <Text>{t.classTime}: {classTime}</Text>
        <Text>Duration: {duration}</Text>
        {price && <Text>{t.price}: {price} RSD</Text>}
      </Section>

      {meetLink && (
        <Button href={meetLink}>{t.meetLink}</Button>
      )}

      <Text>
        {common.thanks},
        <br />
        {common.team}
      </Text>
    </Layout>
  );
}
```

### 3. Getting User's Language Preference

The backend email service (`src/services/email.ts`) provides a helper function:

```typescript
import { getEmailLocale } from "../services/email.js";

// Get locale from user's languagePreference field
const locale = getEmailLocale(student.languagePreference);
// Returns: "en" | "sr" | "es" (defaults to "en" if invalid/missing)
```

### 4. Rendering Email with React Email

To use these templates in the email service:

```typescript
import { render } from "@react-email/render";
import BookingConfirmation from "../../emails/templates/BookingConfirmation";
import { getEmailLocale } from "./email.js";

// In your email function
export async function sendBookingConfirmedToStudent(data) {
  const { slot, professor, student, price } = data;

  // Get user's preferred language
  const locale = getEmailLocale(student.languagePreference);

  // Render email with locale
  const html = await render(
    BookingConfirmation({
      studentName: `${student.firstName} ${student.lastName}`,
      professorName: `${professor.firstName} ${professor.lastName}`,
      classTime: formatDateTime(slot.startTime, student.timezone),
      duration: `${Math.round((slot.endTime - slot.startTime) / 60000)} minutes`,
      meetLink: slot.meetLink,
      price,
      locale, // Pass user's language preference
    })
  );

  // Send email
  await resend.emails.send({
    from: EMAIL_FROM,
    to: student.email,
    subject: getSubject(locale), // Use translated subject
    html,
  });
}
```

## Adding New Email Types

When adding a new email type, follow these steps:

### Step 1: Add Translations

Add translation keys to all three language files:

```typescript
// emails/i18n/en.ts
export const en: EmailTranslations = {
  // ... existing translations
  newEmailType: {
    title: "Your Email Title",
    message: "Your email message",
    buttonText: "Click Here"
  }
};

// emails/i18n/sr.ts
export const sr: EmailTranslations = {
  // ... existing translations
  newEmailType: {
    title: "Vaš naslov email-a",
    message: "Vaša email poruka",
    buttonText: "Kliknite ovde"
  }
};

// emails/i18n/es.ts
export const es: EmailTranslations = {
  // ... existing translations
  newEmailType: {
    title: "Título de su correo",
    message: "Mensaje de su correo",
    buttonText: "Haga clic aquí"
  }
};
```

### Step 2: Update TypeScript Interface

Add the new email type to the `EmailTranslations` interface in `emails/i18n/en.ts`:

```typescript
export interface EmailTranslations {
  common: { ... };
  bookingConfirmed: { ... };
  // Add your new type
  newEmailType: {
    title: string;
    message: string;
    buttonText: string;
  };
}
```

### Step 3: Create Email Template

Create a new template file in `emails/templates/`:

```typescript
// emails/templates/NewEmailType.tsx
import { Text, Heading } from "@react-email/components";
import * as React from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { getTranslations, Locale } from "../i18n";

interface NewEmailTypeProps {
  recipientName: string;
  actionUrl: string;
  locale?: Locale;
}

export default function NewEmailType({
  recipientName,
  actionUrl,
  locale = "en",
}: NewEmailTypeProps) {
  const t = getTranslations(locale).newEmailType;
  const common = getTranslations(locale).common;

  return (
    <Layout locale={locale}>
      <Heading>{t.title}</Heading>
      <Text>
        {common.hello} {recipientName},
      </Text>
      <Text>{t.message}</Text>

      <Button href={actionUrl}>{t.buttonText}</Button>

      <Text>
        {common.thanks},
        <br />
        {common.team}
      </Text>
    </Layout>
  );
}
```

### Step 4: Use in Email Service

In `src/services/email.ts`:

```typescript
import { render } from "@react-email/render";
import NewEmailType from "../../emails/templates/NewEmailType";
import { getEmailLocale } from "./email.js";

export async function sendNewEmail(recipientEmail: string, recipientName: string, actionUrl: string, languagePreference?: string) {
  const locale = getEmailLocale(languagePreference);

  const html = await render(
    NewEmailType({
      recipientName,
      actionUrl,
      locale,
    })
  );

  await resend.emails.send({
    from: EMAIL_FROM,
    to: recipientEmail,
    subject: getTranslations(locale).newEmailType.title, // Use translated subject
    html,
  });
}
```

## Current Status

**Infrastructure:** ✅ Complete
- React Email templates exist with locale support
- Translation files (en/sr/es) are complete
- `getEmailLocale()` helper function available

**Implementation:** ⚠️ Partial
- Current email service (`src/services/email.ts`) uses inline HTML templates
- These inline templates do **not** support i18n
- All emails are currently sent in English only

**TODO:** Migrate email service to use React Email templates
- Replace inline HTML with `render(EmailTemplate({ ...props, locale }))`
- Use `getEmailLocale(user.languagePreference)` to determine language
- Update all 11 email sending functions

## Testing Emails Locally

To preview emails during development:

```bash
cd packages/backend
npm run email:dev
```

This starts a local email preview server at `http://localhost:3000` where you can view all email templates in all languages.

## Best Practices

1. **Always pass locale**: Include `locale` prop in all email templates
2. **Fallback to English**: Templates default to `locale="en"` if not provided
3. **Use getEmailLocale()**: Always use this helper to extract user's language
4. **Test all languages**: Preview emails in all 3 languages before deploying
5. **Keep translations in sync**: When adding new text, update all 3 language files
6. **Use common translations**: Reuse `common.*` keys for shared text (hello, thanks, team)

## Language Codes

- `en` - English (default)
- `sr` - Serbian (Српски)
- `es` - Spanish (Español)

These match the frontend i18n language codes and the database `user.languagePreference` field.
