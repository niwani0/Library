import { useState, type FormEvent } from 'react';

interface FreeTextInputProps {
  placeholder: string;
  variant: 'primary' | 'secondary';
  onSubmitText: (text: string) => void;
}

export function FreeTextInput({ placeholder, variant, onSubmitText }: FreeTextInputProps) {
  const [text, setText] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onSubmitText(trimmed);
    setText('');
  }

  return (
    <form className={`free-text free-text-${variant}`} onSubmit={handleSubmit}>
      <label htmlFor={`free-text-${variant}`} className="visually-hidden">
        Message your concierge
      </label>
      <input
        id={`free-text-${variant}`}
        type="text"
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => setText(event.target.value)}
      />
      <button type="submit" className="send-btn" disabled={!text.trim()} aria-label="Send">
        <span aria-hidden="true">↑</span>
      </button>
    </form>
  );
}
