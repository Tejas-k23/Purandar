import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FileText, ImagePlus, Tags, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import RichTextEditor from '../../components/forms/RichTextEditor';
import blogService from '../../services/blogService';
import '../public/AddProjectForm.css';
import '../public/PostPropertyForm.css';

const initialState = {
  title: '',
  slug: '',
  featuredImage: '',
  shortDescription: '',
  content: '<p></p>',
  author: '',
  category: '',
  tags: '',
  metaTitle: '',
  metaDescription: '',
  publishDate: '',
  status: 'draft',
};

const slugify = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function AdminBlogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id || id === 'new') return;
      const response = await blogService.getAdminById(id);
      const blog = response.data.data;
      setForm({
        ...blog,
        tags: (blog.tags || []).join(', '),
        publishDate: blog.publishDate ? String(blog.publishDate).slice(0, 10) : '',
      });
      setImagePreview(blog.featuredImage || '');
    };
    load();
  }, [id]);

  useEffect(() => {
    setForm((current) => current.slug === slugify(current.title) ? current : { ...current, slug: slugify(current.title) });
  }, [form.title]);

  const score = useMemo(() => {
    const fields = ['title', 'slug', 'shortDescription', 'content', 'author', 'category', 'metaTitle', 'metaDescription'];
    const filled = fields.filter((field) => String(form[field] || '').replace(/<[^>]*>/g, '').trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField('featuredImage', reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.slug.trim()) next.slug = 'Slug is required';
    if (!form.shortDescription.trim()) next.shortDescription = 'Short description is required';
    if (!String(form.content || '').replace(/<[^>]*>/g, '').trim()) next.content = 'Content is required';
    if (!form.author.trim()) next.author = 'Author is required';
    if (!form.category.trim()) next.category = 'Category is required';
    return next;
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) };
      if (id && id !== 'new') {
        await blogService.update(id, payload);
      } else {
        await blogService.create(payload);
      }
      navigate('/admin/blogs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminHeader title={id && id !== 'new' ? 'Edit Blog' : 'Add Blog'} subtitle="Create drafts, publish articles, and manage SEO metadata in one place." />
      <section className="ppf-page apf-page" style={{ padding: 0 }}>
        <div className="ppf-layout" style={{ maxWidth: 'none' }}>
          <aside className="ppf-sidebar">
            <div className="ppf-score-card">
              <div className="ppf-score-value">{score}%</div>
              <h3 className="ppf-score-title">Content readiness</h3>
            </div>
          </aside>
          <main className="ppf-main">
            <form className="ppf-form-card apf-form-card" onSubmit={submit}>
              <div className="apf-hero">
                <div>
                  <h1 className="ppf-heading"><span className="ppf-heading-icon"><FileText size={18} /></span>{id && id !== 'new' ? 'Update' : 'Create'} blog post</h1>
                  <p className="apf-hero-copy">Manage SEO-friendly blog content without breaking the existing Purandar Prime Properties visual system.</p>
                </div>
              </div>

              <div className="apf-section-card">
                <div className="ppf-form-row">
                  <div className="ppf-field">
                    <label className="ppf-field-label"><span className="ppf-field-label-icon"><FileText size={14} /></span>Title</label>
                    <input className={`ppf-input ${errors.title ? 'error' : ''}`} value={form.title} onChange={(e) => updateField('title', e.target.value)} />
                    {errors.title ? <p className="ppf-input-error">{errors.title}</p> : null}
                  </div>
                  <div className="ppf-field">
                    <label className="ppf-field-label"><span className="ppf-field-label-icon"><Tags size={14} /></span>Slug</label>
                    <input className={`ppf-input ${errors.slug ? 'error' : ''}`} value={form.slug} onChange={(e) => updateField('slug', e.target.value)} />
                    {errors.slug ? <p className="ppf-input-error">{errors.slug}</p> : null}
                  </div>
                </div>

                <div className="ppf-form-row">
                  <div className="ppf-field">
                    <label className="ppf-field-label"><span className="ppf-field-label-icon"><ImagePlus size={14} /></span>Featured Image</label>
                    <input className="ppf-input" type="file" accept="image/*" onChange={handleImage} />
                    {imagePreview ? <img src={imagePreview} alt="Preview" style={{ width: '100%', maxWidth: 320, marginTop: 12, borderRadius: 16 }} /> : null}
                  </div>
                  <div className="ppf-field">
                    <label className="ppf-field-label"><span className="ppf-field-label-icon"><CalendarDays size={14} /></span>Publish Date</label>
                    <input className="ppf-input" type="date" value={form.publishDate} onChange={(e) => updateField('publishDate', e.target.value)} />
                  </div>
                </div>

                <div className="ppf-field">
                  <label className="ppf-field-label">Short Description</label>
                  <textarea className={`ppf-textarea ${errors.shortDescription ? 'error' : ''}`} rows="4" value={form.shortDescription} onChange={(e) => updateField('shortDescription', e.target.value)} />
                  {errors.shortDescription ? <p className="ppf-input-error">{errors.shortDescription}</p> : null}
                </div>

                <div className="ppf-field">
                  <label className="ppf-field-label">Full Content</label>
                  <RichTextEditor value={form.content} onChange={(value) => updateField('content', value)} error={errors.content} />
                </div>

                <div className="ppf-form-row">
                  <div className="ppf-field">
                    <label className="ppf-field-label"><span className="ppf-field-label-icon"><UserRound size={14} /></span>Author</label>
                    <input className={`ppf-input ${errors.author ? 'error' : ''}`} value={form.author} onChange={(e) => updateField('author', e.target.value)} />
                    {errors.author ? <p className="ppf-input-error">{errors.author}</p> : null}
                  </div>
                  <div className="ppf-field">
                    <label className="ppf-field-label">Category</label>
                    <input className={`ppf-input ${errors.category ? 'error' : ''}`} value={form.category} onChange={(e) => updateField('category', e.target.value)} />
                    {errors.category ? <p className="ppf-input-error">{errors.category}</p> : null}
                  </div>
                  <div className="ppf-field">
                    <label className="ppf-field-label">Tags</label>
                    <input className="ppf-input" placeholder="Comma separated tags" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} />
                  </div>
                </div>

                <div className="ppf-form-row">
                  <div className="ppf-field">
                    <label className="ppf-field-label">Meta Title</label>
                    <input className="ppf-input" value={form.metaTitle} onChange={(e) => updateField('metaTitle', e.target.value)} />
                  </div>
                  <div className="ppf-field">
                    <label className="ppf-field-label">Meta Description</label>
                    <textarea className="ppf-textarea" rows="3" value={form.metaDescription} onChange={(e) => updateField('metaDescription', e.target.value)} />
                  </div>
                </div>

                <div className="ppf-field" style={{ maxWidth: 260 }}>
                  <label className="ppf-field-label">Status</label>
                  <select className="ppf-select" value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="ppf-nav-buttons">
                <div>
                  <button type="button" className="ppf-btn-back" onClick={() => navigate('/admin/blogs')}>Cancel</button>
                </div>
                <div>
                  <button type="submit" className="ppf-btn-submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Blog'}</button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </section>
    </div>
  );
}
