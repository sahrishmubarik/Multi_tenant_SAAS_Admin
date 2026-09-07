// Generic confirmation modal: overlay + card + title + body + Cancel/Confirm.
// The body (paragraphs) is passed as children.
export default function ConfirmDialog({
  title,
  confirmLabel,
  loadingLabel,
  loading = false,
  onCancel,
  onConfirm,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="
          w-[320px]
          rounded-xl
          border border-[var(--color-border)]
          bg-white
          p-6
          shadow-2xl
        "
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>

          {children}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              h-9
              cursor-pointer
              rounded-lg
              border border-[var(--color-border)]
              bg-white
              px-4
              text-sm
              font-medium
              text-[var(--color-text-secondary)]
              transition
              hover:bg-[var(--color-surface-alt)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              h-9
              cursor-pointer
              rounded-lg
              bg-[var(--color-danger)]
              px-4
              text-sm
              font-medium
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
