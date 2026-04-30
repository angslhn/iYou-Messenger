export default function SubmitButton({
  label,
  mt,
  is_loading,
  handleClick,
}: {
  label: string;
  mt: number;
  is_loading: boolean;
  handleClick?: () => void;
}) {
  return (
    <button
      type="submit"
      disabled={is_loading}
      onClick={handleClick}
      style={{ marginTop: `${mt * 0.25}rem` }}
      className="h-12 flex justify-center items-center w-full rounded-xl border-none outline-none font-bold text-[1.1rem] bg-platinum/85 text-night hover:cursor-pointer"
    >
      {is_loading ? (
        <svg
          className="animate-spin h-7 w-7"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        label
      )}
    </button>
  );
}
