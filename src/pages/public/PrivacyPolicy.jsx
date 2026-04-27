import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `Welcome to Purandar Prime Propertys ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

By accessing or using our platform, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of our services immediately.`,
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    content: `We collect information you provide directly to us, as well as information generated automatically when you use our services.

**Personal Information:**
- Full name, email address, and phone number (when you register or contact us)
- Profile details such as your preferences and saved properties
- Property listing details you submit (title, description, photos, location, price)
- Enquiry messages you send to property sellers

**Automatically Collected Information:**
- IP address, browser type, and device information
- Pages visited, time spent on pages, and clickstream data
- Cookie identifiers and session tokens
- Location data (if you permit browser location access)`,
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: `We use the information we collect for the following purposes:

- **Account Management:** To create and manage your account, authenticate your identity, and provide personalised experiences.
- **Property Services:** To list, display, and connect buyers, renters, and sellers with relevant property listings.
- **Communication:** To send you enquiry responses, notifications about saved properties, and updates about our platform.
- **Push Notifications:** With your permission, to send browser push notifications about new listings, enquiry replies, and important updates.
- **Analytics & Improvement:** To understand how users interact with our platform and improve our services, features, and content.
- **Legal Compliance:** To comply with applicable laws, regulations, and legal processes.
- **Security:** To detect, investigate, and prevent fraudulent activity or violations of our Terms of Service.`,
  },
  {
    id: 'data-sharing',
    title: '4. How We Share Your Information',
    content: `We do not sell your personal data to third parties. We may share your information in the following limited circumstances:

- **Between Users:** Your name and contact details may be shared with interested buyers or renters when you list a property and opt into direct contact mode.
- **Service Providers:** We may share data with trusted third-party providers (e.g., cloud hosting, analytics, email delivery) who assist in operating our platform. These providers are bound by data processing agreements.
- **Firebase & Google Services:** We use Firebase for authentication, push notifications, and cloud storage. Your data is processed by Google LLC in accordance with their privacy policies.
- **Legal Requirements:** We may disclose your information if required by law, court order, or government authority.
- **Business Transfers:** In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.`,
  },
  {
    id: 'cookies',
    title: '5. Cookies & Tracking Technologies',
    content: `We use cookies and similar tracking technologies to enhance your experience on our platform.

**Types of cookies we use:**
- **Essential Cookies:** Required for the platform to function correctly (e.g., authentication tokens, session data).
- **Analytics Cookies:** Help us understand user behaviour to improve our services (e.g., page views, navigation paths).
- **Preference Cookies:** Store your settings such as active search filters or saved locations.

You can control cookie behaviour through your browser settings. Disabling essential cookies may affect the functionality of the platform. We do not use advertising or tracking cookies to serve third-party ads.`,
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide our services. Specifically:

- **Account Data:** Retained until you request account deletion.
- **Property Listings:** Retained for the duration of the listing and up to 12 months after removal for audit purposes.
- **Enquiry Messages:** Retained for 24 months to allow dispute resolution.
- **Analytics Data:** Aggregated and anonymised data may be retained indefinitely.

You may request deletion of your data at any time by contacting us at the email address below.`,
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    content: `Depending on your jurisdiction, you may have the following rights regarding your personal data:

- **Access:** Request a copy of the personal data we hold about you.
- **Correction:** Request correction of inaccurate or incomplete data.
- **Deletion:** Request deletion of your personal data ("right to be forgotten").
- **Portability:** Request your data in a structured, machine-readable format.
- **Objection:** Object to certain types of data processing, including direct marketing.
- **Withdrawal of Consent:** Where processing is based on consent, you may withdraw it at any time.

To exercise any of these rights, please contact us at **privacy@purandarprimepropertys.com**. We will respond within 30 days.`,
  },
  {
    id: 'security',
    title: '8. Data Security',
    content: `We implement industry-standard security measures to protect your personal data, including:

- HTTPS encryption for all data in transit
- Secure password hashing using bcrypt
- Strict access controls to protect stored information
- Role-based access control for admin functions
- Regular security reviews and monitoring

While we take reasonable precautions, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security and encourage you to use strong, unique passwords and to log out after each session.`,
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    content: `Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately and we will take steps to delete that information.`,
  },
  {
    id: 'third-party',
    title: '10. Third-Party Links',
    content: `Our website may contain links to third-party websites (e.g., Google Maps, external news sources). We are not responsible for the privacy practices of those websites and encourage you to review their respective privacy policies before providing any personal information.`,
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of our platform after changes constitutes your acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

**Purandar Prime Propertys**
Email: privacy@purandarprimepropertys.com
Address: Purandar, Pune District, Maharashtra, India

We aim to respond to all privacy inquiries within 5–10 business days.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="pp-page">
      {/* Hero */}
      <div className="pp-hero">
        <div className="pp-hero-inner">
          <span className="pp-badge">Legal</span>
          <h1 className="pp-title">Privacy Policy</h1>
          <p className="pp-subtitle">
            Last Updated: <strong>April 18, 2026</strong>
          </p>
          <p className="pp-intro">
            At <strong>Purandar Prime Propertys</strong>, we take your privacy seriously. This policy explains
            exactly what data we collect, why we collect it, and how you can control it.
          </p>
        </div>
      </div>

      <div className="pp-layout">
        {/* Sidebar TOC */}
        <aside className="pp-toc">
          <div className="pp-toc-card">
            <h3 className="pp-toc-title">Table of Contents</h3>
            <ul className="pp-toc-list">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="pp-toc-link">{s.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="pp-content">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="pp-section">
              <h2 className="pp-section-title">{s.title}</h2>
              <div className="pp-section-body">
                {s.content.split('\n').map((line, i) => {
                  if (line.trim() === '') return <br key={i} />;
                  // Bold lines starting with **...**
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="pp-bold-line">{line.replace(/\*\*/g, '')}</p>;
                  }
                  // Bullet lines
                  if (line.startsWith('- ')) {
                    return (
                      <p key={i} className="pp-bullet">
                        <span className="pp-bullet-dot" />
                        <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </p>
                    );
                  }
                  return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
                })}
              </div>
            </section>
          ))}

          <div className="pp-footer-note">
            <p>
              By using Purandar Prime Propertys, you acknowledge that you have read and understood this Privacy Policy.
              For any concerns, visit our <Link to="/contact" className="pp-link">Contact Us</Link> page.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
