export const companyContact = {
  name: import.meta.env.VITE_COMPANY_CONTACT_NAME || 'Purandar Properties',
  phone: import.meta.env.VITE_COMPANY_CONTACT_PHONE || '',
  email: import.meta.env.VITE_COMPANY_CONTACT_EMAIL || '',
};

export const hasCompanyContact = Boolean(
  companyContact.name || companyContact.phone || companyContact.email,
);

export default companyContact;
