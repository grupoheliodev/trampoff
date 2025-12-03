# TrampOff Frontend (React + Vite)

Aplicação SPA usada pelos contratantes e freelancers. Baseada em Vite + React com roteamento e contextos personalizados.

## Registro da Sessão – 02/12/2025 (noite)

### O que foi modificado
- Removidos todos os campos/ui de confirmação de e-mail ou confirmação de senha nos fluxos de cadastro (`pages/employer` e `pages/freelancer`).
- Adicionados botões "← Voltar" nas telas de login e `highlightLinks` agora inicia desabilitado no `AccessibilityPanel`.
- Ajustado `AuthContext` para expor valores padrão e evitar crash do `Header` quando usado fora do provider.
- Atualizado `service-worker.js` para ignorar requisições de esquemas de extensões e reduzir erros no console.
- `services/api.js`: rota de registro agora tenta o backend e cai para fallback local se o servidor estiver offline.

### O que funcionou
- Reset de senha (via modal nas telas de login) confirmou resposta do backend e já permite login com a nova credencial.
- Botões "Voltar" e preferências de acessibilidade funcionam conforme esperado após recarga (persistência em `localStorage`).
- Remoção de confirmação de e-mail/senha deixou o cadastro com uma única etapa de formulário.

### O que não funcionou (motivo)
- **Envio de e-mail**: como o backend agora apenas marca `emailVerified`, nenhum e-mail de confirmação é disparado; o usuário não recebe notificação após o cadastro.
- **Cadastro de contratantes**: com o banco indisponível, o backend não retorna os campos específicos (`companyName`, `description`), fazendo o fluxo parecer falho. Enquanto o fallback não suportar esses atributos, é preciso manter o banco ativo para cadastrar contratantes.
- **Execução em modo totalmente offline**: o frontend ainda depende do backend para persistir qualquer alteração de senha/cadastro; se o servidor não subir, o formulário mostra sucesso mas nada é salvo.

### Próximos Passos Sugeridos
1. Ajustar o fallback de login (`AuthContext`/`api.js`) para validar contra hashes ou manter ambos os campos durante a transição.
2. Expor no UI o retorno detalhado do backend (campo `updatedIn`) para facilitar o diagnóstico diretamente na tela.
3. Documentar scripts de desenvolvimento (como subir backend em modo fallback) para evitar falsas falhas.

---

Para dúvidas ou novas demandas, abra uma issue ou descreva aqui.
