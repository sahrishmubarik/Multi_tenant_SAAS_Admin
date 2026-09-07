import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Labeled password input with a show/hide toggle and an optional error message.
export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
}) {
  const [show, setShow] = useState(false);

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

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
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
            pr-12
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

        <button
          type="button"
          onClick={() => setShow((previous) => !previous)}
          className="
            absolute
            cursor-pointer
            right-3
            top-1/2
            -translate-y-1/2
            text-sm
            text-[var(--color-text-secondary)]
            hover:text-[var(--color-primary)]
          "
        >
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}
