import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPrivateInvitationSchema,
  type CreatePrivateInvitationInput,
} from "@spanish-class/shared";
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
  defaultDate,
}: PrivateInvitationModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const createMutation = useCreatePrivateInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<CreatePrivateInvitationInput, "studentId">>({
    resolver: zodResolver(
      createPrivateInvitationSchema.omit({ studentId: true }),
    ),
    defaultValues: {
      title: "Private Spanish Class",
      description: "",
    },
  });

  const onSubmit = async (
    data: Omit<CreatePrivateInvitationInput, "studentId">,
  ) => {
    if (!selectedStudentId) {
      alert("Please select a student");
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
              Create Private Invitation
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create a confirmed booking for a specific student based on your
              offline agreement
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
                  Student selection is required
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time *
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
                  End Time *
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
                Class Title
              </label>
              <input
                type="text"
                {...register("title")}
                disabled={createMutation.isPending}
                placeholder="Private Spanish Class"
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
                Description (Optional)
              </label>
              <textarea
                {...register("description")}
                disabled={createMutation.isPending}
                rows={3}
                placeholder="Any specific topics or notes for this session..."
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
                    Private Invitation Details
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        This creates an auto-confirmed booking for the selected
                        student
                      </li>
                      <li>
                        The student will receive an email notification
                        immediately
                      </li>
                      <li>The slot will not be visible to other students</li>
                      <li>No acceptance required - already agreed offline</li>
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !selectedStudentId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? "Creating..." : "Create Invitation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
