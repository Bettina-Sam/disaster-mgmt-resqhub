# DisasterMgmt (MERN)

Full-stack disaster management demo:
- MongoDB + Express + Node (backend)
- React + Leaflet + Socket.IO (frontend)
- Auth with JWT (ADMIN / RESPONDER / USER)
- Realtime incident feed, map, filters, counters
- Critical alerts (beep + desktop notification)
- CSV export

## 1) Run locally

### Prereqs
- Node 18+ (you have Node 20)
- MongoDB Atlas URI

### Backend
```bash
cd server
cp .env.example .env   # or create .env
# .env:
# PORT=5000
# MONGO_URI=<your Atlas connection string>
# JWT_SECRET=supersecret123
npm i
npm run dev
