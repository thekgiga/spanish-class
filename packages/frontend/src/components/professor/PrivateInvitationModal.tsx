import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { CreatePrivateInvitationInput } from "@spanish-class/shared";
import { useCreatePrivateInvitation } from "../../hooks/usePrivateInvitations";
import { StudentSelector } from "./StudentSelector";

interface PrivateInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
}

// T018: PrivateInvitationModal component
export function PrivateInvitationModal({
  isOpen,
  onClose,
  // @ts-expect-error - defaultDate used for future feature
  defaultDate,
}: PrivateInvitationModalProps) {
  const { t } = useTranslation("professor");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const createMutation = useCreatePrivateInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<CreatePrivateInvitationInput, "studentId">>({
    resolver: zodResolver(
      z.object({
        startTime: z.string(),
        endTime: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
    ),
    defaultValues: {
      title: t("private_invitation.default_title"),
      description: "",
    },
  });

  const onSubmit = async (
    data: Omit<CreatePrivateInvitationInput, "studentId">,
  ) => {
    if (!selectedStudentId) {
      alert(t("private_invitation.select_student_error"));
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...data,
        studentId: selectedStudentId,
      });

      // Reset and close on success
      reset();
      setSelectedStudentId("");
      onClose();
    } catch (error) {
      // Error is already shown via toast in the hook
      // Keep modal open so user can adjust the time
    }
  };

  const handleClose = () => {
    reset();
    setSelectedStudentId("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("private_invitation.modal_title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t("private_invitation.modal_description")}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-4 space-y-6"
          >
            {/* Student Selection */}
            <div>
              <StudentSelector
                value={selectedStudentId}
                onChange={setSelectedStudentId}
                disabled={createMutation.isPending}
              />
              {!selectedStudentId && (
                <p className="mt-1 text-sm text-red-600">
                  {t("private_invitation.student_required")}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("private_invitation.start_time_label")}
                </label>
                <input
                  type="datetime-local"
                  {...register("startTime")}
                  disabled={createMutation.isPending}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("private_invitation.end_time_label")}
                </label>
                <input
                  type="datetime-local"
                  {...register("endTime")}
                  disabled={createMutation.isPending}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("private_invitation.class_title_label")}
              </label>
              <input
                type="text"
                {...register("title")}
                disabled={createMutation.isPending}
                placeholder={t("private_invitation.class_title_placeholder")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("private_invitation.description_label")}
              </label>
              <textarea
                {...register("description")}
                disabled={createMutation.isPending}
                rows={3}
                placeholder={t("private_invitation.description_placeholder")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {t("private_invitation.info_title")}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t("private_invitation.info_1")}</li>
                      <li>{t("private_invitation.info_2")}</li>
                      <li>{t("private_invitation.info_3")}</li>
                      <li>{t("private_invitation.info_4")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {t("common:actions.cancel")}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !selectedStudentId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending
                  ? t("private_invitation.creating")
                  : t("private_invitation.create_button")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
