import { useState, useEffect } from "preact/hooks";
import { Key, Lock, Eye, EyeOff, Check, X, AlertTriangle } from "lucide-react";

export default function ApiKeyManager({ isOpen, onClose }) {
  const [deepseekKey, setDeepseekKey] = useState(() => {
    return localStorage.getItem("user_deepseek_key") || "";
  });

  const [perplexityKey, setPerplexityKey] = useState(() => {
    return localStorage.getItem("user_perplexity_key") || "";
  });

  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [showPerplexityKey, setShowPerplexityKey] = useState(false);
  const [deepseekStatus, setDeepseekStatus] = useState(null); // null, 'valid', 'invalid'
  const [perplexityStatus, setPerplexityStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // When key changes, reset validation status
    setDeepseekStatus(null);
  }, [deepseekKey]);

  useEffect(() => {
    setPerplexityStatus(null);
  }, [perplexityKey]);

  const handleSaveKeys = () => {
    if (deepseekKey) {
      localStorage.setItem("user_deepseek_key", deepseekKey);
    } else {
      localStorage.removeItem("user_deepseek_key");
    }

    if (perplexityKey) {
      localStorage.setItem("user_perplexity_key", perplexityKey);
    } else {
      localStorage.removeItem("user_perplexity_key");
    }

    onClose();
  };

  const handleTestDeepseekKey = async () => {
    if (!deepseekKey.trim()) return;

    setIsTesting(true);
    setDeepseekStatus(null);

    try {
      const response = await fetch("/api/test-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: deepseekKey,
          provider: "deepseek",
        }),
      });

      if (response.ok) {
        setDeepseekStatus("valid");
      } else {
        setDeepseekStatus("invalid");
      }
    } catch (error) {
      console.error("Error testing Deepseek API key:", error);
      setDeepseekStatus("invalid");
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestPerplexityKey = async () => {
    if (!perplexityKey.trim()) return;

    setIsTesting(true);
    setPerplexityStatus(null);

    try {
      const response = await fetch("/api/test-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: perplexityKey,
          provider: "perplexity",
        }),
      });

      if (response.ok) {
        setPerplexityStatus("valid");
      } else {
        setPerplexityStatus("invalid");
      }
    } catch (error) {
      console.error("Error testing Perplexity API key:", error);
      setPerplexityStatus("invalid");
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="api-key-manager">
      <div className="api-key-manager__overlay" onClick={onClose}></div>
      <div className="api-key-manager__container">
        <div className="api-key-manager__header">
          <h2>
            <Key size={20} />
            AI API Keys
          </h2>
          <button className="api-key-manager__close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="api-key-manager__content">
          <p className="api-key-manager__description">
            To use the AI features, you need to provide your own API keys. Your
            keys are stored locally in your browser and never sent to our
            servers.
          </p>

          <div className="api-key-manager__key-section">
            <h3>Deepseek API Key</h3>
            <p className="api-key-manager__provider-info">
              Used for team generation and chat features. Get a key at{" "}
              <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://platform.deepseek.com/
              </a>
            </p>

            <div className="api-key-manager__input-container">
              <input
                type={showDeepseekKey ? "text" : "password"}
                value={deepseekKey}
                onInput={(e) => setDeepseekKey(e.target.value)}
                placeholder="Enter your Deepseek API key"
                className="api-key-manager__input"
              />
              <button
                className="api-key-manager__toggle-visibility"
                onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                type="button"
              >
                {showDeepseekKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                className="api-key-manager__test-button"
                onClick={handleTestDeepseekKey}
                disabled={!deepseekKey.trim() || isTesting}
                type="button"
              >
                Test
              </button>
            </div>

            {deepseekStatus === "valid" && (
              <div className="api-key-manager__status api-key-manager__status--valid">
                <Check size={16} /> Valid API key
              </div>
            )}

            {deepseekStatus === "invalid" && (
              <div className="api-key-manager__status api-key-manager__status--invalid">
                <AlertTriangle size={16} /> Invalid API key
              </div>
            )}
          </div>

          <div className="api-key-manager__key-section">
            <h3>Perplexity API Key</h3>
            <p className="api-key-manager__provider-info">
              Used for team generation with Sonar model. Get a key at{" "}
              <a
                href="https://docs.perplexity.ai/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.perplexity.ai/
              </a>
            </p>

            <div className="api-key-manager__input-container">
              <input
                type={showPerplexityKey ? "text" : "password"}
                value={perplexityKey}
                onInput={(e) => setPerplexityKey(e.target.value)}
                placeholder="Enter your Perplexity API key"
                className="api-key-manager__input"
              />
              <button
                className="api-key-manager__toggle-visibility"
                onClick={() => setShowPerplexityKey(!showPerplexityKey)}
                type="button"
              >
                {showPerplexityKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                className="api-key-manager__test-button"
                onClick={handleTestPerplexityKey}
                disabled={!perplexityKey.trim() || isTesting}
                type="button"
              >
                Test
              </button>
            </div>

            {perplexityStatus === "valid" && (
              <div className="api-key-manager__status api-key-manager__status--valid">
                <Check size={16} /> Valid API key
              </div>
            )}

            {perplexityStatus === "invalid" && (
              <div className="api-key-manager__status api-key-manager__status--invalid">
                <AlertTriangle size={16} /> Invalid API key
              </div>
            )}
          </div>
        </div>

        <div className="api-key-manager__footer">
          <button
            className="api-key-manager__save-button"
            onClick={handleSaveKeys}
          >
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );
}
