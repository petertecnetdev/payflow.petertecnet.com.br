import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://payflow.petertecnet.com.br';
const HOME_TITLE = 'Peter PayFlow | Vendas, atendimento e cobranças';
const HOME_DESCRIPTION = 'Organize vendas, oportunidades, propostas e cobranças com o Peter PayFlow, uma solução da Peter Tecnet.';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const isHome = path === '/';
    const title = isHome ? HOME_TITLE : 'Peter PayFlow';
    const description = HOME_DESCRIPTION;
    const url = `${SITE_URL}${path === '/' ? '/' : path}`;

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: isHome ? 'index, follow, max-image-preview:large' : 'noindex, nofollow' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertCanonical(url);
  }, [location.pathname]);

  return null;
}
