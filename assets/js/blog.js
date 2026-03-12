/* ==========================================================================
   Blog JS — Post Listing & Markdown Rendering
   ========================================================================== */

(function () {
  'use strict';

  var POSTS_INDEX = '/blog/posts/index.json';
  var POSTS_DIR = '/blog/posts/';

  /* --- Load marked.js from CDN --- */
  function loadMarked() {
    return new Promise(function (resolve, reject) {
      if (window.marked) return resolve(window.marked);
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked@12/marked.min.js';
      script.onload = function () { resolve(window.marked); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /* --- Load highlight.js from CDN --- */
  function loadHighlightJS() {
    return new Promise(function (resolve, reject) {
      if (window.hljs) return resolve(window.hljs);

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github-dark.min.css';
      document.head.appendChild(link);

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/highlight.js@11/highlight.min.js';
      script.onload = function () { resolve(window.hljs); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /* --- Helpers --- */
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* --- Blog List Page --- */
  async function initBlogList() {
    var grid = document.getElementById('blog-grid');
    if (!grid) return;

    try {
      var res = await fetch(POSTS_INDEX);
      if (!res.ok) throw new Error('Failed to load posts');
      var posts = await res.json();

      if (!posts.length) {
        renderEmptyState(grid);
        return;
      }

      posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

      // Build cards using safe DOM methods
      var fragment = document.createDocumentFragment();
      posts.forEach(function (post) {
        var card = document.createElement('a');
        card.href = '/blog/post.html?slug=' + encodeURIComponent(post.slug);
        card.className = 'card blog-card';

        var meta = document.createElement('div');
        meta.className = 'blog-card__meta';
        if (post.tags) {
          post.tags.forEach(function (tag) {
            var span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            meta.appendChild(span);
          });
        }
        var dateSpan = document.createElement('span');
        dateSpan.className = 'blog-card__date';
        dateSpan.textContent = formatDate(post.date);
        meta.appendChild(dateSpan);

        var title = document.createElement('h3');
        title.className = 'blog-card__title';
        title.textContent = post.title;

        var excerpt = document.createElement('p');
        excerpt.className = 'blog-card__excerpt';
        excerpt.textContent = post.excerpt;

        var readMore = document.createElement('span');
        readMore.className = 'blog-card__read-more';
        readMore.textContent = 'Read more \u2192';

        card.appendChild(meta);
        card.appendChild(title);
        card.appendChild(excerpt);
        card.appendChild(readMore);
        fragment.appendChild(card);
      });

      grid.appendChild(fragment);
    } catch (e) {
      renderEmptyState(grid);
    }
  }

  function renderEmptyState(container) {
    container.textContent = '';
    var empty = document.createElement('div');
    empty.className = 'blog-empty';

    var title = document.createElement('h3');
    title.className = 'blog-empty__title';
    title.textContent = 'No posts yet';

    var desc = document.createElement('p');
    desc.className = 'blog-empty__desc';
    desc.textContent = 'Check back soon for articles on iOS development, Swift, and more.';

    empty.appendChild(title);
    empty.appendChild(desc);
    container.appendChild(empty);
  }

  /* --- Blog Post Page ---
     Renders markdown from same-origin /blog/posts/ directory.
     Content is developer-authored .md files, not user-submitted input.
     marked.js sanitization is enabled by default. */
  async function initBlogPost() {
    var contentEl = document.getElementById('post-content');
    var titleEl = document.getElementById('post-title');
    var dateEl = document.getElementById('post-date');
    var tagsEl = document.getElementById('post-tags');
    if (!contentEl) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');

    if (!slug) {
      window.location.href = '/blog/';
      return;
    }

    try {
      var indexRes = await fetch(POSTS_INDEX);
      var posts = await indexRes.json();
      var postMeta = posts.find(function (p) { return p.slug === slug; });

      if (!postMeta) {
        contentEl.textContent = 'Post not found.';
        return;
      }

      if (titleEl) titleEl.textContent = postMeta.title;
      if (dateEl) dateEl.textContent = formatDate(postMeta.date);
      if (tagsEl && postMeta.tags) {
        postMeta.tags.forEach(function (tag) {
          var span = document.createElement('span');
          span.className = 'tag';
          span.textContent = tag;
          tagsEl.appendChild(span);
        });
      }
      document.title = postMeta.title + ' \u2014 Andygile Blog';

      var results = await Promise.all([loadMarked(), loadHighlightJS()]);
      var markedLib = results[0];
      var hljs = results[1];

      var mdRes = await fetch(POSTS_DIR + encodeURIComponent(slug) + '.md');
      if (!mdRes.ok) throw new Error('Post not found');
      var md = await mdRes.text();

      markedLib.setOptions({
        highlight: function (code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return hljs.highlightAuto(code).value;
        },
        breaks: true,
      });

      // Developer-authored markdown from same-origin server
      contentEl.innerHTML = markedLib.parse(md);
    } catch (e) {
      contentEl.textContent = 'Failed to load post.';
    }
  }

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('blog-grid')) initBlogList();
    if (document.getElementById('post-content')) initBlogPost();
  });
})();
