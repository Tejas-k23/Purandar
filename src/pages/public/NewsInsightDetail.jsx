import React, { useEffect, useState } from 'react';
import { CalendarDays, Facebook, Link2, Linkedin, Share2, Twitter, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import SeoManager from '../../components/common/SeoManager';
import blogService from '../../services/blogService';
import './NewsInsights.css';

const shareUrls = (title, url) => ({
  twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
});

export default function NewsInsightDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await blogService.getBySlug(slug);
        if (!active) return;
        setBlog(response.data.data.blog);
        setRelated(response.data.data.related || []);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <Loader label="Loading article..." />;
  if (!blog) return <div style={{ padding: '2rem' }}>Article not found.</div>;

  const pageUrl = `${window.location.origin}/news-insights/${blog.slug}`;
  const shares = shareUrls(blog.title, pageUrl);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    image: blog.featuredImage ? [blog.featuredImage] : [],
    author: { '@type': 'Person', name: blog.author || 'Purandar Prime Properties' },
    datePublished: blog.publishDate || blog.createdAt,
    dateModified: blog.updatedAt || blog.publishDate || blog.createdAt,
    description: blog.metaDescription || blog.shortDescription,
    mainEntityOfPage: pageUrl,
  };

  return (
    <div className="ni-page">
      <SeoManager title={blog.metaTitle || blog.title} description={blog.metaDescription || blog.shortDescription} canonicalPath={`/news-insights/${blog.slug}`} schema={schema} />
      <article className="ni-detail">
        <header className="ni-detail-header">
          <p className="ni-eyebrow">{blog.category || 'News & Insights'}</p>
          <h1 className="ni-detail-title">{blog.title}</h1>
          <div className="ni-detail-meta">
            <span><UserRound size={15} /> {blog.author || 'Purandar Prime Properties'}</span>
            <span><CalendarDays size={15} /> {new Date(blog.publishDate || blog.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          <img src={blog.featuredImage || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'} alt={blog.title} className="ni-detail-image" />
        </header>

        <section className="ni-detail-content-wrap">
          <div className="ni-detail-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
          <aside className="ni-share-card">
            <h2>Share</h2>
            <div className="ni-share-actions">
              <a href={shares.twitter} target="_blank" rel="noreferrer" className="ni-share-btn"><Twitter size={16} /> Twitter</a>
              <a href={shares.facebook} target="_blank" rel="noreferrer" className="ni-share-btn"><Facebook size={16} /> Facebook</a>
              <a href={shares.linkedin} target="_blank" rel="noreferrer" className="ni-share-btn"><Linkedin size={16} /> LinkedIn</a>
              <button type="button" className="ni-share-btn" onClick={() => navigator.clipboard.writeText(pageUrl)}><Link2 size={16} /> Copy Link</button>
            </div>
          </aside>
        </section>
      </article>

      {related.length ? (
        <section className="ni-related">
          <div className="ni-related-head">
            <h2>Related Posts</h2>
            <Share2 size={16} />
          </div>
          <div className="ni-grid">
            {related.map((item) => (
              <article key={item._id} className="ni-card">
                <Link to={`/news-insights/${item.slug}`} className="ni-card-image-link">
                  <img src={item.featuredImage || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'} alt={item.title} className="ni-card-image" loading="lazy" />
                </Link>
                <div className="ni-card-body">
                  <h3 className="ni-card-title"><Link to={`/news-insights/${item.slug}`}>{item.title}</Link></h3>
                  <p className="ni-card-copy">{item.shortDescription}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
