/**
 * Detect if the request is from a social media crawler or bot
 * These bots need server-side rendered HTML with OG tags
 */

export const crawlerUserAgents = [
  // Facebook
  'facebookexternalhit',
  'Facebot',
  // Twitter / X
  'Twitterbot',
  'TwitterBot',
  // LinkedIn
  'LinkedInBot',
  'linkedin',
  // WhatsApp
  'WhatsApp',
  'Whatsapp',
  // Telegram
  'TelegramBot',
  'Telegram',
  // Discord
  'Discordbot',
  'Discord',
  // Slack
  'Slackbot',
  'Slack-ImgProxy',
  // Skype
  'Skype',
  // Google
  'Googlebot',
  'Googlebot-Image',
  // Bing
  'Bingbot',
  'MSNBot',
  // DuckDuckGo
  'DuckDuckBot',
  // Other crawlers
  'OpenGraph',
  'exabot',
  'ia_archiver',
  'Pinterestbot',
  'curl',
  'wget',
  'python',
  'java',
];

export const isSocialMediaCrawler = (userAgent = '') => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return crawlerUserAgents.some(bot => ua.includes(bot.toLowerCase()));
};

/**
 * Middleware to intercept crawler requests and serve OG meta tags
 * For property pages, redirect to the meta endpoint which returns proper HTML
 */
export const crawlerMetaMiddleware = (req, res, next) => {
  const userAgent = req.get('user-agent') || '';
  
  const propertyMatch = req.path.match(/^\/property\/([a-zA-Z0-9_-]+)$/);
  const projectMatch = req.path.match(/^\/projects\/([a-zA-Z0-9_-]+)$/);
  
  if (propertyMatch && isSocialMediaCrawler(userAgent)) {
    const propertyId = propertyMatch[1];
    return res.redirect(`/api/v1/meta/property/${propertyId}`);
  }

  if (projectMatch && isSocialMediaCrawler(userAgent)) {
    const projectId = projectMatch[1];
    return res.redirect(`/api/v1/meta/project/${projectId}`);
  }
  
  next();
};

export default {
  crawlerUserAgents,
  isSocialMediaCrawler,
  crawlerMetaMiddleware,
};
