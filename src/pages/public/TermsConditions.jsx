import React from 'react';
import { Link } from 'react-router-dom';
import './TermsConditions.css';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Purandar Prime Properties platform (the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). These Terms constitute a legally binding agreement between you and Purandar Prime Properties.
    
    If you do not agree to these Terms, you must not access or use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform following any changes signifies your acceptance of the revised Terms.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `To use our Platform, you must be at least 18 years of age and possess the legal authority to enter into a binding agreement. By using the Platform, you represent and warrant that you meet these eligibility requirements.`,
  },
  {
    id: 'use-of-platform',
    title: '3. Use of the Platform',
    content: `**User Accounts:**
    To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
    
    **Content Submission:**
    When you submit property listings, photos, or other content, you grant Purandar Prime Properties a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content for the purpose of providing our services.
    
    **Accuracy of Information:**
    You agree to provide accurate, current, and complete information when registering or listing properties. You are solely responsible for the content you post.`,
  },
  {
    id: 'listings-accuracy',
    title: '4. Property Listings & Accuracy',
    content: `Purandar Prime Properties is a marketplace platform. We do not own, inspect, or guarantee the properties listed on the Platform.
    
    **Disclaimer of Accuracy:**
    While we strive to maintain high-quality listings, we do not warrant the accuracy, completeness, or reliability of any property description, price, location, or images provided by users.
    
    **Due Diligence:**
    Users are strongly advised to conduct their own independent due diligence, including physical site visits and legal verification of property documents, before entering into any transaction.`,
  },
  {
    id: 'conduct',
    title: '5. User Conduct',
    content: `You agree NOT to use the Platform to:
    - Post false, misleading, or fraudulent property listings.
    - Harass, abuse, or harm other users.
    - Violate any local, state, or national laws.
    - Upload viruses or malicious code.
    - Scrape data or interfere with the proper working of the Platform.
    - Impersonate any person or entity, including our employees.`,
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual Property',
    content: `All content on the Platform, including logos, text, graphics, and software, is the property of Purandar Prime Properties or its content suppliers and is protected by intellectual property laws. You may not use our branding or content without prior written consent.`,
  },
  {
    id: 'limitation-of-liability',
    title: '7. Limitation of Liability',
    content: `To the maximum extent permitted by law, Purandar Prime Properties shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Platform.
    
    We are not responsible for any disputes, losses, or damages resulting from transactions or interactions between buyers, renters, and sellers on the Platform.`,
  },
  {
    id: 'indemnification',
    title: '8. Indemnification',
    content: `You agree to indemnify and hold harmless Purandar Prime Properties and its affiliates from any claims, losses, or damages arising from your violation of these Terms or your use of the Platform.`,
  },
  {
    id: 'termination',
    title: '9. Termination',
    content: `We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, without notice, for any violation of these Terms or for any other reason.`,
  },
  {
    id: 'governing-law',
    title: '10. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.`,
  },
  {
    id: 'changes',
    title: '11. Changes to Terms',
    content: `We may update these Terms from time to time. The "Last Updated" date will reflect the latest revision. Your continued use of the Platform after such changes constitutes acceptance of the new Terms.`,
  },
  {
    id: 'contact',
    title: '12. Contact Information',
    content: `If you have any questions about these Terms, please contact us at:
    
    **Purandar Prime Properties**
    Email: legal@purandarprimepropertys.com
    Address: Purandar, Pune, Maharashtra, India`,
  },
];

export default function TermsConditions() {
  return (
    <div className="tc-page">
      <div className="tc-hero">
        <div className="tc-hero-inner">
          <span className="tc-badge">Legal</span>
          <h1 className="tc-title">Terms & Conditions</h1>
          <p className="tc-subtitle">
            Last Updated: <strong>April 18, 2026</strong>
          </p>
          <p className="tc-intro">
            Please read these terms carefully before using our platform. These terms govern your 
            access to and use of <strong>Purandar Prime Properties</strong> services. Your use 
            of the platform is also governed by our <Link to="/privacy-policy" className="tc-link">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <div className="tc-layout">
        <aside className="tc-toc">
          <div className="tc-toc-card">
            <h3 className="tc-toc-title">Table of Contents</h3>
            <ul className="tc-toc-list">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="tc-toc-link">{s.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="tc-content">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="tc-section">
              <h2 className="tc-section-title">{s.title}</h2>
              <div className="tc-section-body">
                {s.content.split('\n').map((line, i) => {
                  if (line.trim() === '') return <br key={i} />;
                  if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                    return <p key={i} className="tc-bold-line">{line.trim().replace(/\*\*/g, '')}</p>;
                  }
                  if (line.trim().startsWith('- ')) {
                    return (
                      <p key={i} className="tc-bullet">
                        <span className="tc-bullet-dot" />
                        <span dangerouslySetInnerHTML={{ __html: line.trim().slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      </p>
                    );
                  }
                  return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
                })}
              </div>
            </section>
          ))}

          <div className="tc-footer-note">
            <p>
              By using Purandar Prime Properties, you acknowledge that you have read and agreed to these Terms & Conditions.
              For more information, visit our <Link to="/contact" className="tc-link">Contact Us</Link> page.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
