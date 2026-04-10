import { PersonalDetailsCard } from "./PersonalDetailsCard";
import { LearningPreferencesCard } from "./LearningPreferencesCard";
import { LearningGoalsCard } from "./LearningGoalsCard";
import { AvailabilityNotesCard } from "./AvailabilityNotesCard";

interface StudentProfileTabProps {
  student: {
    dateOfBirth?: string | null;
    phoneNumber?: string | null;
    aboutMe?: string | null;
    spanishLevel?: string | null;
    preferredClassTypes?: string[] | null;
    learningGoals?: string | null;
    availabilityNotes?: string | null;
  };
}

export function StudentProfileTab({ student }: StudentProfileTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <PersonalDetailsCard
        dateOfBirth={student.dateOfBirth}
        phoneNumber={student.phoneNumber}
        aboutMe={student.aboutMe}
      />
      <LearningPreferencesCard
        spanishLevel={student.spanishLevel}
        preferredClassTypes={student.preferredClassTypes}
      />
      <LearningGoalsCard learningGoals={student.learningGoals} />
      <AvailabilityNotesCard availabilityNotes={student.availabilityNotes} />
    </div>
  );
}
