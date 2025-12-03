-- 1. CRIAÇÃO DO BANCO DE DADOS
DROP DATABASE IF EXISTS freelas;
CREATE DATABASE freelas;
USE freelas;

-- 2. CRIAÇÃO DAS TABELAS

CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100),
    nome VARCHAR(100),
    senha VARCHAR(100),
    tipo ENUM('freelancer', 'contratante'),
    data_criacao DATE,
    -- Novos campos adicionados para atender CPF e CNPJ
    documento VARCHAR(20),       -- Cabe CPF (14 chars) ou CNPJ (18 chars)
    tipo_pessoa ENUM('PF', 'PJ') -- Ajuda a identificar o tipo de documento
);

CREATE TABLE portfolio (
    id_portfolio INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100),
    descricao TEXT,
    link_projeto VARCHAR(255)
);

CREATE TABLE freelancer (
    id_usuario INT PRIMARY KEY, -- A chave primária é também Estrangeira de usuario
    experiencia TEXT,
    habilidades TEXT,
    descricao TEXT,
    id_portfolio INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_portfolio) REFERENCES portfolio(id_portfolio)
);

CREATE TABLE contratante (
    id_usuario INT PRIMARY KEY, -- A chave primária é também Estrangeira de usuario
    descricao TEXT,
    nome_empresa VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE projeto (
    id_projeto INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100),
    descricao TEXT,
    requisitos TEXT,
    orcamento DECIMAL(10,2),
    prazo DATE,
    data_criacao DATE,
    id_contratante INT,
    FOREIGN KEY (id_contratante) REFERENCES contratante(id_usuario)
);

CREATE TABLE proposta (
    id_proposta INT PRIMARY KEY AUTO_INCREMENT,
    id_freelancer INT,
    id_projeto INT,
    mensagem TEXT,
    valor DECIMAL(10,2),
    prazo DATE,
    data_envio DATE,
    status ENUM('pendente','aceita','recusada'),
    FOREIGN KEY (id_freelancer) REFERENCES freelancer(id_usuario),
    FOREIGN KEY (id_projeto) REFERENCES projeto(id_projeto)
);

CREATE TABLE avaliacao (
    id_avaliacao INT PRIMARY KEY AUTO_INCREMENT,
    projeto_id INT,
    id_avaliador INT,
    id_avaliado INT,
    tipo ENUM('Projeto','Freelancer','Contratante'),
    nota INT,
    comentario TEXT,
    data_avaliacao DATE,
    FOREIGN KEY (projeto_id) REFERENCES projeto(id_projeto),
    FOREIGN KEY (id_avaliador) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_avaliado) REFERENCES usuario(id_usuario)
);

CREATE TABLE localizacao (
    id_localizacao INT PRIMARY KEY AUTO_INCREMENT,
    numero INT,
    rua VARCHAR(100),
    bairro VARCHAR(100),
    cep VARCHAR(20),
    cidade VARCHAR(50),
    estado VARCHAR(50),
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

CREATE TABLE mensagem (
    id_mensagem INT PRIMARY KEY AUTO_INCREMENT,
    id_remetente INT,
    id_destinatario INT,
    mensagem TEXT,
    data_envio DATETIME,
    FOREIGN KEY (id_remetente) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_destinatario) REFERENCES usuario(id_usuario)
);

-- 3. INSERÇÃO DE DADOS (POPULANDO O BANCO)

-- --- PASSO A: Criar um FREELANCER (Pedro) ---

-- 1º Criamos um portfólio para ele (pois a tabela freelancer pede isso)
INSERT INTO portfolio (titulo, descricao, link_projeto) 
VALUES ('E-commerce React', 'Loja virtual completa', 'github.com/pedro/shop');

-- 2º Criamos o usuário base (Dados de Login + CPF)
INSERT INTO usuario (email, nome, senha, tipo, data_criacao, documento, tipo_pessoa) 
VALUES ('pedro@email.com', 'Pedro Silva', 'senha123', 'freelancer', CURDATE(), '431.562.628-70', 'PF');

-- 3º Criamos os detalhes na tabela freelancer 
-- (Usamos o ID 1 pois é o primeiro usuário inserido e o ID 1 do portfolio)
INSERT INTO freelancer (id_usuario, experiencia, habilidades, descricao, id_portfolio)
VALUES (1, 'Júnior', 'HTML, CSS, JavaScript', 'Desenvolvedor Front-end focado em React', 1);


-- --- PASSO B: Criar uma EMPRESA (Tech Solutions) ---

-- 1º Criamos o usuário base (Dados de Login + CNPJ)
INSERT INTO usuario (email, nome, senha, tipo, data_criacao, documento, tipo_pessoa) 
VALUES ('contato@techsolutions.com', 'Tech Solutions Ltda', 'senha456', 'contratante', CURDATE(), '12.345.678/0001-99', 'PJ');

-- 2º Criamos os detalhes na tabela contratante
-- (Usamos o ID 2 pois é o segundo usuário inserido)
INSERT INTO contratante (id_usuario, descricao, nome_empresa)
VALUES (2, 'Empresa de desenvolvimento de software corporativo', 'Tech Solutions');

-- --- TESTE RÁPIDO: A Empresa cria um projeto ---
INSERT INTO projeto (titulo, descricao, requisitos, orcamento, prazo, data_criacao, id_contratante)
VALUES ('Landing Page Institucional', 'Site simples de uma página', 'HTML, CSS', 1500.00, '2023-12-30', CURDATE(), 2);