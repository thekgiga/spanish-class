import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ArrowRight, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProfileCompletion } from "@spanish-class/shared";

interface ProfileCompletionCardProps {
  completion: ProfileCompletion;
}

export function ProfileCompletionCard({
  completion,
}: ProfileCompletionCardProps) {
  // Only show if profile is incomplete
  if (completion.percentage >= 100) {
    return null;
  }

  const incompleteFields =
    completion.items?.filter((item) => !item.completed) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card
        variant="elevated"
        className="overflow-hidden border-2 border-gold-300"
      >
        <CardContent className="p-0">
          <div className="p-6 bg-gradient-to-br from-gold-50 via-white to-spanish-cream-50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-200/30 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-spanish-red-100/20 to-transparent rounded-tr-full" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-navy-800" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-navy-800">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-navy-500">
                    Help your professor personalize your learning
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-navy-600">
                    {completion.completedCount} of {completion.totalCount}{" "}
                    fields completed
                  </span>
                  <span className="text-2xl font-bold text-gold-600">
                    {completion.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-gold-400 to-gold-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
              </div>

              {/* Missing Fields Preview */}
              {incompleteFields.length > 0 && (
                <div className="mb-4 p-4 bg-white/60 rounded-xl border border-gold-200">
                  <p className="text-sm font-medium text-navy-600 mb-2">
                    Next to complete:
                  </p>
                  <div className="space-y-2">
                    {incompleteFields.slice(0, 3).map((field) => (
                      <div
                        key={field.field}
                        className="flex items-center gap-2 text-sm text-navy-500"
                      >
                        <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>{field.label}</span>
                      </div>
                    ))}
                    {incompleteFields.length > 3 && (
                      <p className="text-xs text-navy-400 pl-6">
                        +{incompleteFields.length - 3} more field
                        {incompleteFields.length - 3 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-glow-gold group"
                asChild
              >
                <Link to="/dashboard/profile">
                  <span>Complete Your Profile</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {/* Motivational Text */}
              <p className="text-xs text-center text-navy-400 mt-3">
                A complete profile helps us provide better recommendations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
