import { useState, type FormEvent } from 'react';

interface ContactFormProps {
  onSubmitContact: (email: string, phone: string) => void;
}

export function ContactForm({ onSubmitContact }: ContactFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const isComplete = email.trim() !== '' && phone.trim() !== '';

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmitContact(email.trim(), phone.trim());
  }

  return (
    <form className="prompt-card" onSubmit={handleSubmit}>
      <h2 className="card-title">How we reach you</h2>
      <div className="field-grid">
        <div className="field field-full">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="contact-phone">Mobile number</label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={!isComplete}>
        Continue
      </button>
    </form>
  );
}
