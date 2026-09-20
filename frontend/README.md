# DarshanSetu — React Migration

The supplied static HTML/CSS prototype is migrated into Vite + React.

## Run
npm install
npm run dev

## Structure
- `src/pages/` — React page components converted from supplied HTML
- `src/styles/` — supplied CSS
- `public/assets/` — supplied images/assets
- `src/App.jsx` — React Router routes

The two inline JavaScript behaviours in the supplied archive were converted to React click handlers.

The archive referenced `live-crowd.html`, `virtual-darshan.html`, `services.html`, `login.html`, `emergency.html`, and `parking.html`, but those source files were not included, so those routes use placeholders.
