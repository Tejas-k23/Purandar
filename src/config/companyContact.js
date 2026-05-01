export const companyContact = {
  name: import.meta.env.VITE_COMPANY_CONTACT_NAME || 'Purandar Prime Properties',
  phone: import.meta.env.VITE_COMPANY_CONTACT_PHONE || '',
  email: import.meta.env.VITE_COMPANY_CONTACT_EMAIL || '',
  whatsapp: import.meta.env.VITE_COMPANY_WHATSAPP_NUMBER || '',
};

export const hasCompanyContact = Boolean(
  companyContact.name || companyContact.phone || companyContact.email,
);

export const hasCompanyWhatsapp = Boolean(companyContact.whatsapp || companyContact.phone);

export default companyContact;
