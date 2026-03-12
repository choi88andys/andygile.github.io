# andygile.com

Company website for Andygile — crafting apps for the Apple ecosystem.

## Apps

- **ShalloWeDive** — Freediving companion for Apple Watch & iPhone
- **Memories** — Preserve and relive your most meaningful moments

## Development

```bash
# Local preview
python3 -m http.server 8080
# Open http://localhost:8080
```

## Adding a Blog Post

1. Write a `.md` file in `blog/posts/`
2. Add an entry to `blog/posts/index.json`:

```json
{
  "slug": "your-post-slug",
  "title": "Your Post Title",
  "date": "2026-01-01",
  "excerpt": "Short summary of the post.",
  "tags": ["Swift", "iOS"]
}
```

3. Commit and push.

## Image Assets

Place app images in:

- `assets/images/shallowedive/` — icon.png (512x512), screenshot-*.png, og-image.png (1200x630)
- `assets/images/memories/` — icon.png, screenshot-*.png, og-image.png
