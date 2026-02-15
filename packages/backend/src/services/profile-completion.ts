/**
 * Profile Completion Calculation Service
 *
 * Calculates profile completion percentage based on filled fields
 * following the equal-weight formula: completedCount / 7 * 100
 */

export interface ProfileCompletionItem {
  field: string;
  label: string;
  completed: boolean;
}

export interface ProfileCompletion {
  percentage: number;
  items: ProfileCompletionItem[];
  completedCount: number;
  totalCount: number;
}

interface ProfileData {
  dateOfBirth: Date | null;
  phoneNumber: string | null;
  aboutMe: string | null;
  spanishLevel: string | null;
  preferredClassTypes: string | null; // JSON string
  learningGoals: string | null;
  availabilityNotes: string | null;
}

/**
 * Checks if a field value is considered "filled"
 * Empty strings, null, undefined, and empty arrays (when parsed) are unfilled
 */
function isFieldFilled(value: any): boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return false;

    // For JSON strings (preferredClassTypes), check if array is empty
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length === 0) return false;
    } catch {
      // Not JSON, continue with regular string check
    }

    return true;
  }

  if (Array.isArray(value) && value.length === 0) return false;

  return true;
}

/**
 * Calculate profile completion for a student user
 *
 * @param user User object with profile fields
 * @returns ProfileCompletion object with percentage and detailed breakdown
 */
export function calculateProfileCompletion(
  user: ProfileData
): ProfileCompletion {
  const fields: ProfileCompletionItem[] = [
    {
      field: 'dateOfBirth',
      label: 'Date of Birth',
      completed: isFieldFilled(user.dateOfBirth),
    },
    {
      field: 'phoneNumber',
      label: 'Phone Number',
      completed: isFieldFilled(user.phoneNumber),
    },
    {
      field: 'aboutMe',
      label: 'About Me',
      completed: isFieldFilled(user.aboutMe),
    },
    {
      field: 'spanishLevel',
      label: 'Spanish Level',
      completed: isFieldFilled(user.spanishLevel),
    },
    {
      field: 'preferredClassTypes',
      label: 'Preferred Class Types',
      completed: isFieldFilled(user.preferredClassTypes),
    },
    {
      field: 'learningGoals',
      label: 'Learning Goals',
      completed: isFieldFilled(user.learningGoals),
    },
    {
      field: 'availabilityNotes',
      label: 'Availability Notes',
      completed: isFieldFilled(user.availabilityNotes),
    },
  ];

  const completedItems = fields.filter((item) => item.completed);
  const completedCount = completedItems.length;
  const totalCount = fields.length; // Always 7

  // Calculate percentage: (completedCount / 7) * 100
  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    percentage,
    items: fields,
    completedCount,
    totalCount,
  };
}
