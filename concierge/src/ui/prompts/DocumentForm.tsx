import { useState, type FormEvent } from 'react';

import type { DocumentType, IdentityDocument } from '../../domain/types';
import { DOCUMENT_TYPE_LABELS } from '../labels';
import { WhyWeAsk } from '../WhyWeAsk';

interface DocumentFormProps {
  whyWeAsk: string;
  onSubmitDocument: (document: IdentityDocument) => void;
}

const DOCUMENT_TYPES: DocumentType[] = ['passport', 'driving-licence', 'national-id'];

export function DocumentForm({ whyWeAsk, onSubmitDocument }: DocumentFormProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [issuingCountry, setIssuingCountry] = useState('');

  const isComplete =
    documentNumber.trim() !== '' && expiryDate !== '' && issuingCountry.trim() !== '';

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmitDocument({
      type: documentType,
      documentNumber: documentNumber.trim(),
      expiryDate,
      issuingCountry: issuingCountry.trim(),
    });
  }

  return (
    <form className="prompt-card document-card" onSubmit={handleSubmit}>
      <p className="eyebrow">Identity document</p>
      <h2 className="card-title">Your document details</h2>
      <div className="field-grid">
        <div className="field field-full">
          <label htmlFor="document-type">Document type</label>
          <select
            id="document-type"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value as DocumentType)}
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="field field-full document-number">
          <label htmlFor="document-number">Document number</label>
          <input
            id="document-number"
            type="text"
            autoComplete="off"
            value={documentNumber}
            onChange={(event) => setDocumentNumber(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="document-expiry">Expiry date</label>
          <input
            id="document-expiry"
            type="date"
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="document-country">Issuing country</label>
          <input
            id="document-country"
            type="text"
            value={issuingCountry}
            onChange={(event) => setIssuingCountry(event.target.value)}
          />
        </div>
      </div>
      <WhyWeAsk text={whyWeAsk} />
      <button type="submit" className="btn btn-primary" disabled={!isComplete}>
        Submit document
      </button>
    </form>
  );
}
