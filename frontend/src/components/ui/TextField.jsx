// Labeled text input with an optional error message below.
export default function TextField({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-2
          block
          text-sm
          font-medium
          text-[var(--color-text-primary)]
        "
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          h-10
          w-full
          rounded-lg
          border
          border-[var(--color-border)]
          bg-white
          px-3
          text-sm
          text-[var(--color-text-primary)]
          outline-none
          transition
          placeholder:text-[var(--color-text-muted)]
          focus:border-[var(--color-primary)]
          focus:ring-2
          focus:ring-[var(--color-primary-light)]
        "
      />

      {error && (
        <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}
