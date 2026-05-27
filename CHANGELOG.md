# Changelog

## Unreleased
### Security & Maintenance
- Updated 50+ dependencies to latest safe minor/patch versions (React 18.3.1, Vite 5.4.21, Tailwind 3.4.19, Wagmi 2.19.5, etc.)
- Added `resolutions` block to mitigate transitive High vulnerabilities
- Reduced total vulnerabilities: **62 → 39**
- Modernized `vite.config.ts` (Rolldown compatibility, proper `build.target`, cleaned optimizeDeps)
- Added `license: MIT`, `private: true`, and proper `engines`
- Cleaned up deprecated dev dependencies

This significantly improves security and maintainability for the Hinkal Demo App.
