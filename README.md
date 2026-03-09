\# ResQHub – Disaster Management Suite



Modules: Disaster Dashboard, AcadMent (Academy), Quizzes \& Certificates, Games/Simulators, ResQVoice.



\## Monorepo

\- `client/` — frontend (React/Vite)

\- `server/` — backend (Node/Express, MongoDB)



\## Quick Start (Dev)

\### Backend

1\) `cd server`

2\) `npm install`

3\) Create `.env` with:

&nbsp;  - `PORT=5000`

&nbsp;  - `MONGODB\_URI=<your MongoDB connection string>`

&nbsp;  - `JWT\_SECRET=<any strong secret>`

&nbsp;  - `CLIENT\_URL=http://localhost:5173`

4\) `npm run dev`



\### Frontend

1\) `cd client`

2\) `npm install`

3\) Create `.env` with:

&nbsp;  - `VITE\_API\_URL=http://localhost:5000`

4\) `npm run dev`



\## Scripts

\- server: `npm run dev` (nodemon)

\- client: `npm run dev` (Vite)



\## Notes

\- Don’t commit `.env` or `node\_modules/` (handled by .gitignore).



