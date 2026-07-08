export function TypingIndicator() {
  return (
    <li className="bubble bubble-concierge">
      <span className="visually-hidden">Your concierge is typing</span>
      <span className="typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </li>
  );
}
