Perfeito 👌  
Agora vamos ao **Capítulo 7 — Criação de usuários e configuração do acesso ao banco de dados PostgreSQL**,  
essencial para dar permissões ao Django (via `DATABASE_URL`) e para o agente AI acessar o banco em modo **read‑only** com segurança.

---

# 📘 CAPÍTULO 7 — Criação de usuário PostgreSQL (`createuser`)

> ⚙️ **Objetivo:** criar usuários e permissões no PostgreSQL de forma segura,  
> garantindo que o Django tenha acesso total e a IA apenas leitura.

---

## 🧾 1. Abrir o cliente PostgreSQL (Windows 11)

Se o PostgreSQL estiver instalado, abra o terminal **PowerShell** ou **CMD** e inicie o cliente:

```powershell
psql -U postgres
```

> 🔐 O usuário `postgres` é o superusuário padrão.  
> Digite a senha configurada na instalação (ou use pgAdmin se preferir interface GUI).

📘 **Documentação:**
> **Passo 33:** Acesso ao console PSQL utilizando o superusuário, pré‑requisito para criar novos usuários.

---

## 🧱 2. Criar o banco de dados do projeto

Dentro do console `psql`:

```sql
CREATE DATABASE natura_inventory;
```

📘 **Documentação:**
> **Passo 34:** Cria banco de dados principal `natura_inventory` para armazenar produtos, estoque e histórico de IA.

---

## 👤 3. Criar o usuário do Django (aplicação principal)

```sql
CREATE USER natura_admin WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE natura_inventory TO natura_admin;
```

📘 **Documentação:**
> **Passo 35:** Cria o usuário `natura_admin`, usado pelo Django, com privilégios completos.  
> A senha deve ser forte (alfa‑numérica + símbolos).

---

## 🙈 4. Criar o usuário Read‑Only (IA)

```sql
CREATE USER natura_ai WITH PASSWORD 'leitura_segura';
GRANT CONNECT ON DATABASE natura_inventory TO natura_ai;
```

Depois, acesse o banco e dê permissão de leitura em todas as tabelas:

```sql
\c natura_inventory
GRANT USAGE ON SCHEMA public TO natura_ai;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO natura_ai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO natura_ai;
```

📘 **Documentação:**
> **Passo 36:** Criação de usuário `natura_ai` com permissão `SELECT` para segurança da IA, garantindo que não execute `INSERT/UPDATE/DELETE`.

---

## ⚙️ 5. Atualizar `settings.py` para Django

Abra o arquivo `backend/core/settings.py` e adicione a configuração do banco:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'natura_inventory',
        'USER': 'natura_admin',
        'PASSWORD': 'senha_segura',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# URL completa (para LangChain)
DATABASE_URL = "postgresql+psycopg2://natura_ai:leitura_segura@localhost:5432/natura_inventory"
```

📘 **Documentação:**
> **Passo 37:** Aponta o Django para o banco utilizando o usuário administrador,  
> e configura `DATABASE_URL` para que o módulo IA use o usuário restrito `natura_ai`.

---

## 🧪 6. Testar conexão

Com o ambiente virtual ativo:

```powershell
python manage.py migrate
python manage.py runserver
```

Se as migrações forem aplicadas sem erro, o acesso do Django ao banco está funcional.

📘 **Documentação:**
> **Passo 38:** Testa a conexão entre Django e PostgreSQL via usuário configurado.

---

## ☑️ Status Atual do Banco de Dados

| Usuário | Função | Permissão | Utilizado por |
|----------|---------|-----------|---------------|
| **natura_admin** | Principal do app | ALL PRIVILEGES | Django ORM / Admin |
| **natura_ai** | Assistente IA | Read‑Only (SELECT) | LangChain SQL Agent |

---

## 🧾 Adição à Documentação

Gravar todas as etapas acima em `docs/DATABASE.md`:

```powershell
echo. > docs/DATABASE.md
notepad docs/DATABASE.md
```

Incluir os passos 33 → 38.

📘 **Documentação:**
> Arquivo `DATABASE.md` contém procedimentos de criação de usuários, permissões e configuração para integração Django + LangChain com PostgreSQL.

---

✅ **Tudo pronto para o banco!**

Quer que o próximo passo seja o **Capítulo 8 — Integração Frontend ↔ Backend** (React ChatAssistant chamando `/api/chat/ask/` com loading, erros e salvando histórico)?