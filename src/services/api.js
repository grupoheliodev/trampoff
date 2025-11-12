
/*
  Implementação local usando localStorage.
  Objetivo: permitir rodar o app sem backend. Todos os dados serão salvos
  em localStorage sob chaves: 'trampoff_users' e 'trampoff_messages'.

  Funções exportadas mantêm a mesma API (promises) para compatibilidade.
*/

/*
  Integração opcional com backend relacional (login) e Firebase (Firestore)
  ---
  Nota: para manter o aplicativo rodando localmente por enquanto, o código
  de integração fica comentado abaixo. Quando quiser ativar:

  1) Adicione as variáveis no `.env` (Vite):
     VITE_RELATIONAL_API_URL=https://seu-backend-relacional.example.com/api
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     VITE_FIREBASE_PROJECT_ID=...
     VITE_FIREBASE_STORAGE_BUCKET=...
     VITE_FIREBASE_MESSAGING_SENDER_ID=...
     VITE_FIREBASE_APP_ID=...

  2) Instale a dependência `firebase` e remova o comentário nas linhas
     abaixo para inicializar o Firestore.

  // import { initializeApp } from 'firebase/app';
  // import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';

  // const RELATIONAL_URL = import.meta.env.VITE_RELATIONAL_API_URL || '';
  // const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';

  // let db = null;
  // if (FIREBASE_API_KEY) {
  //   const firebaseConfig = {
  //     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  //     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  //     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  //     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  //     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  //     appId: import.meta.env.VITE_FIREBASE_APP_ID,
  //   };
  //   try {
  //     const app = initializeApp(firebaseConfig);
  //     db = getFirestore(app);
  //     console.info('[firebase] Firestore inicializado');
  //   } catch (e) {
  //     console.warn('[firebase] falha ao inicializar Firestore', e);
  //     db = null;
  //   }
  // }

*/

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

const USERS_KEY = 'trampoff_users';
const MESSAGES_KEY = 'trampoff_messages';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const loadMessages = () => {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveMessages = (messages) => {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

const normalizeType = (t) => {
  if (!t) return 'freelancer';
  if (t === 'contratante') return 'employer';
  if (t === 'employer' || t === 'company') return 'employer';
  return t;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

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

export const getStatus = async () => {
  if (API_URL) {
    return request('/status');
  }
  await sleep(20);
  return { status: 'ok', local: true };
};

export const sendMessage = async (senderId, receiverId, content) => {
  await sleep(60);
  const messages = loadMessages();
  const msg = {
    id: generateId(),
    senderId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  saveMessages(messages);
  return msg;
};

export const getMessages = async (senderId, receiverId) => {
  await sleep(60);
  const messages = loadMessages();
  // retornar conversas entre os dois (ambos os sentidos)
  return messages.filter(m => (m.senderId === senderId && m.receiverId === receiverId) || (m.senderId === receiverId && m.receiverId === senderId));
};

export const getUsers = async (userType) => {
  await sleep(60);
  const type = normalizeType(userType);
  const users = loadUsers();
  return users.filter(u => u.userType === type).map(u => ({ ...u, password: undefined }));
};

/* Projects / Jobs / Applications / Contracts (localStorage-backed) */
const PROJECTS_KEY = 'trampoff_projects';
const JOBS_KEY = 'trampoff_jobs';
const APPLICATIONS_KEY = 'trampoff_applications';
const CONTRACTS_KEY = 'trampoff_contracts';

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

// Projects
export const createProject = async (ownerId, data) => {
  await sleep(120);
  const arr = loadProjects();
  const id = generateId();
  const project = { id, ownerId, ...data, createdAt: new Date().toISOString() };
  arr.push(project);
  saveProjects(arr);
  return project;
};

export const getProjects = async (ownerId = null) => {
  await sleep(80);
  let arr = loadProjects();
  if (ownerId) arr = arr.filter(p => p.ownerId === ownerId);
  return arr;
};

export const updateProject = async (projectId, updates) => {
  await sleep(80);
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === projectId);
  if (idx === -1) throw new Error('Project not found');
  arr[idx] = { ...arr[idx], ...updates, updatedAt: new Date().toISOString() };
  saveProjects(arr);
  return arr[idx];
};

export const deleteProject = async (projectId) => {
  await sleep(80);
  let arr = loadProjects();
  arr = arr.filter(p => p.id !== projectId);
  saveProjects(arr);
  return true;
};

// Jobs (vagas)
export const createJob = async (ownerId, data) => {
  await sleep(120);
  const arr = loadJobs();
  const id = generateId();
  const job = { id, ownerId, ...data, createdAt: new Date().toISOString(), status: 'open' };
  arr.push(job);
  saveJobs(arr);
  return job;
};

export const getJobs = async () => {
  await sleep(60);
  return loadJobs();
};

export const updateJob = async (jobId, updates) => {
  await sleep(60);
  const arr = loadJobs();
  const idx = arr.findIndex(j => j.id === jobId);
  if (idx === -1) throw new Error('Job not found');
  arr[idx] = { ...arr[idx], ...updates, updatedAt: new Date().toISOString() };
  saveJobs(arr);
  return arr[idx];
};

export const deleteJob = async (jobId) => {
  await sleep(60);
  let arr = loadJobs();
  arr = arr.filter(j => j.id !== jobId);
  saveJobs(arr);
  return true;
};

// Applications (candidaturas)
export const applyToJob = async (jobId, userId, coverLetter = '') => {
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
  await sleep(60);
  return loadApplications().filter(a => a.jobId === jobId);
};

export const updateApplication = async (applicationId, updates) => {
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
  await sleep(120);
  const contracts = loadContracts();
  const contract = { id: generateId(), jobId, employerId, freelancerId, price, status: 'active', agreedAt };
  contracts.push(contract);
  saveContracts(contracts);
  return contract;
};

export const getContractsForUser = async (userId) => {
  await sleep(60);
  return loadContracts().filter(c => c.employerId === userId || c.freelancerId === userId);
};

export const completeContract = async (contractId) => {
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
  await sleep(80);
  const arr = loadReviews();
  const review = { id: generateId(), reviewerId, targetUserId, contractId, jobId, rating, comment, createdAt: new Date().toISOString() };
  arr.push(review);
  saveReviews(arr);
  return review;
};

export const getReviewsForUser = async (userId) => {
  await sleep(40);
  return loadReviews().filter(r => r.targetUserId === userId);
};

export const getReviewsForJob = async (jobId) => {
  await sleep(40);
  return loadReviews().filter(r => r.jobId === jobId);
};

export const getReviewStatsForUser = async (userId) => {
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

