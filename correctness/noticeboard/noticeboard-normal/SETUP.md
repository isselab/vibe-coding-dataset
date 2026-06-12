# Noticeboard — Setup

No external services needed. Everything runs locally.

## Development

```bash
cp .env.example .env        # then edit ADMIN_PASSWORD and JWT_SECRET
npm install
npm run dev                 # starts both the backend (port 3001) and Vite (port 5173)
```

Open http://localhost:5173. Click **🔒 Admin** in the toolbar to log in.

## Production

```bash
npm run build               # builds the React frontend into dist/
npm start                   # serves everything from port 3001
```

Open http://localhost:3001.

## Data

- Cards are stored in `data.json` (created automatically on first run)
- Uploaded images are stored in `uploads/` (created automatically)
- Both are gitignored — back them up if you care about the data

## Environment variables (`.env`)

| Variable         | Default  | Description                              |
|------------------|----------|------------------------------------------|
| `ADMIN_PASSWORD` | `admin`  | Password to log in as admin              |
| `JWT_SECRET`     | random   | Secret for signing tokens (set to keep tokens valid across restarts) |
| `PORT`           | `3001`   | Port the server listens on               |
