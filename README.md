# ⚽ Football Career RPG

An immersive, text-based football biography and career simulation RPG built with React 19, TypeScript, Vite, Express, and Tailwind CSS.

---

## 🚀 How to Run Outside AI Studio

### Prerequisites
- **Node.js**: Version 18+ or 20+ installed on your computer.
- **npm** or **pnpm** / **yarn**.
- *(Optional)* A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) for real-world AI news grounding & music synthesis features.

---

### 1. Installation

Clone or extract your project files into a directory, open your terminal, and run:

```bash
npm install
```

---

### 2. Configure Environment Variables

Create a `.env` file in the root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

*(Note: The game is fully playable offline/locally even if `GEMINI_API_KEY` is not provided — procedural fallback synthesizers and news fallback systems handle offline modes seamlessly).*

---

### 3. Running in Development Mode

To start the local full-stack development server with live reload:

```bash
npm run dev
```

Then open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

### 4. Production Build & Execution

To test the optimized production bundle locally:

```bash
# 1. Build client & server
npm run build

# 2. Start production server
npm run start
```

---

### 5. Deployment Options

This full-stack application can be deployed to any standard hosting platform:

- **Render / Railway / Fly.io**:
  - Build Command: `npm run build`
  - Start Command: `npm run start`
  - Environment Variable: Set `GEMINI_API_KEY` in the platform dashboard.
- **Docker / Cloud Run**:
  - Expose port `3000` or use the dynamic `PORT` provided by the host.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Recharts, D3.js, Motion.
- **Backend**: Node.js + Express with Vite SSR/Middleware integration.
- **AI Integration**: `@google/genai` (Gemini 2.5 Flash).
