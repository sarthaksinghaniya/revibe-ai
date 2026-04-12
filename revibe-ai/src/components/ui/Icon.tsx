type IconName = "sparkles" | "guide" | "community" | "upload" | "shield";

export function Icon({ name }: { name: IconName }) {
  const className = "h-5 w-5";
  switch (name) {
    case "sparkles":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12.8 10.8 8.6 6.6 7.4l4.2-1.2L12 2Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M19 12l.8 2.8 2.2.6-2.2.6L19 19l-.6-2.2-2.2-.6 2.2-.6L19 12Z"
            fill="currentColor"
            opacity="0.7"
          />
        </svg>
      );
    case "guide":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M6.5 4.5h9a2 2 0 0 1 2 2v12a1 1 0 0 1-1.5.86l-3.5-2.03-3.5 2.03A1 1 0 0 1 7.5 18.5v-12a2 2 0 0 1-1-2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path
            d="M9.5 8h6M9.5 11h6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
    case "community":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path
            d="M15.8 10.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.7"
          />
          <path
            d="M3.8 19.2a4.8 4.8 0 0 1 8.8 0"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M13.2 18.8c.5-1.6 1.9-2.8 3.6-2.8 1.2 0 2.3.6 3 1.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
    case "upload":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 14V4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8.5 7.5 12 4l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M5.5 14.5v4a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
    case "shield":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M12 3.5 19 6.8v6.1c0 4.1-2.7 7.5-7 8.6-4.3-1.1-7-4.5-7-8.6V6.8L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path
            d="M9.5 12.2 11.2 14l3.6-4.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      );
  }
}
