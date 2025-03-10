import { useState } from "preact/hooks";
import { AlertTriangle, Check } from "lucide-react";
import "../styles/model-selector.css";

export default function ModelSelector({ model, onModelChange, apiKeyStatus }) {
  // Define model options with information about API keys
  const modelOptions = [
    {
      value: "deepseek-chat",
      label: "DeepSeek Chat",
      apiKeyName: "deepseek",
      description: "DeepSeek's general-purpose large language model",
    },
    {
      value: "sonar",
      label: "Perplexity Sonar",
      apiKeyName: "perplexity",
      description: "Perplexity's advanced model with improved context handling",
    },
  ];

  return (
    <div className="model-selector">
      <select
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        className="model-selector__dropdown"
      >
        {modelOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}{" "}
            {apiKeyStatus && !apiKeyStatus[option.apiKeyName]
              ? "(API key required)"
              : ""}
          </option>
        ))}
      </select>

      {apiKeyStatus && (
        <div className="model-selector__selected-info">
          {(() => {
            const selectedModel = modelOptions.find((m) => m.value === model);
            const hasKey = apiKeyStatus[selectedModel.apiKeyName];

            return (
              <div
                className={`model-selector__key-status ${
                  hasKey
                    ? "model-selector__key-status--valid"
                    : "model-selector__key-status--invalid"
                }`}
              >
                {hasKey ? (
                  <>
                    <Check size={14} />
                    <span>
                      {selectedModel.apiKeyName.charAt(0).toUpperCase() +
                        selectedModel.apiKeyName.slice(1)}{" "}
                      API key set
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} />
                    <span>
                      {selectedModel.apiKeyName.charAt(0).toUpperCase() +
                        selectedModel.apiKeyName.slice(1)}{" "}
                      API key required
                    </span>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
