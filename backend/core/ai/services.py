import re
from django.conf import settings
from langchain_community.llms import Ollama
from langchain_community.utilities.sql_database import SQLDatabase
from langchain_core.prompts import PromptTemplate

# Prompt APENAS para gerar SQL (Focado e técnico)
SQL_GENERATION_PROMPT = """
Você é um especialista em SQL PostgreSQL.
Dada uma pergunta, escreva APENAS a query SQL para respondê-la.
NÃO explique nada. NÃO use markdown. Apenas o código SQL puro.

Tabelas:
- inventory_product (id, name, category, price)
- inventory_inventory (id, product_id, quantity, location)

Regras:
1. Use ILIKE para buscas de texto (ex: name ILIKE '%Kaiak%').
2. Retorne colunas úteis (nome, preço, quantidade).
3. Limite a 5 resultados.

Pergunta: {question}
SQL:
"""

# Prompt para explicar o resultado (Humano e natural)
EXPLAIN_RESULT_PROMPT = """
Você é um assistente de estoque da Natura.
Com base nos dados abaixo, responda a pergunta do usuário em Português.
Se os dados estiverem vazios, diga "Não encontrei nada".

Pergunta: {question}
Dados do Banco: {data}

Resposta Final (curta e direta):
"""

def query_database_with_llm(user_question: str) -> str:
    # 1. Segurança Básica
    keywords = ["estoque", "produto", "quantidade", "valor", "preço", "kaiak", "total", "tem"]
    if not any(k in user_question.lower() for k in keywords):
        return "Desculpe, só posso responder sobre dados de estoque e produtos."

    try:
        # 2. Conexão
        database_url = getattr(settings, "DATABASE_URL", None)
        if not database_url:
            return "Erro: Banco não configurado."
        
        db = SQLDatabase.from_uri(database_url)
        
        # Usamos temperatura 0 para SQL preciso
        llm_sql = Ollama(model="deepseek-r1:14b", temperature=0.0, num_ctx=4096)
        
        # Usamos temperatura um pouco maior para resposta natural
        llm_explain = Ollama(model="deepseek-r1:14b", temperature=0.3, num_ctx=4096)

        # ---------------------------------------------------------
        # PASSO 1: Gerar SQL
        # ---------------------------------------------------------
        sql_prompt = SQL_GENERATION_PROMPT.format(question=user_question)
        generated_sql = llm_sql.invoke(sql_prompt)

        # Limpeza do SQL (remove markdown ```sql ... ``` e tags de pensamento)
        clean_sql = re.sub(r'', '', generated_sql, flags=re.DOTALL)
        clean_sql = clean_sql.replace("```sql", "").replace("```", "").strip()
        
        # Segurança extra: se não começar com SELECT, aborta
        if not clean_sql.upper().startswith("SELECT"):
            return "Não consegui gerar uma consulta válida para essa pergunta."

        # ---------------------------------------------------------
        # PASSO 2: Executar SQL no Banco (Manual)
        # ---------------------------------------------------------
        try:
            result = db.run(clean_sql)
        except Exception as e:
            return f"Erro ao executar busca: {str(e)}"

        if not result or result == "[]":
            return "Não encontrei nenhum dado correspondente no sistema."

        # ---------------------------------------------------------
        # PASSO 3: Gerar Resposta Humana (Ajustado)
        # ---------------------------------------------------------
        
        # Prompt atualizado para forçar resposta conversacional
        EXPLAIN_RESULT_PROMPT = """
        Você é um assistente de estoque da Natura.
        Sua tarefa é explicar o resultado de uma consulta de banco de dados para o usuário.
        
        Pergunta do usuário: "{question}"
        Resultado Bruto do Banco: {data}
        
        Regras:
        1. NÃO responda apenas com números ou tabelas.
        2. Escreva uma frase completa em Português.
        3. Exemplo BOM: "Você tem 50 unidades de Kaiak no estoque."
        4. Exemplo RUIM: "50" ou "[(50,)]".
        
        Sua Resposta Final:
        """
        
        final_prompt = EXPLAIN_RESULT_PROMPT.format(
            question=user_question, 
            data=result
        )
        
        # Chama o LLM para explicar
        final_answer = llm_explain.invoke(final_prompt)

        # Limpeza final (remove pensamento do passo 3 e tags markdown)
        final_answer = re.sub(r'', '', final_answer, flags=re.DOTALL)
        final_answer = final_answer.replace("```", "").strip()
        
        # Se vier vazio ou muito curto, retorna algo padrão
        if len(final_answer) < 5:
             return f"Encontrei o seguinte resultado: {result}"
        
        return final_answer.strip()

    except Exception as e:
        print(f"Erro IA Backend: {e}")
        return f"Desculpe, tive um problema técnico. ({str(e)})"