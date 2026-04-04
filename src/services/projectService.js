import dummyProjects from '../data/dummyProjects';

const STORAGE_KEY = 'purandar-projects';

const createId = (slug) => `project-${slug || Date.now()}`;

const slugify = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const readProjects = () => {
  if (typeof window === 'undefined') return dummyProjects;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyProjects));
    return dummyProjects;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : dummyProjects;
  } catch (_error) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyProjects));
    return dummyProjects;
  }
};

const writeProjects = (projects) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
  return projects;
};

const delay = (value) => new Promise((resolve) => {
  window.setTimeout(() => resolve(value), 160);
});

const normalizeProject = (payload) => {
  const slug = slugify(payload.slug || payload.projectName);
  const contactDisplayMode = payload.contactDisplayMode
    || (payload.useCustomContactDetails ? 'custom' : 'original');

  return {
    ...payload,
    slug,
    _id: payload._id || createId(slug),
    projectImages: payload.projectImages || [],
    visible: payload.visible ?? true,
    featuredOnHome: payload.featuredOnHome ?? false,
    contactDisplayMode,
    useCustomContactDetails: contactDisplayMode === 'custom',
    createdAt: payload.createdAt || new Date().toISOString(),
  };
};

const filterProjects = (projects, params = {}) => {
  let items = [...projects];
  if (!params.includeHidden) items = items.filter((item) => item.visible !== false);
  if (params.featuredOnHome) items = items.filter((item) => item.featuredOnHome);
  if (params.city) items = items.filter((item) => item.city?.toLowerCase().includes(params.city.toLowerCase()));
  if (params.search) {
    const query = params.search.toLowerCase();
    items = items.filter((item) => [item.projectName, item.area, item.city, item.developerName].filter(Boolean).some((field) => field.toLowerCase().includes(query)));
  }
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const projectService = {
  async getAll(params = {}) {
    const items = filterProjects(readProjects(), params);
    return delay({ data: { data: { items, pagination: null } } });
  },

  async getById(identifier) {
    const item = readProjects().find((project) => project._id === identifier || project.slug === identifier);
    if (!item) throw new Error('Project not found');
    return delay({ data: { data: item } });
  },

  async create(payload) {
    const next = normalizeProject(payload);
    const projects = readProjects();
    writeProjects([next, ...projects]);
    return delay({ data: { data: next, message: 'Project created successfully' } });
  },

  async update(projectId, payload) {
    const projects = readProjects();
    const index = projects.findIndex((item) => item._id === projectId || item.slug === projectId);
    if (index === -1) throw new Error('Project not found');
    const nextProject = normalizeProject({ ...projects[index], ...payload, _id: projects[index]._id });
    projects[index] = nextProject;
    writeProjects(projects);
    return delay({ data: { data: nextProject, message: 'Project updated successfully' } });
  },

  async remove(projectId) {
    const next = readProjects().filter((item) => item._id !== projectId && item.slug !== projectId);
    writeProjects(next);
    return delay({ data: { message: 'Project deleted successfully' } });
  },

  async toggleVisibility(projectId, visible) {
    return this.update(projectId, { visible });
  },

  async toggleFeatured(projectId, featuredOnHome) {
    return this.update(projectId, { featuredOnHome });
  },
};

export default projectService;
