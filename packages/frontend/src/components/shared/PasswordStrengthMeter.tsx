interface Props {
  password: string;
}

function getScore(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  return Math.min(score, 5);
}

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-teal-400", "bg-green-500"];
const TEXT_COLORS = ["text-red-600", "text-orange-500", "text-yellow-600", "text-teal-600", "text-green-600"];

export function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const score = getScore(password);
  // Map 0-5 score to 0-4 display index (score 0 = index 0 = Too weak, score 5 = index 4 = Strong)
  const displayIndex = Math.max(0, Math.min(Math.ceil(score * 4 / 5) - 1, 4));
  const filled = Math.max(1, Math.ceil(score * 4 / 5));

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= filled ? COLORS[displayIndex] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${TEXT_COLORS[displayIndex]}`}>
        {LABELS[displayIndex]}
      </p>
    </div>
  );
}
