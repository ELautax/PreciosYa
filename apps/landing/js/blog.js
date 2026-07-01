/** Búsqueda en índice, JSON-LD y artículos relacionados */
(function () {
  const MANIFEST_URL = './posts.json';

  function imgWithFallback(src, fallback, alt, className) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    if (className) img.className = className;
    img.loading = 'lazy';
    img.onerror = function onErr() {
      if (fallback && img.src !== new URL(fallback, window.location.href).href) {
        img.onerror = null;
        img.src = fallback;
      }
    };
    return img;
  }

  function initBlogSearch() {
    const input = document.getElementById('blogSearch');
    const grid = document.getElementById('blogSearchGrid');
    if (!input || !grid) return;

    const sections = Array.from(grid.querySelectorAll('.blog-category'));

    input.addEventListener('input', function () {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      sections.forEach((section) => {
        let sectionVisible = 0;
        section.querySelectorAll('.blog-card').forEach((card) => {
          const hay = (card.getAttribute('data-blog-search') || '').toLowerCase();
          const show = q === '' || hay.includes(q);
          card.hidden = !show;
          if (show) {
            visible += 1;
            sectionVisible += 1;
          }
        });
        section.hidden = q !== '' && sectionVisible === 0;
      });
      const empty = document.getElementById('blogSearchEmpty');
      if (empty) empty.hidden = visible > 0 || q === '';
    });
  }

  function injectArticleJsonLd(post, canonical) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      image: canonical.replace(/\/blog\/.*$/, '/') + post.hero.replace(/^\.\.\//, ''),
      datePublished: post.datePublished,
      dateModified: post.datePublished,
      author: {
        '@type': 'Organization',
        name: 'PreciosYa',
        url: 'https://preciosya-landing.vercel.app',
      },
      publisher: {
        '@type': 'Organization',
        name: 'PreciosYa',
        logo: {
          '@type': 'ImageObject',
          url: 'https://preciosya-landing.vercel.app/assets/preciosya-logo.png',
        },
      },
      mainEntityOfPage: canonical,
      inLanguage: 'es-AR',
    });
    document.head.appendChild(script);
  }

  function renderRelatedPosts(currentSlug, posts) {
    const mount = document.getElementById('relatedPosts');
    if (!mount) return;

    const relatedSlugs = (document.body.dataset.articleRelated || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const related = relatedSlugs
      .map((slug) => posts.find((p) => p.slug === slug))
      .filter(Boolean)
      .slice(0, 3);

    if (related.length === 0) return;

    const title = document.createElement('h2');
    title.className = 'related-posts-title';
    title.textContent = 'También te puede servir';
    mount.appendChild(title);

    const list = document.createElement('div');
    list.className = 'related-posts-grid';

    related.forEach((post) => {
      const a = document.createElement('a');
      a.href = './' + post.slug + '.html';
      a.className = 'related-post-card';

      const cover = document.createElement('div');
      cover.className = 'related-post-cover blog-card-cover blog-card-cover--' + post.categoryKey;
      if (post.coverVariant) {
        cover.classList.add('blog-card-cover--' + post.coverVariant);
      }
      const img = imgWithFallback(post.cover, post.coverFallback, post.title);
      cover.appendChild(img);

      const body = document.createElement('div');
      body.className = 'related-post-body';
      const h3 = document.createElement('h3');
      h3.textContent = post.title;
      const p = document.createElement('p');
      p.textContent = post.description;
      body.appendChild(h3);
      body.appendChild(p);

      a.appendChild(cover);
      a.appendChild(body);
      list.appendChild(a);
    });

    mount.appendChild(list);
  }

  async function initArticlePage() {
    const slug = document.body.dataset.articleSlug;
    if (!slug) return;

    try {
      const res = await fetch(MANIFEST_URL);
      const data = await res.json();
      const post = data.posts.find((p) => p.slug === slug);
      if (!post) return;

      const canonical =
        document.querySelector('link[rel="canonical"]')?.href ||
        window.location.href.split('#')[0];

      injectArticleJsonLd(post, canonical);
      renderRelatedPosts(slug, data.posts);
    } catch {
      /* manifest opcional en local file:// */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initBlogSearch();
      void initArticlePage();
    });
  } else {
    initBlogSearch();
    void initArticlePage();
  }
})();
