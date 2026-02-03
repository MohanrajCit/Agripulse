# 🌾 Agripulse AI

> **AI-Powered, Flood-Aware Farming Assistant for Indian Farmers**

AgriShield AI is a comprehensive, multilingual agricultural advisory platform designed to empower Indian farmers. It leverages advanced AI to provide real-time crop management advice, flood risk alerts, market price intelligence, and disease detection capabilities—all in their native language.

![AgriShield AI](https://via.placeholder.com/800x400?text=AgriShield+AI+Dashboard)

---

## ✨ Key Features

### 🤖 AI Farming Assistant
- **Context-Aware Advice:** Powered by **Google Gemini 2.0 Flash** for accurate, localized farming tips.
- **Multilingual Support:** Fluent in **English, Hindi (हिंदी), Tamil (தமிழ்), and Telugu (తెలుగు)**.
- **Adaptive Learning:** Considers real-time weather, crop stage, and location context.

### 🍃 AI Disease Detection
- **Instant Analysis:** Upload photos of crops/leaves to detect diseases instantly.
- **Actionable Remedies:** Provides treatment and prevention plans in the user's language.
- **Secure Processing:** Image analysis is handled securely via server-side Edge Functions.

### 🌧️ Flood Risk Engine
- **Real-Time Assessment:** Calculates flood risk (LOW / MEDIUM / HIGH) based on:
  - Current rainfall intensity
  - Consecutive rainy days streak
  - 5-day predictive weather forecast
- **Safety Alerts:** Push notifications for immediate preventative actions.

### 🌤️ Hyper-Local Weather
- **Precision Data:** Fetches data from OpenWeather map.
- **Metrics:** Temperature, humidity, wind speed, rainfall, and atmospheric pressure.
- **Forecast:** 5-day hourly and daily projections.

### 📊 Mandi Market Intelligence
- **Live Prices:** Real-time commodity prices from **data.gov.in (Agmarknet)**.
- **Smart Filtering:** Automatically finds prices for the farmer's district/state.
- **Trends:** tracks price fluctuations for crops like Rice, Wheat, Cotton, and Onions.

### 🎙️ Voice Interaction
- **Text-to-Speech:** AI responses are spoken out loud using **ElevenLabs** realistic voices.
- **Accessibility:** Designed for farmers who prefer audio interfaces.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agrishield-ai.git
   cd agrishield-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your public Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_public_anon_key
   ```
   
   > **Note:** Sensitive API keys (OpenRouter, Weather, etc.) are **NOT** stored in `.env.local` for security. They are managed via Supabase Edge Function Secrets.

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:5173](http://localhost:5173) to see the app.

---

## 🔐 Security & Architecture

This project follows a **security-first** architecture to protect API quotas and user data.

### 🏗️ Edge Function Architecture
All external API calls are proxied through secure **Supabase Edge Functions**. No sensitive API keys are exposed in the client-side code.

| Feature | Edge Function | API Provider | Security Status |
|---------|---------------|--------------|-----------------|
| **Weather** | `weather-api` | OpenWeather | ✅ Secured (JWT) |
| **AI Chat** | `ai-chat` | OpenRouter (Gemini) | ✅ Secured (JWT) |
| **Mandi Prices** | `mandi-prices` | data.gov.in | ✅ Secured (JWT) |
| **TTS** | `text-to-speech` | ElevenLabs | ✅ Secured (JWT) |
| **Disease Detect** | `disease-detection` | OpenRouter (Vision) | ✅ Secured (JWT) |

### 🛡️ Authentication
- **Supabase Auth:** Email/Password authentication with JWT session management.
- **Row Level Security (RLS):** Database policies ensure users can only access their own data (preferences, chat history, alerts).
- **Secure Storage:** Auth tokens and keys are securely managed in local/session storage.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Framer Motion (Animations)
- **State Management:** React Query (TanStack) + Context API
- **Icons:** Lucide React

### Backend (Serverless)
- **Platform:** Supabase
- **Database:** PostgreSQL
- **Runtime:** Deno (Edge Functions)
- **Auth:** Supabase Auth

### AI & APIs
- **LLM:** Google Gemini 2.0 Flash (via OpenRouter)
- **Vision:** Gemini Vision
- **Voice:** ElevenLabs Multilingual v2
- **Data:** OpenWeatherMap, Agmarknet (Government of India)

---

## 📂 Project Structure

```bash
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base atoms (Button, Card, Input)
│   ├── weather/         # Weather widgets
│   ├── flood/           # Flood risk indicators
│   ├── mandi/           # Market price tables
│   ├── chat/            # Chat interface
│   └── disease/         # Disease detection upload/result
├── contexts/            # Global state (Auth, Language)
├── hooks/               # Custom hooks (useWeather, useAIChat)
├── lib/                 # Utilities & API service layer
│   └── api.ts           # Centralized Edge Function calls
├── pages/               # Route components
│   ├── Dashboard.tsx    # Main user dashboard
│   ├── Login.tsx        # Authentication
│   └── ...
└── supabase/
    └── functions/       # Deno Edge Functions code
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Support & Contact

Built with ❤️ for Indian Agriculture.
For issues, please skip to the [Issues](https://github.com/yourusername/agrishield-ai/issues) page.
