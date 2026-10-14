# SleekBoard Client

React + Vite front end for SleekBoard. Talks to the Express API in SleekBoard_Server.

## Getting started

```
cp .env.example .env
npm install
npm run dev
```

Vite serves on http://localhost:5173. `VITE_API_URL` points at the API, the analytics dashboard on the home page runs on sample data until the API endpoints exist.

## Layout

```
src/
  main.jsx         mounts the app
  App.jsx          routes
  index.css        tailwind + global styles
  assets/brand/    SleekBoard logo SVGs (white and Sleek Gray)
  components/      Layout, Sidebar, Header, dashboard cards, charts
  pages/           one file per route
  services/        axios instance and the api calls built on it
```
