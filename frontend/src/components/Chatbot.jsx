import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! Je suis votre assistant E-ACT. Posez-moi vos questions sur les procédures d'état civil." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot", { message: text });
      setMessages(prev => [...prev, { role: "assistant", text: res.data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Erreur de connexion à l'assistant.";
      setMessages(prev => [...prev, { role: "assistant", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "52px", height: "52px", borderRadius: "50%",
          backgroundColor: "#0d6efd", color: "white", border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 2000,
          fontSize: "20px", cursor: "pointer",
        }}
        title="Assistant IA"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Panneau de chat */}
      {open && (
        <div style={{
          position: "fixed", bottom: "86px", right: "24px",
          width: "340px", height: "460px",
          backgroundColor: "#fff", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column",
          zIndex: 1999, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: "#0d6efd", color: "white",
            padding: "12px 16px", fontWeight: "bold", fontSize: "14px",
          }}>
            🤖 Assistant E-ACT
            <span style={{ fontSize: "11px", fontWeight: "normal", marginLeft: "8px", opacity: 0.8 }}>
              Procédures d'état civil
            </span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                backgroundColor: m.role === "user" ? "#0d6efd" : "#f1f3f5",
                color: m.role === "user" ? "white" : "#212529",
                borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                padding: "8px 12px", fontSize: "13px", lineHeight: "1.4",
                whiteSpace: "pre-wrap",
              }}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", color: "#888", fontSize: "12px" }}>
                ✦ En cours de réflexion…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px", borderTop: "1px solid #dee2e6", display: "flex", gap: "6px" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Votre question…"
              rows={2}
              style={{
                flex: 1, resize: "none", border: "1px solid #ced4da",
                borderRadius: "8px", padding: "6px 10px", fontSize: "13px",
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: "#0d6efd", color: "white", border: "none",
                borderRadius: "8px", padding: "0 12px", cursor: "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
