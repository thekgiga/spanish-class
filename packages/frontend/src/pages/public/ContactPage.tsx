import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Send,
  CheckCircle,
  Sparkles,
  Instagram,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEOMeta } from "@/components/shared/SEOMeta";
import { PrimaryButton } from "@/components/ui/premium";
import { Badge } from "@/components/ui/badge";

export function ContactPage() {
  const { t } = useTranslation("about");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - replace with actual email service
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <SEOMeta
        title={t("contact.seo_title")}
        description={t("contact.seo_description")}
        canonical="/contact"
        keywords={[
          "contact spanish class",
          "spanish learning support",
          "customer service",
          "get in touch",
        ]}
        type="website"
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-spanish-teal-50 via-white to-spanish-coral-50">
          {/* Decorative colorful blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-teal-400 to-spanish-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-spanish-coral-400 to-spanish-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float animation-delay-2000" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-spanish-teal-100 text-spanish-teal-700 border-spanish-teal-200 px-6 py-2 text-sm font-semibold">
                <Mail className="h-4 w-4 mr-2" />
                {t("contact.badge")}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6">
                {t("contact.title")}
              </h1>
              <p className="text-xl text-slate-700 leading-relaxed">
                {t("contact.subtitle")}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-spanish-teal-200">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-16 text-center"
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-spanish-coral-500 to-spanish-coral-600 mb-6 shadow-2xl">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {t("contact.form_success_title")}
                      </h3>
                      <p className="text-slate-600">
                        {t("contact.form_success_message")}
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-slate-700 font-medium"
                          >
                            {t("contact.form_name_label")}
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder={t("contact.form_name_placeholder")}
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-white border-spanish-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-teal-500 focus:ring-spanish-teal-500/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-slate-700 font-medium"
                          >
                            {t("contact.form_email_label")}
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t("contact.form_email_placeholder")}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-white border-spanish-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-teal-500 focus:ring-spanish-teal-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="subject"
                          className="text-slate-700 font-medium"
                        >
                          {t("contact.form_subject_label")}
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder={t("contact.form_subject_placeholder")}
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="bg-white border-spanish-teal-200 text-slate-900 placeholder:text-slate-400 focus:border-spanish-teal-500 focus:ring-spanish-teal-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="message"
                          className="text-slate-700 font-medium"
                        >
                          {t("contact.form_message_label")}
                        </Label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          placeholder={t("contact.form_message_placeholder")}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          className="flex w-full rounded-lg border-2 border-spanish-teal-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spanish-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>

                      <PrimaryButton
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          t("contact.form_submitting")
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            {t("contact.form_submit")}
                            <Send className="h-5 w-5" />
                          </>
                        )}
                      </PrimaryButton>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-spanish-coral-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {t("contact.info_title")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-spanish-teal-500 to-spanish-teal-600 shadow-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          {t("contact.info_email_label")}
                        </p>
                        <a
                          href="mailto:professor@spanishclass.com"
                          className="text-spanish-teal-600 hover:text-spanish-teal-700 font-medium transition-colors"
                        >
                          professor@spanishclass.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-spanish-coral-500 to-spanish-coral-600 shadow-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          {t("contact.info_location_label")}
                        </p>
                        <p className="text-slate-900 font-medium">
                          {t("contact.info_location_value")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          {t("contact.info_instagram_label")}
                        </p>
                        <a
                          href="https://www.instagram.com/casovi_spanskog_online/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-spanish-coral-600 hover:text-spanish-coral-700 font-medium transition-colors"
                        >
                          @casovi_spanskog_online
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
