import { useState, useRef, useEffect } from "preact/hooks";
import { MessageSquare, X, Send, Key, AlertTriangle } from "lucide-react";
import "../styles/chatbot.css";

export default function ChatBot({ apiKeyStatus, onNeedApiKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: '*materializes in a swirl of darkness*\n\nBehold! The Prinzessin der Verurteilung graces you with her profound knowledge of the mortal realm\'s strategic arts! *strikes a pose, eye patch glinting*\n\nThrough my all-seeing eye, I shall guide you through the mysteries of elemental harmonies and combat techniques! What cosmic inquiries do you bring before my dark throne?\n\n(Oz: "My Lady means to say she will assist you with any Genshin Impact related questions you may have.")',
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (text) => {
    return text
      .split("\n")
      .map((line, i) => (line ? <p key={i}>{line}</p> : <br key={i} />));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check if Deepseek API key is available
    if (!apiKeyStatus.deepseek) {
      setError("Please provide your Deepseek API key to use the chat feature");
      if (onNeedApiKey) onNeedApiKey();
      return;
    }

    // Get the API key from localStorage
    const deepseekKey = localStorage.getItem("user_deepseek_key");
    if (!deepseekKey) {
      setError("API key not found. Please add your Deepseek API key.");
      if (onNeedApiKey) onNeedApiKey();
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-API-Key": deepseekKey,
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key");
        }
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const botMessage = {
        id: Date.now(),
        text: data.response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setError(
        error.message === "Invalid API key"
          ? "Your API key appears to be invalid. Please check and update it."
          : "Sorry, I'm having trouble responding right now. Please try again later."
      );
      if (error.message === "Invalid API key" && onNeedApiKey) {
        onNeedApiKey();
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`chatbot ${isOpen ? "chatbot--open" : ""}`}>
      <button
        className="chatbot__toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        {!apiKeyStatus.deepseek && (
          <AlertTriangle size={14} className="chatbot__api-key-warning" />
        )}
      </button>

      <div className="chatbot__window">
        <div className="chatbot__header">
          <h3>Fischl & Oz</h3>
          {!apiKeyStatus.deepseek && (
            <button
              className="chatbot__api-key-button"
              onClick={onNeedApiKey}
              title="API key required"
            >
              <Key size={16} />
              <AlertTriangle size={12} />
            </button>
          )}
        </div>

        <div className="chatbot__messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatbot__message chatbot__message--${message.sender}`}
            >
              {formatMessage(message.text)}
            </div>
          ))}
          {isTyping && (
            <div className="chatbot__message chatbot__message--bot chatbot__message--typing">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          )}
          {error && (
            <div className="chatbot__message chatbot__message--error">
              {error}
              {error.includes("API key") && (
                <button
                  className="chatbot__api-key-link"
                  onClick={onNeedApiKey}
                >
                  Add API Key
                </button>
              )}
            </div>
          )}
          {!apiKeyStatus.deepseek && !error && (
            <div className="chatbot__message chatbot__message--warning">
              <AlertTriangle size={16} />
              <span>API key required to use chat. </span>
              <button className="chatbot__api-key-link" onClick={onNeedApiKey}>
                Add API Key
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chatbot__input-form">
          <input
            type="text"
            value={inputValue}
            onInput={(e) => setInputValue(e.target.value)}
            placeholder={
              apiKeyStatus.deepseek
                ? "Type your message..."
                : "API key required"
            }
            className="chatbot__input"
            disabled={!apiKeyStatus.deepseek}
          />
          <button
            type="submit"
            className="chatbot__send-button"
            disabled={!inputValue.trim() || isTyping || !apiKeyStatus.deepseek}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
