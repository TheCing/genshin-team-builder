# ★ Genshin Impact Team Builder

> *A sophisticated web application for creating, managing, and generating optimal team compositions for Genshin Impact*

## ✧ Overview

The Genshin Impact Team Builder is an interactive web tool designed to help players create and manage team compositions for the popular open-world RPG game, Genshin Impact. Leveraging AI technology and a user-friendly interface, this application streamlines the process of building effective teams based on character synergies, elemental reactions, and gameplay mechanics.

## ⚙ Features

### ⚔ Team Building

- **Character Selection**: Browse and select from all available Genshin Impact characters
- **Drag & Drop Interface**: Intuitive drag-and-drop functionality for adding characters to team slots
- **Team Management**: Save, edit, and delete custom team compositions
- **Elemental Resonance**: Real-time display of elemental resonance effects for your current team
- **Character Ownership Tracking**: Mark characters you own for easier team building

### ※ AI-Powered Assistance

- **AI Team Generation**: Generate optimal team compositions based on your preferences using advanced AI models
- **Character Synergy Analysis**: Get insights on character synergies and team effectiveness
- **Multiple AI Models**: Choose between different AI models for team generation

### ♦ Interactive Chat Assistant

- **Fischl-themed Chatbot**: Get help and advice from an in-character Fischl & Oz assistant
- **Game Mechanics Guidance**: Learn about game mechanics, elemental reactions, and build recommendations
- **Team Building Advice**: Receive personalized suggestions for your team compositions

### ◇ Customization

- **Background Selection**: Choose from various background images to personalize your experience
- **Data Management**: Export and import your data for backup or transfer

## ► Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/genshin-team-builder.git
   cd genshin-team-builder
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

4. Start the development server:

   ```
   npm run dev
   ```

5. Open your browser and navigate to:

   ```
   http://localhost:5173
   ```

## ⌂ Architecture

### Frontend

- **Built with**: Preact, Vite
- **UI Components**: Custom-built components using modern React patterns
- **Drag & Drop**: @dnd-kit library for drag-and-drop functionality
- **Styling**: Custom CSS with responsive design

### Backend

- **API Endpoints**: Express.js server with API routes for team generation and chat
- **AI Integration**: OpenAI-compatible API clients for Deepseek and Perplexity
- **Data Storage**: Local storage for user preferences and team compositions

## § Usage Guide

### Creating a Team

1. Browse the character drawer on the left side
2. Drag characters to the team slots
3. Name your team and click "Save Team"

### Generating AI Teams

1. Enter a description of the team you want (e.g., "Freeze team with Ayaka")
2. Select your preferred AI model
3. Click "Generate Team" and wait for the AI to suggest an optimal composition

### Using the Chat Assistant

1. Click the chat bubble icon in the bottom-right corner
2. Ask Fischl (and Oz) questions about Genshin Impact, team building, or game mechanics
3. Receive in-character responses with helpful information

## ⚒ Development

### Project Structure

```
genshin-team-builder/
├── api/                  # API handlers
├── public/               # Static assets
├── scripts/              # Development scripts
├── src/
│   ├── components/       # UI components
│   ├── data/             # Game data
│   ├── styles/           # CSS styles
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application
│   └── main.jsx          # Entry point
└── index.html            # HTML template
```

### Building for Production

```
npm run build
```

## ≡ License

This project is licensed under the MIT License - see the LICENSE file for details.

## † Acknowledgements

- Game data and character information from HoYoverse's Genshin Impact
- AI models provided by Deepseek and Perplexity
- All Genshin Impact assets are property of HoYoverse
- <https://www.hoyolab.com/article/383753>

---

*Note: This is a fan-made tool and is not affiliated with or endorsed by HoYoverse/miHoYo.*
