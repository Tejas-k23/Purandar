import React, { useEffect, useMemo, useState } from 'react';
import './FAQSection.css';

function upsertJsonLd(id, json) {
  const existing = document.head.querySelector(`script[data-faq-schema="${id}"]`);
  const script = existing || document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-faq-schema', id);
  script.text = json;
  if (!existing) {
    document.head.appendChild(script);
  }
}

export default function FAQSection({
  title = 'FAQs about Plots in Purandar',
  faqs = [],
  initialVisibleCount = 5,
  schemaId = 'purandar-faq',
}) {
  const [expanded, setExpanded] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const visibleFaqs = useMemo(() => (
    expanded ? faqs : faqs.slice(0, initialVisibleCount)
  ), [expanded, faqs, initialVisibleCount]);

  useEffect(() => {
    if (!faqs.length) return;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };
    upsertJsonLd(schemaId, JSON.stringify(schema));
    return () => {
      const existing = document.head.querySelector(`script[data-faq-schema="${schemaId}"]`);
      if (existing) existing.remove();
    };
  }, [faqs, schemaId]);

  const toggleItem = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="faq-section">
      <div className="faq-header">
        <p className="faq-kicker">Frequently Asked Questions</p>
        <h2 className="faq-title">{title}</h2>
        <p className="faq-subtitle">
          Clear answers for buyers exploring plots in Purandar, Saswad, Jejuri, and nearby growth zones.
        </p>
      </div>

      <div className="faq-list">
        {visibleFaqs.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-button-${index}`;
          return (
            <div key={item.question} className={`faq-item ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="faq-question"
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                id={buttonId}
              >
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden="true">+</span>
              </button>
              <div
                className="faq-answer"
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>

      {faqs.length > initialVisibleCount ? (
        <div className="faq-actions">
          <button
            type="button"
            className="faq-toggle-btn"
            onClick={() => {
              setExpanded((current) => !current);
              setOpenIndex(null);
            }}
          >
            {expanded ? 'Show Less' : 'Show More FAQs'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
