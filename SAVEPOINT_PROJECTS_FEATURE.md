Savepoint: Projetos & Aplicações (auto)
Date: 2025-11-19T

Resumo das alterações até este ponto:
- Backend: novos endpoints para aplicações em projetos e notificações (file-backed):
  - `POST /api/projects/:projectId/applications`
  - `GET /api/projects/:projectId/applications`
  - `GET /api/notifications?userId=...`
  - `PUT /api/notifications/:id`

- Frontend:
  - `CreateProjectModal` (darker UI) adicionado em `src/components/CreateProjectModal.jsx`.
  - `ProjectDetailsModal` adicionado em `src/components/ProjectDetailsModal.jsx` para visualizar/editar e aplicar.
  - `freelancer_projects.jsx` agora usa modal de criação, lista projetos disponíveis e permite inscrição.
  - `employer_home.jsx` exibe inscrições em projetos e notificações, permitindo enviar mensagem ao candidato.
  - `src/services/api.js` estendido com `applyToProject`, `getProjectApplications`, `getNotifications`, `markNotificationRead`.

Observações:
- Este é um ponto de trabalho local. Recomendo criar um commit git com estas mudanças.
