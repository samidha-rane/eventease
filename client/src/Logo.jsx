import { Link } from "react-router-dom";

// Ticket-with-a-spark mark + wordmark. Text color follows the parent (currentColor).
export default function Logo({ size = 40 }) {
  return (
    <Link to="/" className="ee-logo" aria-label="EventEase home">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M8 6H40a4 4 0 0 1 4 4V19a5 5 0 0 0 0 10V38a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V29a5 5 0 0 0 0-10V10a4 4 0 0 1 4-4Z"
          fill="#F5A524"
        />
        <path
          d="M24 13C25 20 28 23 35 24C28 25 25 28 24 35C23 28 20 25 13 24C20 23 23 20 24 13Z"
          fill="#1E1B3A"
        />
      </svg>
      <span className="ee-logo__word">
        <span>Event</span>
        <b>Ease</b>
      </span>
    </Link>
  );
}