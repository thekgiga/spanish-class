export const en = {
  common: {
    hello: "Hello",
    thanks: "Thank you",
    regards: "Best regards",
    team: "Spanish Class Platform Team",
  },
  confirmationRequest: {
    subject: "New Booking Request - Action Required",
    title: "New Class Booking Request",
    message: "A student has requested to book your class. Please confirm or reject this request within 48 hours.",
    studentName: "Student",
    classTime: "Class Time",
    duration: "Duration",
    confirmButton: "Confirm Booking",
    rejectButton: "Reject Booking",
    expiryNote: "This request will expire automatically if not acted upon within 48 hours.",
  },
  pendingConfirmation: {
    subject: "Booking Request Submitted",
    title: "Your Booking Request is Pending",
    message: "We've sent your booking request to the professor. They have 48 hours to confirm or reject it.",
    classTime: "Requested Class Time",
    professorName: "Professor",
    nextSteps: "What happens next?",
    step1: "The professor will review your request",
    step2: "You'll receive an email once they confirm or reject",
    step3: "If not confirmed within 48 hours, the request will expire",
  },
  bookingConfirmed: {
    subject: "Class Booking Confirmed",
    title: "Your Class is Confirmed!",
    message: "Good news! Your professor has confirmed your class booking.",
    classTime: "Class Time",
    professorName: "Professor",
    meetLink: "Join Class",
    addToCalendar: "Add to Calendar",
    price: "Price",
  },
  bookingRejected: {
    subject: "Booking Request Declined",
    title: "Booking Request Declined",
    message: "Unfortunately, your professor is unable to accept your booking request at this time.",
    reason: "Reason",
    browseSlots: "Browse Available Slots",
    contactSupport: "If you have questions, please contact support.",
  },
};

export type EmailTranslations = typeof en;

  // Add translated email subjects and content for SR/ES versions
  bookingReminder: {
    subject: "Reminder: Class Tomorrow",
    title: "Class Reminder",
    message: "This is a friendly reminder about your upcoming class.",
  },
