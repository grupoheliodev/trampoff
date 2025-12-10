# MAPA DE USUÁRIOS - TRAMPOFF

## Estrutura de Usuários do Sistema

### 1. TIPOS DE USUÁRIOS

O sistema Trampoff possui dois tipos principais de usuários:

#### 1.1 FREELANCER (Aluno do Ensino Médio)
- **Tipo**: freelancer
- **Descrição**: Alunos do ensino médio que oferecem serviços e talentos
- **Validações de Cadastro**:
  - Apenas alunos do Ensino Médio podem se cadastrar
  - Obrigatório informar: Escola e Número de Identificação Escolar
  - Checkbox de confirmação: "Sou aluno do Ensino Médio"
  - Senha forte obrigatória (8+ caracteres, maiúscula, minúscula, número, símbolo especial)
- **Campos do Perfil**:
  - ID único (timestamp)
  - Nome completo
  - Email (autenticação)
  - Senha (hasheada)
  - Telefone (formatado)
  - CPF ou CNPJ
  - Portfólio (link URL - opcional)
  - Escola (nome da escola)
  - ID Escolar (matrícula/identificação)
  - Foto de perfil (URL)
  - userType: "freelancer"
  - Data de criação
- **Funcionalidades Disponíveis**:
  - Visualizar trabalhos disponíveis
  - Aplicar em oportunidades
  - Gerenciar meus projetos
  - Visualizar meus contratos
  - Enviar e receber mensagens
  - Visualizar perfil de empregadores
  - Acessar área de Eventos Escolares
  - Sistema de planos (Free / Pro)
  - Gerenciar métodos de pagamento para ativar Pro
- **Rotas Principais**:
  - /freelancer/home
  - /freelancer/jobs
  - /freelancer/projects
  - /freelancer/contracts
  - /freelancer/messages
  - /freelancer/profile
  - /freelancer/settings
  - /school-events

#### 1.2 EMPLOYER/CONTRATANTE (Escola ou Empresa)
- **Tipo**: contratante / employer
- **Descrição**: Escolas, empresas ou instituições que contratam talentos
- **Validações de Cadastro**:
  - CNPJ obrigatório (validado)
  - Senha forte obrigatória (8+ caracteres, maiúscula, minúscula, número, símbolo especial)
  - Telefone (formatado)
  - Escola (opcional)
- **Campos do Perfil**:
  - ID único (timestamp)
  - Nome da empresa / Nome da escola
  - Email (autenticação)
  - Senha (hasheada)
  - CNPJ (validado)
  - Telefone (formatado)
  - Descrição da empresa (resumo)
  - Foto/Logo da empresa (URL)
  - Escola (nome - opcional)
  - companyName
  - userType: "contratante" ou "employer"
  - Data de criação
- **Funcionalidades Disponíveis**:
  - Publicar vagas/oportunidades
  - Visualizar freelancers disponíveis
  - Gerenciar contratos
  - Enviar e receber mensagens
  - Visualizar perfil de freelancers
  - Acessar área de Eventos Escolares
  - Sistema de planos (Free / Pro)
  - Gerenciar métodos de pagamento para ativar Pro
- **Rotas Principais**:
  - /employer/home
  - /employer/workers
  - /employer/contracts
  - /employer/messages
  - /employer/profile
  - /employer/settings
  - /school-events

---

## 2. ARMAZENAMENTO DE DADOS

### 2.1 Armazenamento em Produção (Backend)
**Localização**: `backend-trampoff/data/users.json`
- Arquivo JSON contendo array de usuários registrados
- Estrutura: array de objetos com informações do usuário
- Exemplo de usuário:
```json
{
  "id": 1764815674917,
  "name": "Usuário google",
  "email": "social_google@example.com",
  "userType": "freelancer",
  "phone": "(11) 99999-9999",
  "cad": "123.456.789-10",
  "portfolio": "https://exemplo.com",
  "school": "E.E. São Paulo",
  "studentId": "MAT12345",
  "isHighSchoolStudent": true,
  "photo": "https://storage.exemplo.com/foto.jpg",
  "createdAt": "2025-12-04T02:34:26.911Z"
}
```

### 2.2 Armazenamento Local (Frontend - localStorage)
**Chave**: `trampoff_users`
- Array de usuários para modo local/desenvolvimento
- Mesma estrutura do backend
- Sincronizado automaticamente após atualizações de perfil

---

## 3. AUTENTICAÇÃO E SESSÃO

### 3.1 Tokens e Armazenamento
- **Token**: Armazenado em `localStorage.token`
- **Usuário Ativo**: Armazenado em `localStorage.user` (JSON stringificado)
- **Contexto**: Gerenciado via `AuthContext.jsx`

### 3.2 Fluxo de Login
1. Usuário acessa `/freelancer/login` ou `/employer/login`
2. Insere email e senha
3. Sistema valida credenciais (backend ou localStorage)
4. Se válido:
   - Token é armazenado
   - Dados do usuário são armazenados
   - Redirecionado para home correspondente
5. Logout remove token e dados de sessão

### 3.3 Fluxo de Registro
1. Usuário acessa `/freelancer/registration` ou `/employer/registration`
2. Preenche formulário com validações:
   - **Freelancer**: nome, email, senha forte, telefone, CPF/CNPJ, escola, ID escolar
   - **Employer**: nome empresa, email, CNPJ, senha forte, telefone, descrição
3. Sistema valida dados localmente
4. Envia para backend (ou localStorage em modo offline)
5. Sucesso: redireciona para home ou setup de perfil

---

## 4. CAMPOS OBRIGATÓRIOS POR TIPO

### 4.1 FREELANCER
| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| name | string | máx 40 caracteres | ✓ |
| email | email | formato válido | ✓ |
| password | string | 8+ chars, maiús, minús, número, símbolo | ✓ |
| phone | tel | (XX) XXXXX-XXXX | ✓ |
| cad | string | CPF/CNPJ validado | ✓ |
| school | string | nome da escola | ✓ |
| studentId | string | ID/matrícula escolar | ✓ |
| isHighSchoolStudent | boolean | checkbox confirmação | ✓ |
| portfolio | URL | opcional | ✗ |
| photo | URL | URL da foto | ✗ |

### 4.2 EMPLOYER
| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| name / companyName | string | máx 40 caracteres | ✓ |
| email | email | formato válido | ✓ |
| password | string | 8+ chars, maiús, minús, número, símbolo | ✓ |
| phone | tel | (XX) XXXXX-XXXX | ✓ |
| cnpj | string | CNPJ validado | ✓ |
| description | string | resumo da empresa | ✗ |
| school | string | nome da escola (opcional) | ✗ |
| photo | URL | URL da logo/foto | ✗ |

---

## 5. PLANOS E PAGAMENTO

### 5.1 Planos Disponíveis
- **Free**: Acesso básico (sem limite definido atualmente)
- **Pro**: Acesso premium com recursos adicionais

### 5.2 Requisito de Pagamento
- Para ativar plano **Pro**, usuário deve ter **pelo menos 1 método de pagamento cadastrado**
- Métodos suportados: cartão de crédito
- Validação ocorre tanto no frontend quanto no backend

### 5.3 Armazenamento de Cartões
**Chave localStorage**: `paymentMethods` (por usuário)
- Array de cartões cadastrados
- Estrutura: { id, cardNumber, cardholder, expiryDate, ... }

---

## 6. NOTIFICAÇÕES E MENSAGENS

### 6.1 Sistema de Notificações
**Chave localStorage**: `trampoff_notifications`
- Array de notificações
- Tipos: message, application, contract, ...
- Campos: id, type, read, ownerId, fromId, content, createdAt

### 6.2 Sistema de Mensagens
**Chaves localStorage**:
- `messages`: Armazenamento principal
- `trampoff_messages`: Armazenamento legado (mantido para compatibilidade)

Estrutura:
```json
{
  "id": "msg_timestamp",
  "senderId": 1764815674917,
  "receiverId": 1764815674918,
  "content": "Olá, tudo bem?",
  "createdAt": "2025-12-09T10:30:00Z",
  "read": false
}
```

---

## 7. FUNCIONALIDADES ESPECIAIS

### 7.1 Eventos Escolares
**Rota**: `/school-events`
**Armazenamento**: `localStorage.school_events`
- Lista de eventos da escola
- Campos: id, title, date, school
- CRUD completo: adicionar, visualizar, remover eventos

### 7.2 Busca Unificada
**Função**: `unifiedSearch(query)`
- Busca em: usuários, vagas, projetos, mensagens
- Mínimo 1 caractere para busca local
- Mínimo 2 caracteres para busca backend
- Fallback automático: se backend vazio, retorna locais

### 7.3 Temas (Dark/Light)
**Chave localStorage**: `trampoff_theme`
- Valores: "dark" | "light"
- Controle via `AccessibilityPanel`
- Aplicado via `data-theme` no elemento root

### 7.4 Acessibilidade
**Funcionalidades**:
- Painel flutuante ajustável
- Escalas de texto
- Alto contraste
- Simulação de daltonismo
- Modo redução de movimento

---

## 8. FLUXO DE ATUALIZAÇÃO DE PERFIL

### 8.1 Mudança de Foto
1. Usuário seleciona nova foto (upload ou URL)
2. Foto é processada e armazenada
3. URL é salva no perfil
4. `trampoff:users-updated` event é disparado
5. Componentes ouvindo o evento atualizam avatares em tempo real

### 8.2 Sincronização Entre Componentes
- **Event**: `window.dispatchEvent(new CustomEvent('trampoff:users-updated', { detail: { user } }))`
- **Listeners**: Header, Messages, ProfileModal, etc.
- **Fallback**: localStorage eventos monitorados via `storage` event listener

---

## 9. CONTEXTO DE AUTENTICAÇÃO (AuthContext)

### 9.1 Estado Gerenciado
```javascript
{
  user: { id, name, email, userType, photo, ... },
  userType: "freelancer" | "contratante",
  token: string,
  login: async (email, password) => void,
  register: async (userData, type) => void,
  logout: () => void,
  updateUser: async (updatedUser) => void,
  resetPassword: async (email, newPassword) => void,
  socialLogin: async (provider, type) => void
}
```

### 9.2 Persistência
- Token e usuário salvos em `localStorage`
- Restaurados automaticamente ao recarregar página
- Última rota visitada também é persistida

---

## 10. ROADMAP FUTURO

### Melhorias Planejadas para Autenticação
1. **Validação de Escola**: Integração com banco de dados de escolas públicas/privadas
2. **Verificação de ID Escolar**: Validação com sistemas escolares
3. **Login Social Melhorado**: Google, Microsoft, Apple
4. **2FA (Two-Factor Authentication)**: Segurança adicional
5. **LGPD Compliance**: Conformidade com lei de proteção de dados

### Melhorias de Pagamento
1. **Múltiplos Métodos**: PIX, Boleto, PayPal
2. **Assinatura Recorrente**: Pro com renovação automática
3. **Histórico de Pagamentos**: Dashboard financeiro

---

## 11. ESTATÍSTICAS ATUAIS (Dezembro 2025)

- **Usuários Registrados**: 1 (Usuário Google)
- **Freelancers**: 1
- **Employers/Escolas**: 0
- **Eventos Escolares Cadastrados**: 0
- **Mensagens Ativas**: 0

---

## 12. REFERÊNCIAS RÁPIDAS

### Arquivos Chave
- **Frontend Auth**: `src/context/AuthContext.jsx`
- **Login Freelancer**: `src/pages/freelancer/freelancer_login.jsx`
- **Login Employer**: `src/pages/employer/employer_login.jsx`
- **Registro Freelancer**: `src/pages/freelancer/freelancer_registration.jsx`
- **Registro Employer**: `src/pages/employer/employer_registration.jsx`
- **Header/Nav**: `src/components/Header.jsx`
- **API Service**: `src/services/api.js`
- **Backend Users**: `backend-trampoff/data/users.json`

### Variáveis de Ambiente
- `VITE_API_URL`: URL do backend (padrão: http://localhost:3000/api)
- `VITE_RELATIONAL_API_URL`: URL relacional (legado)

---

**Última Atualização**: Dezembro 9, 2025
**Mantido por**: Equipe de Desenvolvimento Trampoff
