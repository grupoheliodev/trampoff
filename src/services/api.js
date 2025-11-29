
/*
  Implementação local usando localStorage.
  Objetivo: permitir rodar o app sem backend. Todos os dados serão salvos
  em localStorage sob chaves: 'trampoff_users' e 'trampoff_messages'.

  Funções exportadas mantêm a mesma API (promises) para compatibilidade.
*/

/*
  Integração opcional com backend relacional (login)
  ---
  Nota: para manter o aplicativo rodando localmente por enquanto, o código
  de integração fica comentado abaixo. Quando quiser ativar:

  1) Adicione as variáveis no `.env` (Vite):
     VITE_RELATIONAL_API_URL=https://seu-backend-relacional.example.com/api










/*
  Código de conexão com backend (ativo quando VITE_RELATIONAL_API_URL estiver definido).
  Mantemos o fallback local (localStorage) quando a variável não está presente,
  permitindo rodar o app sem backend durante desenvolvimento.
*/

const API_URL = import.meta.env.VITE_RELATIONAL_API_URL || '';

async function request(endpoint, options = {}) {
  const { method = 'GET', body = null, headers = {} } = options;

  if (!API_URL) {
    throw new Error('API_URL não definido');
  }

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errMsg = data.error || data.message || data.msg || `Erro ${response.status}`;
      const err = new Error(errMsg);
      err.status = response.status;
      throw err;
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}


const normalizeType = (t) => {
  if (!t) return 'freelancer';
  if (t === 'contratante') return 'employer';
  if (t === 'employer' || t === 'company') return 'employer';
  return t;
};

const USERS_KEY = 'trampoff_users';
const loadUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; }
};
const saveUsers = (arr) => localStorage.setItem(USERS_KEY, JSON.stringify(arr));

export const register = async (userData, userType) => {
  // If an API URL is configured, call the backend; otherwise use localStorage fallback
  if (API_URL) {
    // Map frontend userType to backend expected wording
    let endpointType = userType;
    if (userType === 'employer' || userType === 'company') endpointType = 'contratante';
    if (userType === 'freelancer') endpointType = 'freelancer';
    return request(`/register/${endpointType}`, {
      method: 'POST',
      body: userData,
    });
  }

  // simular latência (localStorage fallback)
  await sleep(150);

  const type = normalizeType(userType);
  const users = loadUsers();

  // Checar email duplicado
  const exists = users.find(u => (u.email || '').toLowerCase() === (userData.email || '').toLowerCase());
  if (exists) {
    const err = new Error('E-mail já cadastrado');
    err.status = 409;
    throw err;
  }

  const id = generateId();
  const newUser = {
    id,
    name: userData.name || userData.companyName || '',
    email: userData.email || '',
    password: userData.password || '', // Nota: armazenamento em texto para dev local apenas
    userType: type,
    createdAt: new Date().toISOString(),
    ...(userData.portfolio ? { portfolio: userData.portfolio } : {}),
    ...(userData.companyName ? { companyName: userData.companyName } : {}),
    ...(userData.description ? { description: userData.description } : {}),
  };

  users.push(newUser);
  saveUsers(users);
  // generate email confirmation code in local mode
  if (!API_URL && newUser.email) {
    const confirmations = loadEmailConfirmations();
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    const record = {
      email: newUser.email.toLowerCase(),
      code,
      confirmed: false,
      createdAt: new Date().toISOString(),
    };
    const existingIdx = confirmations.findIndex(c => c.email === record.email);
    if (existingIdx !== -1) confirmations[existingIdx] = record; else confirmations.push(record);
    saveEmailConfirmations(confirmations);
    console.info('[TrampOff] Código de confirmação de e-mail para', record.email, '=>', code);
  }
  // Dispara evento customizado para atualização instantânea em todas as abas
  try {
    window.dispatchEvent(new CustomEvent('trampoff:users-updated', { detail: { user: newUser } }));
  } catch (e) { /* ignore in non-browser envs */ }

  const token = btoa(`${newUser.email}:${Date.now()}`);
  return { token, user: { ...newUser, password: undefined } };
};

export const login = async (email, password) => {
  if (API_URL) {
    return request('/login', {
      method: 'POST',
      body: { email, password },
    });
  }
  // Local authentication (default) — permanece até integrar o backend relacional.
  await sleep(100);
  const users = loadUsers();
  const found = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase() && u.password === password);
  if (!found) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  const token = btoa(`${found.email}:${Date.now()}`);
  return { token, user: { ...found, password: undefined } };
};

export const resetPassword = async (email, newPassword) => {
  if (API_URL) {
    return request('/reset-password', {
      method: 'POST',
      body: { email, newPassword },
    });
  }

  await sleep(100);
  const users = loadUsers();
  const idx = users.findIndex(
    (u) => (u.email || '').toLowerCase() === (email || '').toLowerCase()
  );

  if (idx === -1) {
    const err = new Error('E-mail não encontrado');
    err.status = 404;
    throw err;
  }

  users[idx].password = newPassword;
  saveUsers(users);

  try {
    window.dispatchEvent(
      new CustomEvent('trampoff:users-updated', { detail: { user: users[idx] } })
    );
  } catch (e) {}

  return { success: true };
};

export const getEmailConfirmationCode = async (email) => {
  if (API_URL) {
    return request('/email/resend-confirmation', { method: 'POST', body: { email } });
  }
  await sleep(80);
  const confirmations = loadEmailConfirmations();
  const lower = (email || '').toLowerCase();
  const existing = confirmations.find(c => c.email === lower);
  if (!existing) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const record = { email: lower, code, confirmed: false, createdAt: new Date().toISOString() };
    confirmations.push(record);
    saveEmailConfirmations(confirmations);
    console.info('[TrampOff] Código de confirmação de e-mail para', record.email, '=>', code);
    return { code };
  }
  console.info('[TrampOff] Código de confirmação existente para', existing.email, '=>', existing.code);
  return { code: existing.code };
};

export const confirmEmail = async (email, code) => {
  if (API_URL) {
    return request('/email/confirm', { method: 'POST', body: { email, code } });
  }
  await sleep(80);
  const lower = (email || '').toLowerCase();
  const confirmations = loadEmailConfirmations();
  const idx = confirmations.findIndex(c => c.email === lower);
  if (idx === -1) {
    const err = new Error('Nenhum código encontrado para este e-mail.');
    err.status = 404;
    throw err;
  }
  if (String(confirmations[idx].code) !== String(code || '').trim()) {
    const err = new Error('Código de confirmação inválido.');
    err.status = 400;
    throw err;
  }
  confirmations[idx].confirmed = true;
  saveEmailConfirmations(confirmations);

  const users = loadUsers();
  const uIdx = users.findIndex(u => (u.email || '').toLowerCase() === lower);
  if (uIdx !== -1) {
    users[uIdx] = { ...users[uIdx], emailVerified: true };
    saveUsers(users);
  }

  return { success: true };
};

export const getStatus = async () => {
  if (API_URL) {
    return request('/status');
  }
  await sleep(20);
  return { status: 'ok', local: true };
};

export const sendMessage = async (senderId, receiverId, content) => {
  // Persist to backend relational API
  return request('/messages', {
    method: 'POST',
    body: { senderId, receiverId, content },
  });
};

export const getMessages = async (senderId, receiverId) => {
  return request(`/messages?user1=${encodeURIComponent(senderId)}&user2=${encodeURIComponent(receiverId)}`);
};

export const getUsers = async (userType) => {
  if (API_URL) {
    const type = normalizeType(userType);
    // backend exposes /api/users/:userType (contratante|freelancer)
    // map frontend 'employer' -> 'contratante'
    const backendType = type === 'employer' ? 'contratante' : type;
    return request(`/users/${encodeURIComponent(backendType)}`);
  }

  await sleep(60);
  const type = normalizeType(userType);
  const users = loadUsers();
  return users.filter(u => u.userType === type).map(u => ({ ...u, password: undefined }));
};

/* Email confirmation (local mode) + Projects / Jobs / Applications / Contracts (localStorage-backed) */
const EMAIL_CONFIRMATION_KEY = 'trampoff_email_confirmations';
const PROJECTS_KEY = 'trampoff_projects';
const JOBS_KEY = 'trampoff_jobs';
const APPLICATIONS_KEY = 'trampoff_applications';
const CONTRACTS_KEY = 'trampoff_contracts';

const loadEmailConfirmations = () => {
  try { return JSON.parse(localStorage.getItem(EMAIL_CONFIRMATION_KEY)) || []; } catch (e) { return []; }
};
const saveEmailConfirmations = (arr) => localStorage.setItem(EMAIL_CONFIRMATION_KEY, JSON.stringify(arr));

const loadProjects = () => {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY)) || []; } catch (e) { return []; }
};
const saveProjects = (arr) => localStorage.setItem(PROJECTS_KEY, JSON.stringify(arr));

const loadJobs = () => {
  try { return JSON.parse(localStorage.getItem(JOBS_KEY)) || []; } catch (e) { return []; }
};
const saveJobs = (arr) => localStorage.setItem(JOBS_KEY, JSON.stringify(arr));

const loadApplications = () => {
  try { return JSON.parse(localStorage.getItem(APPLICATIONS_KEY)) || []; } catch (e) { return []; }
};
const saveApplications = (arr) => localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(arr));

const loadContracts = () => {
  try { return JSON.parse(localStorage.getItem(CONTRACTS_KEY)) || []; } catch (e) { return []; }
};
const saveContracts = (arr) => localStorage.setItem(CONTRACTS_KEY, JSON.stringify(arr));

export const socialLogin = async (provider, userType = 'freelancer') => {
  if (API_URL) {
    return request('/social-login', {
      method: 'POST',
      body: { provider, userType },
    });
  }

  await sleep(80);
  const type = normalizeType(userType);
  const users = loadUsers();
  const email = `${type}_${provider.toLowerCase()}@example.com`;
  let user = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: generateId(),
      name: type === 'freelancer' ? 'Freelancer (Google)' : 'Empresa (Google)',
      email,
      password: '',
      userType: type,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    try {
      window.dispatchEvent(new CustomEvent('trampoff:users-updated', { detail: { user } }));
    } catch (e) {}
  }

  const token = btoa(`${user.email}:${Date.now()}`);
  return { token, user: { ...user, password: undefined } };
};

// Projects
export const createProject = async (ownerId, data) => {
  if (API_URL) {
    return request('/projects', { method: 'POST', body: { ownerId, ...data } });
  }

  await sleep(120);
  const arr = loadProjects();
  const id = generateId();
  const project = { id, ownerId, ...data, createdAt: new Date().toISOString() };
  arr.push(project);
  saveProjects(arr);
  return project;
};

export const applyToProject = async (projectId, userId, message = '') => {
  if (API_URL) {
    return request(`/projects/${encodeURIComponent(projectId)}/applications`, { method: 'POST', body: { userId, message } });
  }
  await sleep(80);
  const apps = loadApplications();
  const exists = apps.find(a => String(a.projectId) === String(projectId) && String(a.userId) === String(userId));
  if (exists) { const err = new Error('Já inscrito neste projeto'); err.status = 409; throw err; }
  const application = { id: generateId(), projectId, userId, message, status: 'pending', createdAt: new Date().toISOString() };
  // store project_applications in localStorage under key 'trampoff_project_applications'
  const key = 'trampoff_project_applications';
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(application);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {}
  return application;
};

export const getProjectApplications = async (projectId) => {
  if (API_URL) {
    return request(`/projects/${encodeURIComponent(projectId)}/applications`);
  }
  await sleep(60);
  const key = 'trampoff_project_applications';
  try { const raw = localStorage.getItem(key); const arr = raw ? JSON.parse(raw) : []; return arr.filter(a => String(a.projectId) === String(projectId)); } catch (e) { return []; }
};

export const getNotifications = async (userId) => {
  if (API_URL) return request(`/notifications?userId=${encodeURIComponent(userId)}`);
  await sleep(60);
  try { const raw = localStorage.getItem('trampoff_notifications'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
};

export const markNotificationRead = async (notificationId, updates = { read: true }) => {
  if (API_URL) return request(`/notifications/${encodeURIComponent(notificationId)}`, { method: 'PUT', body: updates });
  await sleep(20);
  try { const raw = localStorage.getItem('trampoff_notifications'); const arr = raw ? JSON.parse(raw) : []; const idx = arr.findIndex(n => String(n.id) === String(notificationId)); if (idx === -1) throw new Error('Notification not found'); arr[idx] = { ...arr[idx], ...updates, updatedAt: new Date().toISOString() }; localStorage.setItem('trampoff_notifications', JSON.stringify(arr)); return arr[idx]; } catch (e) { throw e; }
};

export const getProjects = async (ownerId = null) => {
  if (API_URL) {
    const q = ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : '';
    return request(`/projects${q}`);
  }

  await sleep(80);
  let arr = loadProjects();
  if (ownerId) arr = arr.filter(p => p.ownerId === ownerId);
  return arr;
};

export const updateProject = async (projectId, updates) => {
  if (API_URL) {
    return request(`/projects/${encodeURIComponent(projectId)}`, { method: 'PUT', body: updates });
  }

  await sleep(80);
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === projectId);
  if (idx === -1) throw new Error('Project not found');
  arr[idx] = { ...arr[idx], ...updates, updatedAt: new Date().toISOString() };
  saveProjects(arr);
  return arr[idx];
};

export const deleteProject = async (projectId) => {
  if (API_URL) {
    return request(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
  }

  await sleep(80);
  let arr = loadProjects();
  arr = arr.filter(p => p.id !== projectId);
  saveProjects(arr);
  return true;
};

// Jobs (vagas)
export const createJob = async (ownerId, data) => {
  // mapear `budget` -> `price` (transformar strings como 'R$ 3.000' em número)
  const parsePrice = (val) => {
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    const s = String(val).replace(/[^0-9,\.]/g, '').replace(/,/g, '.');
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  };

  const payload = { ownerId, ...data };
  if (payload.price == null && payload.budget != null) {
    payload.price = parsePrice(payload.budget);
  }

  if (API_URL) {
    return request('/jobs', { method: 'POST', body: payload });
  }

  await sleep(120);
  const arr = loadJobs();
  const id = generateId();
  const job = { id, ...payload, createdAt: new Date().toISOString(), status: 'open' };
  arr.push(job);
  saveJobs(arr);
  return job;
};

export const getJobs = async () => {
  if (API_URL) {
    return request('/jobs');
  }

  await sleep(60);
  return loadJobs();
};

export const updateJob = async (jobId, updates) => {
  if (API_URL) {
    return request(`/jobs/${encodeURIComponent(jobId)}`, { method: 'PUT', body: updates });
  }

  await sleep(60);
  const arr = loadJobs();
  const idx = arr.findIndex(j => j.id === jobId);
  if (idx === -1) throw new Error('Job not found');
  arr[idx] = { ...arr[idx], ...updates, updatedAt: new Date().toISOString() };
  saveJobs(arr);
  return arr[idx];
};

export const deleteJob = async (jobId) => {
  if (API_URL) {
    return request(`/jobs/${encodeURIComponent(jobId)}`, { method: 'DELETE' });
  }

  await sleep(60);
  let arr = loadJobs();
  arr = arr.filter(j => j.id !== jobId);
  saveJobs(arr);
  return true;
};

// Applications (candidaturas)
export const applyToJob = async (jobId, userId, coverLetter = '') => {
  if (API_URL) {
    return request(`/jobs/${encodeURIComponent(jobId)}/applications`, { method: 'POST', body: { userId, coverLetter } });
  }

  await sleep(80);
  const apps = loadApplications();
  // evitar duplicata
  if (apps.find(a => a.jobId === jobId && a.userId === userId)) {
    const err = new Error('Já aplicada'); err.status = 409; throw err;
  }
  const application = { id: generateId(), jobId, userId, coverLetter, status: 'pending', createdAt: new Date().toISOString() };
  apps.push(application);
  saveApplications(apps);
  return application;
};

export const getApplicationsForJob = async (jobId) => {
  if (API_URL) {
    return request(`/jobs/${encodeURIComponent(jobId)}/applications`);
  }

  await sleep(60);
  return loadApplications().filter(a => a.jobId === jobId);
};

export const updateApplication = async (applicationId, updates) => {
  if (API_URL) {
    return request(`/applications/${encodeURIComponent(applicationId)}`, { method: 'PUT', body: updates });
  }

  await sleep(60);
  const apps = loadApplications();
  const idx = apps.findIndex(a => a.id === applicationId);
  if (idx === -1) throw new Error('Application not found');
  apps[idx] = { ...apps[idx], ...updates, updatedAt: new Date().toISOString() };
  saveApplications(apps);
  return apps[idx];
};

// Contracts
export const createContract = async ({ jobId, employerId, freelancerId, agreedAt = new Date().toISOString(), price = 0 }) => {
  if (API_URL) {
    return request('/contracts', { method: 'POST', body: { jobId, employerId, freelancerId, agreedAt, price } });
  }

  await sleep(120);
  const contracts = loadContracts();
  const contract = { id: generateId(), jobId, employerId, freelancerId, price, status: 'active', agreedAt };
  contracts.push(contract);
  saveContracts(contracts);
  return contract;
};

export const getContractsForUser = async (userId) => {
  if (API_URL) {
    return request(`/contracts?userId=${encodeURIComponent(userId)}`);
  }

  await sleep(60);
  return loadContracts().filter(c => c.employerId === userId || c.freelancerId === userId);
};

export const completeContract = async (contractId) => {
  if (API_URL) {
    return request(`/contracts/${encodeURIComponent(contractId)}`, { method: 'PUT', body: { status: 'completed', completedAt: new Date().toISOString() } });
  }

  await sleep(60);
  const contracts = loadContracts();
  const idx = contracts.findIndex(c => c.id === contractId);
  if (idx === -1) throw new Error('Contract not found');
  contracts[idx].status = 'completed';
  contracts[idx].completedAt = new Date().toISOString();
  saveContracts(contracts);
  return contracts[idx];
};

/* Reviews / Avaliações */
const REVIEWS_KEY = 'trampoff_reviews';
const loadReviews = () => {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || []; } catch (e) { return []; }
};
const saveReviews = (arr) => localStorage.setItem(REVIEWS_KEY, JSON.stringify(arr));

export const createReview = async ({ reviewerId, targetUserId, contractId = null, jobId = null, rating = 5, comment = '' }) => {
  if (API_URL) {
    return request('/reviews', { method: 'POST', body: { reviewerId, targetUserId, contractId, jobId, rating, comment } });
  }

  await sleep(80);
  const arr = loadReviews();
  const review = { id: generateId(), reviewerId, targetUserId, contractId, jobId, rating, comment, createdAt: new Date().toISOString() };
  arr.push(review);
  saveReviews(arr);
  return review;
};

export const getReviewsForUser = async (userId) => {
  if (API_URL) {
    return request(`/reviews?userId=${encodeURIComponent(userId)}`);
  }

  await sleep(40);
  return loadReviews().filter(r => r.targetUserId === userId);
};

export const getReviewsForJob = async (jobId) => {
  if (API_URL) {
    return request(`/reviews?jobId=${encodeURIComponent(jobId)}`);
  }

  await sleep(40);
  return loadReviews().filter(r => r.jobId === jobId);
};

export const getReviewStatsForUser = async (userId) => {
  if (API_URL) {
    return request(`/reviews/stats?userId=${encodeURIComponent(userId)}`);
  }

  await sleep(30);
  const reviews = loadReviews().filter(r => r.targetUserId === userId);
  const count = reviews.length;
  const average = count === 0 ? 0 : reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / count;
  return { count, average };
};

// Inicializador de dados de exemplo (seed) — executado apenas se não houver dados
(() => {
  try {
    const users = loadUsers();
    const messages = loadMessages();
    const projects = loadProjects();
    const jobs = loadJobs();
    const applications = loadApplications();
    const contracts = loadContracts();

    const needsSeed = users.length === 0 && messages.length === 0 && projects.length === 0 && jobs.length === 0 && applications.length === 0 && contracts.length === 0;
    if (!needsSeed) {
      return;
    }

    // Criar usuários de exemplo
    const employerId = generateId();
    const freelancerId = generateId();
    const freelancer2Id = generateId();

    const seedUsers = [
      {
        id: employerId,
        name: 'Empresa Exemplo',
        email: 'empresa@exemplo.com',
        password: 'password',
        userType: 'employer',
        companyName: 'Empresa Exemplo LTDA',
        description: 'Contratante de teste',
        createdAt: new Date().toISOString(),
      },
      {
        id: freelancerId,
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'password',
        userType: 'freelancer',
        description: 'Desenvolvedor front-end',
        createdAt: new Date().toISOString(),
      },
      {
        id: freelancer2Id,
        name: 'Maria Souza',
        email: 'maria@exemplo.com',
        password: 'password',
        userType: 'freelancer',
        description: 'UX Designer',
        createdAt: new Date().toISOString(),
      },
    ];
    saveUsers(seedUsers);

    // Mensagem de exemplo entre empregador e freelancer
    const seedMessages = [
      {
        id: generateId(),
        senderId: employerId,
        receiverId: freelancerId,
        content: 'Olá João, vi seu perfil e quero conversar sobre uma vaga.',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        senderId: freelancerId,
        receiverId: employerId,
        content: 'Olá! Obrigado pelo contato — quando podemos falar?',
        createdAt: new Date().toISOString(),
      },
    ];
    saveMessages(seedMessages);

    // Projeto de exemplo do freelancer
    const seedProjects = [
      {
        id: generateId(),
        ownerId: freelancerId,
        title: 'Portfólio Pessoal',
        description: 'Site pessoal com projetos e blog.',
        createdAt: new Date().toISOString(),
      },
    ];
    saveProjects(seedProjects);

    // Vaga de exemplo do empregador
    const jobId = generateId();
    const seedJobs = [
      {
        id: jobId,
        ownerId: employerId,
        title: 'Desenvolvedor React (PJ)',
        description: 'Projeto de 3 meses para construir dashboard em React.',
        price: 5000,
        createdAt: new Date().toISOString(),
        status: 'open',
      },
    ];
    saveJobs(seedJobs);

    // Candidatura de exemplo (João aplica para a vaga)
    const seedApplications = [
      {
        id: generateId(),
        jobId,
        userId: freelancerId,
        coverLetter: 'Tenho experiência com React e posso começar na próxima semana.',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];
    saveApplications(seedApplications);

    // Contrato exemplo (entre employer e Maria) — mostra contratos na lista
    const seedContracts = [
      {
        id: generateId(),
        jobId,
        employerId,
        freelancerId: freelancer2Id,
        price: 4000,
        status: 'active',
        agreedAt: new Date().toISOString(),
      },
    ];
    saveContracts(seedContracts);

    console.info('[seed] Dados locais iniciais criados: usuários, mensagens, projetos, vagas, candidaturas e contratos.');
  } catch (e) {
    // não interromper execução caso haja erro no seed
    console.warn('[seed] falha ao criar dados iniciais:', e);
  }
})();

