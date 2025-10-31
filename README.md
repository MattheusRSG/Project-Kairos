# 🚀 Project Kairos: Plataforma de Conexão Universidade-Empresa

Este projeto é uma aplicação *full-stack* desenvolvida para conectar alunos e empresas em projetos práticos, utilizando **React.js (Vite)** no frontend e **Spring Boot (Java)** no backend, com persistência de dados gerenciada pelo **MySQL**.

---

## 🔹 Visão Geral do Stack

| Componente | Tecnologia Principal | Finalidade |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | Interface de Usuário (Single Page Application - SPA). |
| **Backend** | **Spring Boot (Java)** | Lógica de Negócio, API REST, Segurança (JWT). |
| **Banco de Dados** | **MySQL** | Persistência de dados (alunos, empresas, projetos, inscrições). |
| **Estilização** | **TailwindCSS** | Estilização utilitária e responsiva. |

---

## 🔹 Funcionalidades Principais Implementadas

O projeto inclui funcionalidades específicas para cada perfil:

| Perfil | Funcionalidades |
| :--- | :--- |
| **Geral (Deslogado)** | Visualização de projetos públicos (ativos). |
| **Aluno (`ROLE_ALUNO`)** | Visualização de todos os projetos ativos, inscrição/cancelamento de inscrição em projetos, visualização do status da candidatura (`PENDENTE`, `APROVADO`, `REJEITADO`), edição de perfil (descrição e tags de habilidade), visualização dos projetos participados. |
| **Empresa (`ROLE_EMPRESA`)** | Criação e encerramento de projetos, visualização da contagem de candidatos por projeto (aprovados vs. total), Dashboard para gerenciar candidatos, Aprovação/Declínio de candidaturas, visualização do perfil detalhado do aluno (descrição, tags e histórico de projetos). |

---

## 🔹 Estrutura de Pastas (Frontend - `src/`)

```bash
src/
├─ assets/       → Imagens, ícones e arquivos estáticos.
├─ components/   → Componentes React reutilizáveis (Navbar, Cards, LoginCard, etc.).
├─ css/          → Arquivos CSS globais (tailwind.css, projetos.css, perfil.css, etc.).
├─ pages/        → Páginas principais do sistema (ProjetosList, Perfil, EmpresaDashboard, etc.).
├─ router/       → Configuração do React Router (index.jsx), define rotas e proteções.
├─ service/      → Configuração do Axios e serviços de requisições HTTP (Base URL, Interceptors).
└─ main.jsx      → Ponto de entrada da aplicação React.
```

---

## 🚀 Guia de Configuração Completa (Full-Stack)

Para rodar o projeto localmente, você precisa configurar o ambiente backend (Java/MySQL) e o ambiente frontend (Node/React).

---

### 1️⃣ Configuração do Backend e Banco de Dados

**Requisitos:**  
Certifique-se de ter o **Java Development Kit (JDK 24+)**, **Maven** e um servidor **MySQL** rodando.

#### 🛠️ Configuração do MySQL
Crie um banco de dados vazio:
```sql
CREATE DATABASE kairos_db;
```

#### ⚙️ Configuração do Spring Boot

1. Abra o projeto backend no seu IDE (IntelliJ, VS Code, Eclipse, etc.).
2. Localize o arquivo de configuração (`application.properties` ou `application.yml`).
3. Ajuste as credenciais do banco de dados conforme seu ambiente:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/kairos_db
spring.datasource.username=seu_usuario_mysql
spring.datasource.password=sua_senha_mysql
spring.jpa.hibernate.ddl-auto=update  # Permite que o Hibernate crie as tabelas
spring.jpa.show-sql=true
server.port=8081
```

#### ▶️ Inicie o Backend

Execute o projeto usando Maven:

```bash
./mvnw spring-boot:run
```

O backend deverá iniciar na porta **8081** (ou conforme configurado).

---

### 2️⃣ Configuração e Inicialização do Frontend (React)

#### 🔧 Clonar ou Fazer Fork

- **FAZER FORK:** Se você pretende contribuir:

  ```bash
  git clone https://github.com/ThiagoRAlmeida2/Project-Kairos
  ```

- **CLONAR:** Caso contrário, clone o repositório principal.

#### 📂 Acesse a pasta do frontend

```bash
cd Project-Kairos
```

#### 📦 Instale as dependências

```bash
npm install
```

#### ▶️ Inicie o servidor de desenvolvimento (Vite)

```bash
npm run dev
```

#### 🌐 Acesse no navegador

[http://localhost:5173/](http://localhost:5173/)

---

## 🧩 Tecnologias Complementares

- **Axios:** comunicação entre frontend e backend.
- **React Router DOM:** gerenciamento de rotas.
- **JWT (JSON Web Token):** autenticação e controle de acesso.
- **Spring Security:** segurança da API.
- **Lombok:** redução de boilerplate no backend.
- **TailwindCSS:** design responsivo e moderno.

---

## 💡 Contribuição

1. Faça um **Fork** do projeto.
2. Crie uma **branch** para sua feature:

   ```bash
   git checkout -b feature/nome-da-feature
   ```

3. Faça o commit das suas alterações:

   ```bash
   git commit -m "Adiciona nova feature"
   ```

4. Envie para o repositório remoto:

   ```bash
   git push origin feature/nome-da-feature
   ```

5. Abra um **Pull Request**.

---

### 👨‍💻 Autor

**Thiago Ribeiro**  
💼 Projeto desenvolvido como parte da integração entre **universidade e empresas**, promovendo aprendizado prático e inovação colaborativa.