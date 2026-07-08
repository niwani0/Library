import { useState, type FormEvent } from 'react';

import type { Identity } from '../../domain/types';
import { WhyWeAsk } from '../WhyWeAsk';

interface IdentityFormProps {
  whyWeAsk: string;
  onSubmitIdentity: (identity: Identity) => void;
}

const EMPTY_IDENTITY: Identity = {
  fullName: '',
  dateOfBirth: '',
  nationality: '',
  countryOfResidence: '',
  residentialAddress: '',
  email: '',
  phone: '',
};

export function IdentityForm({ whyWeAsk, onSubmitIdentity }: IdentityFormProps) {
  const [identity, setIdentity] = useState<Identity>(EMPTY_IDENTITY);

  const isComplete = Object.values(identity).every((value) => value.trim() !== '');

  function setField(field: keyof Identity, value: string): void {
    setIdentity((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmitIdentity(identity);
  }

  return (
    <form className="prompt-card" onSubmit={handleSubmit}>
      <h2 className="card-title">About you</h2>
      <p className="card-hint">Exactly as they appear on your ID.</p>
      <div className="field-grid">
        <div className="field field-full">
          <label htmlFor="identity-full-name">Full legal name</label>
          <input
            id="identity-full-name"
            type="text"
            autoComplete="name"
            value={identity.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="identity-dob">Date of birth</label>
          <input
            id="identity-dob"
            type="date"
            autoComplete="bday"
            value={identity.dateOfBirth}
            onChange={(event) => setField('dateOfBirth', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="identity-nationality">Nationality</label>
          <input
            id="identity-nationality"
            type="text"
            value={identity.nationality}
            onChange={(event) => setField('nationality', event.target.value)}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="identity-country">Country of residence</label>
          <input
            id="identity-country"
            type="text"
            autoComplete="country-name"
            value={identity.countryOfResidence}
            onChange={(event) => setField('countryOfResidence', event.target.value)}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="identity-address">Residential address</label>
          <textarea
            id="identity-address"
            rows={2}
            autoComplete="street-address"
            value={identity.residentialAddress}
            onChange={(event) => setField('residentialAddress', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="identity-email">Email</label>
          <input
            id="identity-email"
            type="email"
            autoComplete="email"
            value={identity.email}
            onChange={(event) => setField('email', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="identity-phone">Phone</label>
          <input
            id="identity-phone"
            type="tel"
            autoComplete="tel"
            value={identity.phone}
            onChange={(event) => setField('phone', event.target.value)}
          />
        </div>
      </div>
      <WhyWeAsk text={whyWeAsk} />
      <button type="submit" className="btn btn-primary" disabled={!isComplete}>
        Continue
      </button>
    </form>
  );
}
