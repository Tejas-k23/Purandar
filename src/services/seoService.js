import api from './api';

export const seoService = {
  getNearby({ location, kind }) {
    return api.get('/seo/nearby', { params: { location, kind } });
  },
};

export default seoService;
