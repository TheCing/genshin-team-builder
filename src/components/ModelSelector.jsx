import { useState } from "preact/hooks";

export default function ModelSelector({ model, onModelChange }) {
  return (
    <div className="model-selector">
      <select
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        className="model-selector__dropdown"
      >
        <option value="deepseek-chat">DeepSeek Chat</option>
        <option value="sonar">Perplexity Sonar</option>
      </select>
    </div>
  );
}
