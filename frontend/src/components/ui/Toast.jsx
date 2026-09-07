// Fixed success toast shown top-right. Renders nothing when message is empty.
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      className="
        fixed
        right-6
        top-6
        z-50
        rounded-lg
        border
        border-[var(--color-success-border)]
        bg-[var(--color-success-bg)]
        px-5
        py-3
        text-sm
        font-medium
        text-[var(--color-success)]
        shadow-lg
      "
    >
      {message}
    </div>
  );
}
