TRAMPOFF - PLATAFORMA DE OPORTUNIDADES PARA ALUNOS DO ENSINO MÉDIO

Desenvolvido pela Equipe Grupohelio Dev

Autores:

Fabricio Teixeira Bezerra
Mariana Martins Coutinho
Ryan Soares Guimarães do Nascimento

MANUAL DO USUÁRIO — Sistema Trampoff
Versão 1.0

São Paulo - SP
2025


═══════════════════════════════════════════════════════════════════════════════

1 INTRODUÇÃO

O Sistema Trampoff é uma plataforma web desenvolvida como parte de um Trabalho de Conclusão de Curso (TCC) da área de Informática, realizado pela empresa fictícia Grupohelio Dev que atua no ramo de Desenvolvimento Digital. O projeto foi criado com o objetivo de conectar talentos (alunos do Ensino Médio) com oportunidades profissionais e escolares, oferecendo uma solução tecnológica acessível, intuitiva e alinhada às necessidades reais do ambiente educacional e corporativo.

A aplicação foi construída utilizando React + Vite no frontend e Node.js + Express no backend, garantindo desempenho, organização e escalabilidade. O sistema permite que:

• Alunos do Ensino Médio se registrem, visualizem oportunidades de trabalho, respondam a vagas e gerenciem seus contratos.
• Escolas e Empresas publiquem oportunidades, visualizem candidatos, gerenciem contratações e acompanhem o desempenho dos contratados.
• Todos os usuários utilizem um robusto módulo de acessibilidade, com recursos como aumento de fonte, tema escuro, alto contraste e filtros daltônicos.
• Professores e coordenadores acessem uma área de Eventos Escolares para compartilhamento de atividades acadêmicas.

Combinando tecnologia moderna, foco na experiência do usuário e um propósito acadêmico, o Sistema Trampoff representa a união entre conhecimento, inovação e impacto social.

═══════════════════════════════════════════════════════════════════════════════

2 TELA DE LOGIN

Para acessar o sistema, deve-se digitar no browser (navegador) um dos seguintes endereços:

FREELANCER (Aluno):
https://trampoff.vercel.app/freelancer/login

EMPLOYER (Escola/Empresa):
https://trampoff.vercel.app/employer/login

Em seguida, aparecerá a tela de login para acesso ao conteúdo do site. O usuário deve inserir as seguintes credenciais para entrar no sistema:
• E-mail (cadastrado no sistema)
• Senha (definida durante o cadastro)

Após inserir os dados corretos, clique no botão "ENTRAR" para acessar o painel correspondente.

═══════════════════════════════════════════════════════════════════════════════

3 CADASTRO DE NOVO USUÁRIO

Para usuários sem conta no sistema, existe a opção "Não Possui Cadastro? Faça Agora", disponível na tela de login.

3.1 CADASTRO DE FREELANCER (Aluno do Ensino Médio)

O cadastro de freelancer é dividido em 1 etapa com 7 campos obrigatórios:

Dados Pessoais:
• Nome Completo (máx. 40 caracteres)
• E-mail (autenticação do sistema)
• Senha forte (obrigatório):
  - Mínimo 8 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 letra minúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial (!@#$%^&*)

Validação Escolar:
• Confirmação: "Sou aluno do Ensino Médio" (checkbox obrigatório)
• Nome da Escola
• Número de Identificação Escolar (matrícula/RG escolar)

Contato e Portfólio:
• Telefone (formatado automaticamente: (XX) XXXXX-XXXX)
• CPF/CNPJ (validado e formatado: XXX.XXX.XXX-XX)
• Link do Portfólio (opcional)

Após preencher todos os dados obrigatórios, clique em "CADASTRAR" para criar sua conta.

3.2 CADASTRO DE EMPLOYER (Escola/Empresa)

O cadastro de employer é dividido em 1 etapa com 6 campos obrigatórios:

Dados da Empresa:
• Nome da Empresa (máx. 40 caracteres)
• E-mail (autenticação do sistema)
• Senha forte (obrigatório - mesmos requisitos do freelancer)

Informações Legais e Contato:
• CNPJ (validado e formatado: XX.XXX.XXX/XXXX-XX)
• Telefone (formatado automaticamente: (XX) XXXXX-XXXX)
• Resumo da Empresa (descrição - opcional)
• Escola (se aplicável - opcional)

Após preencher todos os dados obrigatórios, clique em "CADASTRAR" para criar sua conta. Você será redirecionado automaticamente para a tela inicial de empregador.

═══════════════════════════════════════════════════════════════════════════════

4 PAINEL DO FREELANCER (Aluno)

Ao logar-se com as credenciais de freelancer, o usuário será redirecionado para o painel do aluno.

Na tela inicial, há:
• Uma área de boas-vindas com mensagem personalizada e ilustração
• Acesso rápido às principais seções através do menu superior
• No topo do cabeçalho, um botão tipo "hambúrguer" no lado esquerdo que expande um menu de acesso a todas funcionalidades

Menu Lateral contendo:
• Início
• Trabalhos Disponíveis
• Meus Projetos
• Meus Contratos
• Mensagens
• Eventos Escolares
• Perfil
• Configurações
• Sair

═══════════════════════════════════════════════════════════════════════════════

5 TRABALHOS DISPONÍVEIS

Nesta seção, o freelancer visualiza todas as oportunidades de trabalho publicadas pelas escolas e empresas.

Funcionalidades:
• Visualização em cards com informações principais da oportunidade
• Filtros de busca por título, descrição, escola ou empresa
• Ordenação por data mais recente ou relevância
• Visualização detalhada ao clicar no card da oportunidade

Aplicar em uma Oportunidade:
• Ao clicar em "APLICAR AGORA", uma tela modal aparecerá
• Nessa tela, o freelancer deve inserir uma mensagem/carta de apresentação (não é opcional)
• A tela utiliza as cores do site para uma experiência consistente
• Após enviar, a oportunidade é marcada como "JÁ APLICADO", impedindo novos cliques no botão
• Ao clicar "CANCELAR", a aplicação é cancelada sem notificações de sucesso

═══════════════════════════════════════════════════════════════════════════════

6 MEUS PROJETOS

Visualização de todos os projetos criados ou associados ao freelancer.

Funcionalidades:
• Cards exibindo informações do projeto
• Abertura de detalhes do projeto em uma tela dedicada
• Opção de editar título e descrição dos projetos que você criou
• Inscrição em projetos criados por outras contas quando disponíveis

═══════════════════════════════════════════════════════════════════════════════

7 MEUS CONTRATOS

Visualização de todos os contratos assinados pelo freelancer com escolas e empresas.

Informações Exibidas:
• Nome do contratante
• Descrição da oportunidade
• Data de início e fim do contrato
• Status (Ativo, Completo, Cancelado)
• Valor acordado (se aplicável)

Funcionalidades:
• Visualizar detalhes do contrato
• Entregar contrato (quando o freelancer finaliza seu trabalho)
• Contratante confirma recebimento do contrato

═══════════════════════════════════════════════════════════════════════════════

8 MENSAGENS

Sistema de comunicação entre freelancers e employers.

Conversas:
• Listagem de todas as conversas ativas à esquerda
• Ao clicar em uma conversa, ela abre e seu avatar é atualizado em tempo real
• Badge de notificação mostra quantidade de mensagens não lidas

Envio de Mensagens:
• Campo de entrada de texto para digitar mensagens
• Botão "ENVIAR" ou Enter para enviar
• Após envio, a mensagem é removida do campo de entrada automaticamente
• Mensagens aparecem imediatamente na tela
• Ao clicar na conversa, as notificações são marcadas como lidas automaticamente

═══════════════════════════════════════════════════════════════════════════════

9 EVENTOS ESCOLARES

Área dedicada ao compartilhamento de eventos e atividades escolares.

Funcionalidades:
• Visualizar lista de todos os eventos cadastrados
• Adicionar novo evento (título, data e escola)
• Filtrar eventos por escola
• Remover eventos da lista

Informações de Cada Evento:
• Título do evento
• Data (exibida em formato legível)
• Nome da escola responsável

═══════════════════════════════════════════════════════════════════════════════

10 PERFIL DO FREELANCER

Nesta seção, o freelancer visualiza seus dados pessoais e pode fazer alterações.

Informações Exibidas:
• Nome completo
• E-mail
• Telefone
• CPF
• Escola
• Número de Identificação Escolar
• Foto de perfil
• Portfólio (se cadastrado)

Edições Permitidas:
• Alterar foto de perfil (upload ou URL)
• Editar informações de portfólio
• Alterar senha
• Atualizar informações de contato

═══════════════════════════════════════════════════════════════════════════════

11 CONFIGURAÇÕES DO FREELANCER

Acesso a preferências pessoais e gerenciamento de conta.

Funcionalidades:
• Seleção de plano (Free ou Pro)
• Gerenciar métodos de pagamento para ativar plano Pro
• Requer pelo menos 1 cartão cadastrado para ativar Pro
• Limpar dados locais (reset de cache)
• Preferências de notificação
• Privacidade e segurança

═══════════════════════════════════════════════════════════════════════════════

12 PAINEL DO EMPLOYER (Escola/Empresa)

Ao logar-se com as credenciais de employer, o usuário será redirecionado para o painel da empresa.

Na tela inicial, há:
• Uma área de boas-vindas com mensagem personalizada e ilustração
• Um botão para criar novas vagas e atalhos para contratos e vagas publicadas
• No topo do cabeçalho, um botão tipo "hambúrguer" no lado esquerdo que expande um menu

Menu Lateral contendo:
• Início
• Trabalhadores Disponíveis
• Meus Contratos
• Mensagens
• Eventos Escolares
• Perfil
• Configurações
• Sair

═══════════════════════════════════════════════════════════════════════════════

13 TRABALHADORES DISPONÍVEIS

Visualização de perfis de trabalhadores disponíveis para contratação.

Funcionalidades:
• Cards com informações do freelancer
• Nome, escola e áreas de atuação
• Foto de perfil
• Link para visualizar portfólio
• Botão para iniciar conversa via mensagens

═══════════════════════════════════════════════════════════════════════════════

14 PUBLICAR OPORTUNIDADES

O employer pode criar novas oportunidades de trabalho/projeto.

Dados da Oportunidade:
• Título (máx. 100 caracteres)
• Descrição (detalhamento da oportunidade)
• Categoria (Trabalho, Projeto, Estágio)
• Competências Necessárias
• Valor/Compensação (se houver)
• Data de Início
• Data de Fim (esperado)

Após preencher os dados, clique em "PUBLICAR" para que a oportunidade apareça na seção "Trabalhos Disponíveis" dos freelancers.

═══════════════════════════════════════════════════════════════════════════════

15 MEUS CONTRATOS (EMPLOYER)

Visualização de todos os contratos gerenciados pela escola/empresa.

Informações Exibidas:
• Nome do freelancer contratado
• Descrição da oportunidade
• Data de início e fim
• Status (Aguardando Início, Em Andamento, Entregue, Completo, Cancelado)

Funcionalidades:
• Visualizar detalhes do contrato
• Confirmar recebimento de contrato entregue pelo freelancer
• Avaliar desempenho do freelancer
• Cancelar contrato (se necessário)

═══════════════════════════════════════════════════════════════════════════════

16 MENSAGENS (EMPLOYER)

Sistema de comunicação entre employer e freelancers.

Conversas:
• Listagem de todas as conversas com freelancers
• Ao clicar em uma conversa, ela abre e o avatar é atualizado em tempo real
• Badge de notificação mostra quantidade de mensagens não lidas

Envio de Mensagens:
• Campo de entrada de texto para digitar mensagens
• Botão "ENVIAR" ou Enter para enviar
• Mensagens aparecem imediatamente na tela
• Ao clicar na conversa, as notificações são marcadas como lidas automaticamente

═══════════════════════════════════════════════════════════════════════════════

17 EVENTOS ESCOLARES (EMPLOYER)

Área para compartilhamento de eventos e atividades escolares.

Funcionalidades:
• Adicionar novo evento (título, data e escola)
• Visualizar eventos cadastrados
• Filtrar por escola
• Remover eventos quando necessário

═══════════════════════════════════════════════════════════════════════════════

18 PERFIL DO EMPLOYER

Nesta seção, o employer visualiza dados da empresa e pode fazer alterações.

Informações Exibidas:
• Nome da empresa
• E-mail corporativo
• CNPJ
• Telefone
• Descrição da empresa
• Logo/Foto da empresa
• Escola (se aplicável)

Edições Permitidas:
• Alterar logo/foto da empresa (upload ou URL)
• Editar descrição da empresa
• Alterar dados de contato
• Alterar senha

═══════════════════════════════════════════════════════════════════════════════

19 CONFIGURAÇÕES DO EMPLOYER

Acesso a preferências e gerenciamento de conta.

Funcionalidades:
• Seleção de plano (Free ou Pro)
• Gerenciar métodos de pagamento para ativar plano Pro
• Requer pelo menos 1 cartão cadastrado para ativar Pro
• Limpar dados locais (reset de cache)
• Preferências de notificação
• Privacidade e segurança

═══════════════════════════════════════════════════════════════════════════════

20 BUSCA UNIFICADA

O sistema oferece uma barra de busca disponível no header (cabeçalho) de todas as páginas.

Funcionalidades:
• Buscar por usuários (freelancers ou employers)
• Buscar por oportunidades/vagas
• Buscar por projetos
• Buscar por mensagens anteriores
• Para abrir a página de resultados, basta digitar pelo menos 1 caractere e pressionar Enter ou o botão de busca
• Para ver sugestões em tempo real na caixinha de resultados, são considerados termos a partir de 2 caracteres
• Persiste última busca realizada para fácil acesso

Ao clicar em um resultado, você é redirecionado para a página correspondente.

═══════════════════════════════════════════════════════════════════════════════

21 ACESSIBILIDADES

O sistema Trampoff inclui um módulo robusto de acessibilidade disponível para todos os usuários.

Funcionalidades Disponíveis:
• Tema Claro/Escuro - Alterna entre tema escuro (padrão) e tema claro
• Alto Contraste - Aumenta contraste visual para melhor legibilidade
• Filtros Daltônicos - Simula diferentes tipos de daltonismo
• Escala de Fonte Global - Aumenta ou diminui o tamanho da fonte em todo o sistema
• Reduzir Animações - Minimiza transições e efeitos de movimento para maior conforto visual
• Destacar Links - Adiciona destaque extra aos links para facilitar a navegação
• Reset Geral - Restaura todas as configurações de acessibilidade ao padrão

Acesso:
• Clique no painel de acessibilidade (ícone de engrenagem flutuante na tela)
• O painel é draggable (pode ser movido pela tela)
• As configurações são salvas automaticamente em seu navegador

═══════════════════════════════════════════════════════════════════════════════

22 BOTÃO INSTALAR (PWA)

O Trampoff é um Progressive Web App (PWA), permitindo instalação como aplicativo.

Como Instalar:
• Clique no botão "INSTALAR" que aparece no header
• Siga as instruções do seu navegador
• O aplicativo será instalado na sua tela inicial ou menu de aplicativos
• Pode ser usado offline (funcionalidades básicas disponíveis)

═══════════════════════════════════════════════════════════════════════════════

23 PLANOS DO SISTEMA

O Trampoff oferece dois planos:

PLANO FREE:
• Acesso básico a todas as funcionalidades
• Sem limite de aplicações em oportunidades
• Sem limite de mensagens
• Acesso a eventos escolares

PLANO PRO:
• Todos os benefícios do Free
• Prioridade em busca de candidatos/oportunidades
• Recursos premium (quando implementados)
• Suporte prioritário

Para Ativar Pro:
1. Acesse "Configurações"
2. Selecione "Pro" na seção de planos
3. Cadastre um método de pagamento (cartão de crédito)
4. Clique em "ATIVAR PRO"

Requisito: Deve haver pelo menos 1 cartão cadastrado antes de ativar Pro.

═══════════════════════════════════════════════════════════════════════════════

24 ENCERRAR SESSÃO

Para sair do sistema:
1. Clique no menu "hambúrguer" (canto superior esquerdo)
2. Clique em "SAIR" ou "Logout"
3. Você será redirecionado para a tela de login

Sua sessão será encerrada e você precisará fazer login novamente para acessar o sistema.

═══════════════════════════════════════════════════════════════════════════════

25 DICAS E BOAS PRÁTICAS

Segurança:
• Use uma senha forte que você não utilize em outros sites
• Altere sua senha regularmente
• Não compartilhe suas credenciais com outras pessoas
• Saia do sistema ao usar computadores públicos

Perfil:
• Mantenha seus dados atualizados para melhor comunicação
• Use uma foto de perfil clara e profissional
• Escreva uma descrição atrativa em seu portfólio

Mensagens:
• Responda as mensagens com educação e profissionalismo
• Seja claro e objetivo ao descrever oportunidades ou interesse
• Não compartilhe informações sensíveis por mensagem

Oportunidades:
• Leia com atenção os requisitos da oportunidade antes de aplicar
• Prepare uma boa carta de apresentação ao candidatar-se
• Verifique as datas de início e término do projeto

═══════════════════════════════════════════════════════════════════════════════

26 SUPORTE

Caso tenha dúvidas, problemas ou sugestões sobre o sistema:

E-mail de Suporte:
suporte@trampoff.com

WhatsApp:
(11) 9999-9999

Responsável Técnico:
Grupohelio Dev

Horário de Atendimento:
Segunda a Sexta: 09:00 às 18:00
Sábado: 09:00 às 13:00

Time de Desenvolvimento:
Daniella da Silva Pereira
Fabricio Teixeira Bezerra
Mariana Martins Coutinho
Ryan Soares Guimarães do Nascimento

═══════════════════════════════════════════════════════════════════════════════

27 GLOSSÁRIO

API - Interface de Programação de Aplicativos
PWA - Progressive Web App (Aplicativo Web Progressivo)
CNPJ - Cadastro Nacional da Pessoa Jurídica
CPF - Cadastro de Pessoas Física
Backend - Sistema que processa dados nos servidores
Frontend - Interface que você vê no navegador
Employer - Empregador (escola/empresa)
Freelancer - Profissional independente/aluno
Token - Identificação de sessão
Cache - Armazenamento de dados locais
Modal - Janela pop-up sobreposta na página
Badge - Pequeno ícone com notificação

═══════════════════════════════════════════════════════════════════════════════

28 INFORMAÇÕES TÉCNICAS

Sistema: Trampoff v1.0
Frontend: React + Vite
Backend: Node.js + Express
Banco de Dados: JSON (localStorage) / MongoDB/Firebase
Hospedagem: Vercel (frontend) / Render ou similar (backend)
Browser Suportados: Chrome, Firefox, Safari, Edge (versões atuais)
Dispositivos: Desktop, Tablet, Mobile (responsivo)

═══════════════════════════════════════════════════════════════════════════════

VERSÃO 1.0 - DEZEMBRO DE 2025

Desenvolvido com 💚 pela Equipe Grupohelio Dev
