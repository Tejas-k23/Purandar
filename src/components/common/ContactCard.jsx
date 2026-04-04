import React from 'react';
import { Mail, Phone, UserRound } from 'lucide-react';
import { companyContact, hasCompanyContact } from '../../config/companyContact';

function resolveContact(item = {}) {
  const contactDisplayMode = item.contactDisplayMode
    || (item.useCustomContactDetails ? 'custom' : null)
    || (item.useOriginalSellerContact === false ? 'custom' : 'original');

  const original = {
    name: item.contactPersonName || item.owner?.name || item.userName || item.developerName || 'Contact',
    phone: item.phoneNumber || item.owner?.phone || '',
    email: item.email || item.owner?.email || '',
  };

  const custom = {
    name: item.customContactName || item.displaySellerName || original.name,
    phone: item.customContactPhone || item.displaySellerPhone || original.phone,
    email: item.customContactEmail || item.displaySellerEmail || original.email,
  };

  const company = {
    name: companyContact.name || original.name,
    phone: companyContact.phone || original.phone,
    email: companyContact.email || original.email,
  };

  if (contactDisplayMode === 'company' && hasCompanyContact) return company;
  if (contactDisplayMode === 'custom') return custom;
  return original;
}

export default function ContactCard({ item = {}, buttonLabel = 'Enquire Now', onAction, helperText = 'Get in touch for floor plans, pricing, and site visits.' }) {
  const contact = resolveContact(item);

  return (
    <div className="pd-contact-card">
      <h3>Contact details</h3>
      <p>{helperText}</p>
      <div className="pd-chip-list" style={{ marginBottom: 16 }}>
        <span className="pd-info-chip"><UserRound size={14} /> {contact.name || 'Not shared'}</span>
        {contact.phone ? <span className="pd-info-chip"><Phone size={14} /> {contact.phone}</span> : null}
        {contact.email ? <span className="pd-info-chip"><Mail size={14} /> {contact.email}</span> : null}
      </div>
      <button type="button" className="pd-contact-btn" onClick={onAction}>
        <Phone size={16} /> {buttonLabel}
      </button>
    </div>
  );
}

export { resolveContact };
