# TrampOff Frontend (React + Vite)

Aplicação SPA usada pelos contratantes e freelancers. Baseada em Vite + React com roteamento e contextos personalizados.

## Registro da Sessão – 02/12/2025 (noite)

### O que foi modificado

### O que funcionou

### O que não funcionou (motivo)

### Próximos Passos Sugeridos
1. Ajustar o fallback de login (`AuthContext`/`api.js`) para validar contra hashes ou manter ambos os campos durante a transição.
2. Expor no UI o retorno detalhado do backend (campo `updatedIn`) para facilitar o diagnóstico diretamente na tela.
3. Documentar scripts de desenvolvimento (como subir backend em modo fallback) para evitar falsas falhas.


Para dúvidas ou novas demandas, abra uma issue ou descreva aqui.
Deploy targets: Vercel (recommended) or GitHub Pages.

## Vercel Setup
- Ensure backend is reachable and set `VITE_API_URL` to your backend API origin plus `/api`.
- Example env on Vercel Project Settings → Environment Variables:
	- `VITE_API_URL`: `https://backend-trampoff.onrender.com/api`
- Build & Output
	- Build Command: `npm run build`
	- Output Directory: `dist`
- Routing
	- `vercel.json` included to serve SPA and keep PWA assets at root.

## Local Dev
- Start backend: `node server.js` in `backend-trampoff`.
- Start frontend: `VITE_API_URL=http://localhost:3000/api npm run dev`.
