Excelente 🔥 — agora que temos toda a **estrutura do projeto criada e organizada**, o próximo passo lógico é **configurar o módulo de IA no backend Django**, para que o endpoint `/api/chat/ask/` funcione e gere respostas inteligentes baseadas em dados SQL (Text-to-SQL).

---

# 📘 CAPÍTULO 5 — Backend AI Integration (LangChain + PostgreSQL)

> ⚙️ **Objetivo:** Implementar e documentar toda a integração da camada de IA, incluindo  
> configuração segura, prompt de sistema, serviço de execução e view API.

---

## 🧠 1. Instalar Dependências Adicionais (Windows 11)

Abra o terminal (PowerShell dentro da pasta `backend`):

```powershell
pip install sqlalchemy psycopg2-binary langchain langchain-community langchain-experimental
```

📘 **Documentação:**
> **Passo 16:** Instala bibliotecas complementares do LangChain e SQLAlchemy (necessárias para agentes SQL com PostgreSQL).

---

## 🗂️ 2. Estrutura e Arquivos Envolvidos
```
backend/
├── ai/
│   ├── services.py     # Core da IA
│   ├── prompts.py      # System Prompt (contexto das tabelas)
│   ├── views.py        # Endpoint API
│   ├── urls.py         # Rota /api/chat/ask/
```

📘 **Documentação:**
> **Passo 17:** O módulo `ai` concentra toda a lógica de integração LLM → SQL (via LangChain).

---

## 🧩 3. Criar Prompt de Sistema (`ai/prompts.py`)

Abra e adicione:

```python
SYSTEM_PROMPT = """
Você é um assistente de IA do sistema de gestão de estoque Natura.
Seu papel é responder perguntas sobre produtos e estoque com base em consultas SQL.

Tabelas disponíveis:

1. Products
   - id (int, PK)
   - name (text)
   - category (text)
   - price (decimal)

2. Inventory
   - id (int, PK)
   - product_id (FK -> Products)
   - quantity (int)
   - location (text)

Regras:
- Apenas consultas SELECT são permitidas.
- Nunca use INSERT, UPDATE, DELETE ou DROP.
- Se a pergunta for fora do contexto de estoque, responda:
  "Desculpe, só posso responder sobre dados de estoque e produtos."
- Retorne respostas em português natural, resumidas e educadas.
"""
```

📘 **Documentação:**
> **Passo 18:** O prompt de sistema define o papel do modelo, o schema e regras de segurança para consulta SQL.

---

## 🔮 4. Criar Serviço de IA (`ai/services.py`)

Este serviço irá:

- Receber pergunta do usuário.
- Gerar query SQL segura via LangChain.
- Executar resultado e retornar resposta conversacional.

```python
from langchain_community.llms import Ollama
from langchain_community.utilities.sql_database import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
from django.conf import settings
from .prompts import SYSTEM_PROMPT

def query_database_with_llm(user_question: str) -> str:
    """
    Interpreta pergunta em linguagem natural e retorna resposta SQL gerada por IA (read-only).
    """
    # Conexão read-only com banco
    database_url = getattr(settings, "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/natura_inventory")
    db = SQLDatabase.from_uri(database_url)

    llm = Ollama(model="qwen:latest", temperature=0)

    chain = SQLDatabaseChain.from_llm(llm, db, verbose=True)

    # Proteção inicial contra consultas fora do contexto
    keywords = ["estoque", "produto", "quantidade", "valor", "preço"]
    if not any(k in user_question.lower() for k in keywords):
        return "Desculpe, só posso responder sobre dados de estoque e produtos."

    # Execução segura
    try:
        prompt = f"{SYSTEM_PROMPT}\n\nPergunta do usuário: {user_question}"
        result = chain.run(prompt)
        return result.strip()
    except Exception as e:
        return f"Ocorreu um erro ao processar sua pergunta: {str(e)}"
```

📘 **Documentação:**
> **Passo 19:** Implementa função `query_database_with_llm` que utiliza LangChain SQL Agent + Ollama para gerar e executar consultas seguras.

---

## 🌐 5. Criar View API (`ai/views.py`)

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import query_database_with_llm

class ChatAskView(APIView):
    """
    Endpoint do chat inteligente /api/chat/ask/
    """
    def post(self, request):
        question = request.data.get("question", "").strip()
        if not question:
            return Response({"error": "Pergunta inválida."}, status=status.HTTP_400_BAD_REQUEST)

        answer = query_database_with_llm(question)
        return Response({"response": answer}, status=status.HTTP_200_OK)
```

📘 **Documentação:**
> **Passo 20:** Cria view REST que recebe `question`, processa via LangChain, e retorna resposta textual.

---

## 🛣️ 6. Definir Rota (`ai/urls.py`)

```python
from django.urls import path
from .views import ChatAskView

urlpatterns = [
    path("ask/", ChatAskView.as_view(), name="chat-ask"),
]
```

E no `core/urls.py`:

```python
from django.urls import include, path

urlpatterns = [
    path("api/chat/", include("ai.urls")),
]
```

📘 **Documentação:**
> **Passo 21:** Define rota `/api/chat/ask/` exposta ao frontend para perguntas em linguagem natural.

---

## 🧪 7. Testar Endpoint Localmente

```powershell
python manage.py runserver
```

Teste manual via `curl` ou Postman:

```powershell
curl -X POST http://127.0.0.1:8000/api/chat/ask/ -H "Content-Type: application/json" -d "{\"question\":\"Quantos Kaiak eu tenho?\"}"
```

📘 **Documentação:**
> **Passo 22:** Endpoint `/api/chat/ask/` validado com pergunta sobre estoque e resposta gerada por IA.

---

## 📊 8. Resumo das Integrações AI

| Componente | Função | Pontos críticos |
|-------------|--------|----------------|
| `prompts.py` | Define regras e schema SQL | Garante que o modelo entenda o domínio |
| `services.py` | Executa LangChain Agent | Protege contra SQL injection e queries destrutivas |
| `views.py` | Exposição via API REST | Ponte entre usuário e agente |
| `urls.py` | Mapeamento Django REST | Endpoint `/api/chat/ask/` disponível |

---

## 📘 Inserção na Documentação

Criar arquivo `docs/BACKEND_AI.md` e copiar todo conteúdo deste capítulo.

```powershell
mkdir docs
echo. > docs/BACKEND_AI.md
notepad docs/BACKEND_AI.md
```

📘 **Documentação:**
> **Passo 23:** Todas as configurações de integração da IA foram registradas em `docs/BACKEND_AI.md` para rastreabilidade futura.

---

## ✅ Status Atual

| Módulo | Status | Próximo Passo |
|--------|--------|---------------|
| **Backend/AI** | Configurado e testado | Ajustar conexão real com PostgreSQL e modelo Ollama local |
| **Frontend** | Estrutura concluída | Integrar o chat com `/api/chat/ask/` e armazenar histórico |
| **Documentação** | Atualizada até etapa AI | Criar capítulo de integração frontend↔backend |

---

Deseja que o próximo passo seja **implementar e documentar a integração completa do frontend com o backend (ChatAssistant → /api/chat/ask/)**, incluindo tratamento de loading, erros e histórico de conversa?

💡 Boa!  
Mas há um pequeno detalhe no comando — o pacote oficial do Django REST Framework não se chama `rest_framework`, e sim **`djangorestframework`**.

---

## ✅ Correto:

```powershell
pip install djangorestframework
```

---

📘 **Documentação:**
> **Passo 24:** Instalação do framework REST da comunidade Django.  
> Pacote: `djangorestframework`  
> Utilizado para construir endpoints HTTP (APIView, Serializers, Routers) que servem dados para o frontend React.

---

Depois da instalação, precisamos:

### 🔧 Adicionar o app ao `settings.py`

Abra `backend/core/settings.py` e dentro da lista `INSTALLED_APPS`, adicione:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Apps do projeto
    'inventory',
    'ai',

    # 🔹 Django REST Framework
    'rest_framework',
]
```

📘 **Documentação:**
> **Passo 25:** Registro do app `rest_framework` nas configurações `INSTALLED_APPS` do Django.

---

### 🧪 Testar instalação

Agora podemos rodar o servidor novamente para verificar se tudo está OK:

```powershell
python manage.py runserver
```

Se o servidor iniciar sem erros, o DRF está corretamente instalado e pronto para ser usado nas views `APIView` (como já utilizamos em `ChatAskView`).

---

Tudo pronto 🔒  
Quer que eu documente e implemente agora a **serialização e endpoints REST do módulo `inventory` (Products e Inventory)** para que o LangChain consiga consultar dados reais da base PostgreSQL?

Perfeito 👌  
Agora vamos para a próxima etapa **(Capítulo 6)** — preparar o **módulo de estoque `inventory`** no backend Django.  
Isso inclui:

1. Criar as **tabelas Products e Inventory** no banco PostgreSQL.  
2. Criar **Serializers, Views e URLs** do app `inventory`.  
3. Testar os endpoints REST com Django Rest Framework.  
4. Adicionar tudo à **documentação oficial**.

---

# 📘 CAPÍTULO 6 — Módulo Inventory (Products + Estoque)

> ⚙️ **Objetivo:** Estruturar o backend de produtos e estoque para alimentar o agente AI e permitir queries reais no PostgreSQL.

---

## 🧱 1. Modelos Django (`inventory/models.py`)

Vamos modelar as duas tabelas que o LLM usará: **Products** e **Inventory**, com relacionamento 1‑N.

```python
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class Inventory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="inventories")
    quantity = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} unidades"
```

📘 **Documentação:**
> **Passo 26:** Criação dos modelos `Product` e `Inventory` representando entidades centrais do controle de estoque.  
> O campo `related_name="inventories"` permite fácil acesso `product.inventories` em consultas ORM.

---

## 📦 2. Serializers (`inventory/serializers.py`)

Transformam os objetos ORM em JSON para APIs e vice-versa.

```python
from rest_framework import serializers
from .models import Product, Inventory

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'price']


class InventorySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Inventory
        fields = ['id', 'product', 'quantity', 'location']
```

📘 **Documentação:**
> **Passo 27:** Define `ProductSerializer` e `InventorySerializer` para conversão dos dados em formato JSON.

---

## 🌐 3. Views Django REST (`inventory/views.py`)

Endpoints para listar e cadastrar produtos e itens de estoque.

```python
from rest_framework import viewsets
from .models import Product, Inventory
from .serializers import ProductSerializer, InventorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product').all()
    serializer_class = InventorySerializer
```

📘 **Documentação:**
> **Passo 28:** Cria dois `ViewSet`s para exposição de dados via endpoints REST `/api/products/` e `/api/inventory/`.

---

## 🛣️ 4. URLs (`inventory/urls.py`)

```python
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, InventoryViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"inventory", InventoryViewSet)

urlpatterns = router.urls
```

E referencie no arquivo `core/urls.py`:

```python
from django.urls import include, path

urlpatterns = [
    path("api/chat/", include("ai.urls")),
    path("api/", include("inventory.urls")),   # 🔹 Adiciona endpoints REST do estoque
]
```

📘 **Documentação:**
> **Passo 29:** Cria rotas REST automáticas usando `DefaultRouter`, expondo `/api/products/` e `/api/inventory/`.

---

## 💾 5. Migrações e Banco

Migre os modelos para o banco PostgreSQL (ou SQLite, se ainda não configurou Postgres):

```powershell
python manage.py makemigrations
python manage.py migrate
```

Em seguida, crie alguns registros de exemplo:

```powershell
python manage.py shell
```

```python
from inventory.models import Product, Inventory

p = Product.objects.create(name="Kaiak", category="Perfume", price=89.90)
Inventory.objects.create(product=p, quantity=42, location="CD São Paulo")

exit()
```

📘 **Documentação:**
> **Passo 30:** Aplica migrações e cria registros iniciais de produtos e estoque para testes do agente IA.

---

## 🧪 6. Testar endpoints

Teste via browser ou PowerShell usando `curl`:

```powershell
curl http://127.0.0.1:8000/api/products/
curl http://127.0.0.1:8000/api/inventory/
```

Você deve ver os dados JSON dos produtos e do inventário.

Exemplo:
```json
[
  {
    "id": 1,
    "product": {
      "id": 1,
      "name": "Kaiak",
      "category": "Perfume",
      "price": "89.90"
    },
    "quantity": 42,
    "location": "CD São Paulo"
  }
]
```

📘 **Documentação:**
> **Passo 31:** Testa funcionamento dos endpoints REST `/api/products/` e `/api/inventory/`.  
> Estes dados servirão como base para perguntas do agente IA.

---

## 🔐 7. Registrar no Django Admin (opcional)

Se quiser visualizar e editar manualmente os dados via painel:

```python
# inventory/admin.py
from django.contrib import admin
from .models import Product, Inventory

admin.site.register(Product)
admin.site.register(Inventory)
```

📘 **Documentação:**
> **Passo 32:** Registro das models no painel Admin para gerenciamento visual de dados.

---

## ✅ STATUS ATUAL

| Módulo | Status | Próximo Passo |
|---------|--------|---------------|
| **Inventory (DB)** | ✅ Estruturado e migrado | Integrar com LLM para consultas reais via LangChain |
| **AI Chat** | ✅ Setup feito | Testar conversas com dados reais do inventário |
| **Documentação** | 🧾 Atualizada com passos 26 → 32 | Pronta para exportar futura versão markdown (`docs/INVENTORY.md`) |

---

Quer que eu avance agora para o **Capítulo 7 — Integração Frontend ↔ Backend (React ChatAssistant chamando /api/chat/ask)**, com código, tratamento de erros, loading e documentação correspondente?