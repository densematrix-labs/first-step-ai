# 👣 First Step AI

> Just tell me the next step. AI that cuts through overwhelm and gives you one actionable thing to do.

## Features

- Enter any task or goal
- Get exactly ONE concrete next step
- Includes duration estimate and completion criteria
- Supports 7 languages

## Tech Stack

- **Frontend:** React + Vite + TypeScript + TailwindCSS
- **Backend:** Python FastAPI
- **AI:** LLM via llm-proxy.densematrix.ai

## Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Deployment

```bash
docker-compose up -d
```

## License

MIT
