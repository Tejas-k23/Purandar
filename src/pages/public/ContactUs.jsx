import React, { useState } from 'react';
import FAQSection from '../../components/common/FAQSection';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const faqs = [
    {
      question: 'Is Purandar a good place to buy plots?',
      answer: 'Yes. Plots in Purandar are gaining demand thanks to the upcoming Purandar Airport and improving road connectivity to Pune, making it a strong long-term investment market.',
    },
    {
      question: 'What makes land near Saswad attractive for investment?',
      answer: 'Land near Saswad benefits from its proximity to Pune, civic amenities, and access to the Saswad–Hadapsar corridor, which supports steady demand for residential plots.',
    },
    {
      question: 'How will the Purandar airport impact plot prices?',
      answer: 'The Purandar airport investment story is expected to lift land values in surrounding villages as infrastructure, logistics, and housing demand improve.',
    },
    {
      question: 'Is the Hadapsar Saswad metro route relevant to plot buyers?',
      answer: 'Yes. The Hadapsar Saswad metro proposal improves commuter confidence and can raise demand for plots in Purandar due to faster access to Pune.',
    },
    {
      question: 'What is the benefit of the Purandar IT park for land buyers?',
      answer: 'The Purandar IT park narrative supports long-term job creation, which can raise housing demand and boost land appreciation in nearby zones.',
    },
    {
      question: 'Are plots near Jejuri a good option?',
      answer: 'Plots near Jejuri benefit from pilgrimage-driven tourism and improving highways, making them attractive for both investment and weekend homes.',
    },
    {
      question: 'Is land near Purandar Fort suitable for buyers?',
      answer: 'Land near Purandar Fort is popular for scenic value and tourism potential. Verify access roads, zoning, and clear titles before buying.',
    },
    {
      question: 'What are the latest price trends for plots in Purandar?',
      answer: 'Price trends in Purandar vary by village and road access. Areas close to Saswad, Dive, and Jejuri typically see higher demand and gradual appreciation.',
    },
    {
      question: 'Should I choose NA plots or agricultural land in Purandar?',
      answer: 'NA plots offer faster construction approvals, while agricultural land can be cheaper but requires conversion. Choose based on timeline and intended use.',
    },
    {
      question: 'How do I verify plot legality in Purandar?',
      answer: 'Check 7/12 extracts, mutation entries, ownership chain, and zoning. Legal verification of plots is critical to avoid future disputes.',
    },
    {
      question: 'Which are the best areas in Purandar for investment?',
      answer: 'Saswad, Dive, Narayanpur, and Jejuri are common picks due to connectivity, amenities, and access to the Pune belt.',
    },
    {
      question: 'How is connectivity from Purandar to Pune city?',
      answer: 'Connectivity to Pune city is improving via Saswad–Hadapsar and nearby state highways, making commuting and development more viable.',
    },
    {
      question: 'Are gated plot layouts available in Purandar?',
      answer: 'Yes. Several plotted developments offer gated layouts, internal roads, and basic amenities in and around Saswad and Jejuri.',
    },
    {
      question: 'What budget should I plan for plots in Purandar?',
      answer: 'Budgets vary by location, NA status, and access. It is common to see price bands depending on distance from Saswad and highway nodes.',
    },
    {
      question: 'Are weekend home plots popular near Purandar?',
      answer: 'Yes. Weekend home plots near Purandar Fort and hill zones are popular due to scenic views and short drive times from Pune.',
    },
    {
      question: 'What documents should I check before buying land near Saswad?',
      answer: 'Verify 7/12, 8A, NA order (if applicable), and approved layout. Ensure clear title and encumbrance-free status.',
    },
    {
      question: 'Is investing in plots near Jejuri good for tourism rental?',
      answer: 'Jejuri attracts steady pilgrimage traffic, so land near Jejuri can support homestays or small hospitality projects when zoning allows.',
    },
    {
      question: 'How far is Purandar from Hadapsar?',
      answer: 'Purandar is within practical driving distance from Hadapsar via the Saswad route, making it attractive for buyers seeking space near Pune.',
    },
    {
      question: 'Do plots in Purandar have clear road access?',
      answer: 'Many layouts provide internal roads, but road access varies by village. Always confirm approach roads and right-of-way.',
    },
    {
      question: 'Is the Purandar airport project confirmed?',
      answer: 'The Purandar airport project has been proposed for years and continues to influence buyer interest. Track official updates before making time-sensitive bets.',
    },
    {
      question: 'What is the resale demand for land in Purandar?',
      answer: 'Resale demand is typically stronger around Saswad, Dive, and corridor roads where amenities and access are better.',
    },
    {
      question: 'Can I build immediately on NA plots in Purandar?',
      answer: 'Yes, NA plots allow faster approvals compared to agricultural land, subject to local building rules and layout approvals.',
    },
    {
      question: 'Which plot sizes are common in Purandar?',
      answer: 'Common plot sizes include 1000–3000 sq.ft, though larger farmland parcels are also available around Jejuri and hill zones.',
    },
    {
      question: 'What makes Purandar IT park a key demand driver?',
      answer: 'The Purandar IT park narrative increases expectations of job growth, which can boost rental demand and plot appreciation.',
    },
    {
      question: 'Are there bank-loan options for plots in Purandar?',
      answer: 'Banks may fund NA plots with approved layouts. Agricultural land loans have stricter criteria, so check eligibility early.',
    },
    {
      question: 'How to evaluate land near Purandar Fort for investment?',
      answer: 'Check zoning, road access, water availability, and distance to core markets. Scenic areas carry premium pricing.',
    },
    {
      question: 'Do plots near Saswad support rental income?',
      answer: 'Plots near Saswad are closer to civic activity, which can improve rental prospects for small homes or mixed-use properties.',
    },
    {
      question: 'Is farmland in Purandar suitable for long-term holding?',
      answer: 'Yes, farmland can be a long-term play, but conversion timelines and liquidity should be considered.',
    },
    {
      question: 'What amenities should I expect in Purandar plot projects?',
      answer: 'Typical amenities include internal roads, drainage, lighting, and security in gated layouts, especially near Saswad and Jejuri.',
    },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '2rem', borderRadius: 24, background: 'linear-gradient(135deg, #eff6ff, #ecfeff)', border: '1px solid #cbd5e1' }}>
          <p style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>Contact Us</p>
          <h1 style={{ marginBottom: 12 }}>Talk to the Purandar Estate team</h1>
          <p style={{ color: '#475569', lineHeight: 1.7 }}>We help buyers, tenants, owners, and agents discover and manage verified property listings across Purandar and nearby Pune locations.</p>
          <div style={{ marginTop: '1.25rem', display: 'grid', gap: 10 }}>
            <div><strong>Phone:</strong> +91 98765 43210</div>
            <div><strong>Email:</strong> support@purandarestate.com</div>
            <div><strong>Address:</strong> Saswad, Purandar, Pune, Maharashtra</div>
          </div>
        </div>

        <div style={{ padding: '2rem', borderRadius: 24, background: '#fff', border: '1px solid #cbd5e1' }}>
          <h2 style={{ marginBottom: 12 }}>Send us a message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <input className="styled-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="styled-input" placeholder="Your email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <textarea className="styled-textarea" rows={6} placeholder="How can we help you?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
          {submitted ? <p style={{ marginTop: 12, color: '#0f766e' }}>Message sent. We will get back to you soon.</p> : null}
        </div>
      </section>

      <section style={{ padding: '2rem', borderRadius: 24, background: '#fff', border: '1px solid #cbd5e1' }}>
        <p style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>About Us</p>
        <h2 style={{ marginBottom: 12 }}>Built for practical property search and management</h2>
        <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: 12 }}>Purandar Estate is a modern real estate platform focused on helping users browse verified listings, contact sellers, save favorites, and post new properties with a clean owner workflow.</p>
        <p style={{ color: '#475569', lineHeight: 1.8 }}>Our goal is to make local discovery simpler while keeping the experience responsive, searchable, and useful for both property seekers and property owners.</p>
      </section>

      <FAQSection
        title="FAQs about Plots in Purandar"
        faqs={faqs}
        initialVisibleCount={5}
        schemaId="purandar-plots-faq"
      />
    </div>
  );
}

