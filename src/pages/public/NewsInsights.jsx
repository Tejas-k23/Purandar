import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import SeoManager from '../../components/common/SeoManager';
import blogService from '../../services/blogService';
import './NewsInsights.css';

function BlogCard({ blog }) {
  return (
    <article className="ni-card">
      <Link to={`/news-insights/${blog.slug}`} className="ni-card-image-link">
        <img src={blog.featuredImage || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'} alt={blog.title} className="ni-card-image" loading="lazy" />
      </Link>
      <div className="ni-card-body">
        <div className="ni-card-meta">
          <span className="ni-chip">{blog.category || 'Insights'}</span>
          <span className="ni-card-date"><CalendarDays size={14} /> {new Date(blog.publishDate || blog.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
        <h2 className="ni-card-title"><Link to={`/news-insights/${blog.slug}`}>{blog.title}</Link></h2>
        <p className="ni-card-copy">{blog.shortDescription}</p>
        <Link to={`/news-insights/${blog.slug}`} className="ni-read-link">Read article</Link>
      </div>
    </article>
  );
}

export default function NewsInsights() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await blogService.getAll({ ...filters, page, limit: 6 });
        if (!active) return;
        const payload = response.data.data;
        setCategories(payload.categories || []);
        setPagination(payload.pagination || null);
        setBlogs((current) => (page === 1 ? payload.items || [] : [...current, ...(payload.items || [])]));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [filters, page]);

  const canLoadMore = useMemo(() => pagination && pagination.page < pagination.totalPages, [pagination]);

  return (
    <div className="ni-page">
      <SeoManager title="News & Insights | Purandar Prime Properties" description="Read Purandar Prime Properties news, investment guides, and local real estate insights." canonicalPath="/news-insights" />
      <section className="ni-hero">
        <div>
          <p className="ni-eyebrow">News & Insights</p>
          <h1 className="ni-title"><span className="heading-accent">Fresh</span> real estate thinking for Purandar, Pune, and beyond.</h1>
          <p className="ni-subtitle">Search practical market updates, investment ideas, and development insights without disturbing the rest of the site experience.</p>
        </div>
      </section>

      <section className="ni-toolbar">
        <label className="ni-search">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search articles"
            value={filters.search}
            onChange={(event) => {
              setPage(1);
              setBlogs([]);
              setFilters((current) => ({ ...current, search: event.target.value }));
            }}
          />
        </label>
        <select
          className="ni-select"
          value={filters.category}
          onChange={(event) => {
            setPage(1);
            setBlogs([]);
            setFilters((current) => ({ ...current, category: event.target.value }));
          }}
        >
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </section>

      {loading && page === 1 ? <Loader label="Loading news and insights..." /> : null}

      <section className="ni-grid">
        {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
      </section>

      {canLoadMore ? (
        <div className="ni-load-wrap">
          <button type="button" className="ni-load-btn" disabled={loading} onClick={() => setPage((current) => current + 1)}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
