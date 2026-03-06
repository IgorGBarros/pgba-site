import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { api } from "../services/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Quantos Kaiak eu tenho?",
  "Quais produtos estão acabando?",
  "Qual o valor total do estoque?",
  "Quais os mais vendidos?",
];

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const data = localStorage.getItem("chatHistory");
      if (data) return JSON.parse(data).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch (_) {}
    // Mensagem inicial de boas‑vindas
    return [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Olá! 👋 Sou seu assistente de estoque Natura. Pergunte sobre quantidades, valores ou produtos em falta!",
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

   const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    // Adiciona mensagem do usuário
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Enviando pergunta:", msg); // DEBUG
      
      const res = await api.post("chat/ask/", { question: msg });
      
      console.log("Resposta do Backend:", res.data); // DEBUG - Olhe no Console do navegador (F12)

      // Garante que pegamos o texto, mesmo se vier em estrutura diferente
      const answerText = res.data.response || JSON.stringify(res.data);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: answerText, // Usa a variável garantida
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "⚠️ Ocorreu um erro ao contatar o assistente IA.",
          timestamp: new Date(),
        },
      ]);
    }
    setIsLoading(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Janela do chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between bg-primary px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">Assistente Natura</p>
                  <p className="text-xs text-primary-foreground/70">Estoque inteligente</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-chat-user text-chat-user-foreground rounded-br-md"
                        : "bg-chat-assistant text-chat-assistant-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1" : ""}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  {msg.role === "user" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-3.5 w-3.5 text-secondary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading */}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex gap-1 rounded-2xl bg-chat-assistant px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 animation-delay-[0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 animation-delay-[150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 animation-delay-[300ms]" />
                  </div>
                </motion.div>
              )}

              {/* Sugestões iniciais */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Campo de entrada */}
            <div className="border-t border-border bg-card p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Pergunte sobre seu estoque..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};