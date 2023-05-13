# TODO

- [ ] Set `name` in `package.json` to something.
- [ ] Write bookmarklet code in `src/bookmarklet.js`.
- [ ] Write docs in `index.md`.
- [ ] Deploy it (see below)

# Scripts

- `npm run serve` - Run server with file watching and auto refresh
- `npm run build` - Generic build
- `npm run build:github-pages` - Build for GitHub pages
- `npm run build:gitlab-pages` - Build for GitLab pages

# Deployment

## GitHub Pages

1. Rename github folder: `mv _.github .github`
2. Commit changes
3. Push changes to a GitHub repo

## GitLab Pages

1. Rename gitlab file: `mv _.gitlab-ci.yml .gitlab-ci.yml`
2. Commit changes
3. Push changes to a GitLab repo

## Other

https://www.11ty.dev/docs/deployment/#providers
