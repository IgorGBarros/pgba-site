from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import query_database_with_llm  # Importa a função real da IA

class ChatAskView(APIView):
    """
    Recebe perguntas do usuário e responde via LLM + PostgreSQL.
    """
    def post(self, request):
        # 1. Obtém a pergunta do corpo da requisição
        question = request.data.get("question", "").strip()

        # 2. Validação básica
        if not question:
            return Response(
                {"error": "Pergunta inválida ou vazia."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 3. Chama o serviço de IA real (LangChain + Ollama)
            answer = query_database_with_llm(question)

            # 4. Retorna a resposta gerada
            return Response({"response": answer}, status=status.HTTP_200_OK)

        except Exception as e:
            # 5. Tratamento de erro genérico
            return Response(
                {"error": f"Ocorreu um erro ao processar sua pergunta: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )