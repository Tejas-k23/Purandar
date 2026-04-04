import { useEffect } from 'react';

function upsertMeta(name, content, attribute = 'name') {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function SeoManager({
  title,
  description,
  schema,
  canonicalPath = '',
  image,
  type = 'website',
  siteName,
  twitterCard,
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title || previousTitle;

    upsertMeta('description', description || '');
    upsertMeta('og:title', title || '', 'property');
    upsertMeta('og:description', description || '', 'property');
    upsertMeta('og:type', type || 'website', 'property');
    upsertMeta('twitter:title', title || '', 'name');
    upsertMeta('twitter:description', description || '', 'name');

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const canonicalUrl = `${window.location.origin}${canonicalPath || window.location.pathname}`;
    canonicalLink.setAttribute('href', canonicalUrl);
    upsertMeta('og:url', canonicalUrl, 'property');

    if (siteName) {
      upsertMeta('og:site_name', siteName, 'property');
    }

    if (image) {
      upsertMeta('og:image', image, 'property');
      upsertMeta('twitter:image', image, 'name');
      upsertMeta('twitter:card', twitterCard || 'summary_large_image', 'name');
    } else {
      upsertMeta('twitter:card', twitterCard || 'summary', 'name');
    }

    let schemaScript = null;
    if (schema) {
      schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.text = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }

    return () => {
      document.title = previousTitle;
      if (schemaScript) schemaScript.remove();
    };
  }, [title, description, schema, canonicalPath, image, type, siteName, twitterCard]);

  return null;
}
