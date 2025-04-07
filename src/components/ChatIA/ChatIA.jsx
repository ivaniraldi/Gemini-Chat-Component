
import { useEffect, useRef, useState } from "react";

const App = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatEndRef = useRef(null);
  const apiKey = import.meta.env.VITE_API_KEY;

  // Prompt oculto para IA
  const systemPrompt =
    "Responde como un agente profesional de atención al cliente. Sé conciso, educado y claro, utilizando un lenguaje neutro y profesional.";

  // Entrada y teclado
  const handleInputChange = (e) => setInput(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") enviarMensaje();
    if (e.key === "Escape") setIsOpen(false);
  };

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nUsuario: ${userMsg.text}` },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
      const botMsg = { role: "bot", text };
      setChat((prev) => [...prev, botMsg]);

      if (!isOpen) setHasNewMessage(true);
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "Error al responder." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Escape para cerrar
  useEffect(() => {
    const escHandler = (e) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", escHandler);
    return () => window.removeEventListener("keydown", escHandler);
  }, []);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewMessage(false);
        }}
        className="fixed bottom-4 right-4 bg-[#2c2c2c] text-white px-4 py-3 rounded-full shadow-md hover:scale-105 transition-all z-50"
      >
        💬
        {hasNewMessage && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#aaa] text-black text-[10px] rounded-full flex items-center justify-center animate-pingOnce">
            !
          </span>
        )}
      </button>

      {/* Modal chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-[90vw] max-w-sm h-[70vh] bg-[#1a1a1a] text-white rounded-xl border border-[#333] flex flex-col shadow-lg z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3 bg-[#222] border-b border-[#333] flex justify-between items-center text-sm font-semibold">
            Asistente Virtual
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-lg font-bold hover:text-gray-400"
            >
              ×
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-3 overflow-y-auto overflow-x-hidden space-y-3 text-sm bg-[#1a1a1a] custom-scroll">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-md leading-snug whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ml-auto bg-[#444] animate-slideInRight"
                    : "mr-auto bg-[#333] animate-slideInLeft"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-500 animate-pulse">
                Escribiendo...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-[#333] bg-[#222] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-[#111] text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#555]"
            />
            <button
              onClick={enviarMensaje}
              disabled={loading}
              className="bg-[#444] hover:bg-[#555] px-4 py-2 rounded-md text-white text-sm transition disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* CSS embebido */}
      <style>{`
  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
  }
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out;
  }
  .animate-slideInLeft {
    animation: slideInLeft 0.3s ease-out;
  }
  .animate-pingOnce {
    animation: pingOnce 1s ease-out;
  }

  /* Estilos personalizados para el scroll */
  .custom-scroll::-webkit-scrollbar {
    width: 8px; /* Ancho del scroll */
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: #1a1a1a; /* Fondo del track igual al contenedor */
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #444; /* Color del thumb (barra) */
    border-radius: 4px; /* Bordes redondeados */
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #555; /* Color al pasar el mouse */
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pingOnce {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.6; }
    100% { transform: scale(1); opacity: 1; }
  }
`}</style>
    </>
  );
};

export default App;
