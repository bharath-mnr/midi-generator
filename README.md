# 🎹 MIDI AI Studio

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini"/>
  <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <strong>AI-powered music composition platform with professional MIDI generation, editing, and style learning capabilities.</strong>
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-gallery">Gallery</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-local-development">Full Setup</a> •
  <a href="#-api-endpoints">API Docs</a>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎵 **Core Capabilities**
- 🤖 **AI Music Generation** - Text to professional MIDI
- 📚 **Style Learning** - Upload reference files to teach AI
- ✏️ **Smart Editing** - AI-assisted MIDI modifications
- 🔄 **Bidirectional Conversion** - Text ↔ MIDI seamlessly
- 🎼 **1-200 Bar Support** - From sketches to symphonies
- 👁️ **Real-time Preview** - View notation before download

</td>
<td width="50%">

### 🔒 **Enterprise Features**
- 🔐 **JWT Authentication** - Secure user sessions
- 📊 **Usage Dashboard** - Track your generations
- 💳 **Subscription Tiers** - Free/Pro/Premium plans
- 📜 **Chat History** - PostgreSQL persistence
- ⚡ **Rate Limiting** - Fair usage enforcement
- 🔧 **Admin Tools** - Spring Actuator monitoring

</td>
</tr>
</table>

> **💡 Workflow Revolution:** If you have strong theoretical knowledge but lack instrumental proficiency, this tool bridges that gap instantly.

---

## 📸 Gallery

### Web Application
<p align="center">
  <a href="images/frontend.png" target="_blank">
    <img src="images/frontend.png" alt="Chat Interface" width="98%"/>
  </a>
</p>

<p align="center">
  <a href="images/dashboard.png" target="_blank">
    <img src="images/dashboard.png" alt="User Dashboard" width="98%"/>
  </a>
</p>

<p align="center">
  <a href="images/vst_download.png" target="_blank">
    <img src="images/vst_download.png" alt="VST Download Page" width="98%"/>
  </a>
</p>

### Mobile Experience
<p align="center">
  <a href="images/mobile_1.jpg" target="_blank">
    <img src="images/mobile_1.jpg" alt="Mobile Screen 1" width="32%"/>
  </a>
  <a href="images/mobile_2.jpg" target="_blank">
    <img src="images/mobile_2.jpg" alt="Mobile Screen 2" width="32%"/>
  </a>
  <a href="images/mobile_3.jpg" target="_blank">
    <img src="images/mobile_3.jpg" alt="Mobile Screen 3" width="32%"/>
  </a>
</p>

### VST3 Plugin
<p align="center">
  <a href="images/vst_1.png" target="_blank">
    <img src="images/vst_1.png" alt="VST3 – Login Screen" width="49%"/>
  </a>
  <a href="images/vst_2.png" target="_blank">
    <img src="images/vst_2.png" alt="VST3 – Generation Panel" width="49%"/>
  </a>
</p>

---

## 🎨 Transformation Example

<table>
<tr>
<td width="50%">

### 📝 **Before: Simple Melody**
![Original MIDI](images/before-midi.png)

**Properties:**
- 33 bars, single voice
- Basic melodic line
- No harmonic support

</td>
<td width="50%">

### 🎭 **After: Full Orchestra**
![Enhanced MIDI](images/after-midi.png)

**Enhanced with:**
- 5-part harmony
- Cinematic voicing
- Professional arrangement

</td>
</tr>
</table>

<details>
<summary><strong>📋 View Full Prompt Used</strong></summary>

```
Keep the main melody fully intact and positioned in the high register.
Do not alter or revoice the melody in any way — it remains exactly as written.
Add rich orchestral harmony layers beneath the melody, forming at least
5-part harmony for a full ensemble texture.
Maintain smooth voice leading and overall orchestral balance, ensuring
a deep, lush harmonic texture throughout.
Keep the total structure exactly 33 bars.
Use cinematic or symphonic voicing principles:
High range (D4–A6): Melody remains clear and dominant.
Upper-mid range (G3–G5): Light harmonic or supportive lines.
Middle range (C3–C5): Core harmonic foundation and color tones.
Lower range (C2–C4): Deep harmonic reinforcement and root tones.
Sub-low range (E1–C3): Optional octave or bass grounding.
Keep the harmony openly spaced in lower registers and closer in upper
registers for natural cinematic warmth.
Preserve the melody as the clear focal point, while the underlying
harmony moves slowly, legato, and dynamically supportive, never
rhythmically intrusive.
The final sound should be lush, emotive, and fully cinematic, maintaining
clarity, warmth, and melodic dominance across all 33 bars.
```

</details>

**Result:** The AI successfully added cinematic harmonic layers across 5 voices while preserving the original melody's position and character, creating a professional orchestral arrangement.

---

## 🚀 Live Demo

**[https://midi-generator-seven.vercel.app/](https://midi-generator-seven.vercel.app/)**

---

## ⚡ Quick Start (5 minutes)

Get up and running with just the Node.js bridge for basic testing:

```bash
# 1. Clone repository
git clone https://github.com/bharath-mnr/ai-midi-generator
cd ai-midi-generator

# 2. Install dependencies
cd backend && npm install

# 3. Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env
echo "PORT=5000" >> .env

# 4. Start Node.js bridge
npm run dev

# 5. In a new terminal, start frontend
cd ../frontend && npm install && npm run dev
```

**Access at:** http://localhost:5173

> **Note:** This runs the stateless Node.js bridge only (no auth, history, or limits). For full enterprise features, follow the [Local Development](#-local-development) guide below.

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="48" height="48" alt="React"/>
<br><strong>React 18</strong>
<br><sub>Vite • Tailwind • Router</sub>
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" width="48" height="48" alt="Spring"/>
<br><strong>Spring Boot 3</strong>
<br><sub>Security • JPA • REST</sub>
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="48" height="48" alt="Node.js"/>
<br><strong>Node.js 20</strong>
<br><sub>Express • Multer • MIDI</sub>
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="48" height="48" alt="PostgreSQL"/>
<br><strong>PostgreSQL 15</strong>
<br><sub>Persistence • History</sub>
</td>
</tr>
</table>

### Architecture Overview

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React     │─────▶│  Java API :8080  │─────▶│   PostgreSQL    │
│   :5173     │      │  (Auth, History) │      │   (User Data)   │
└─────────────┘      └──────────────────┘      └─────────────────┘
                              │
                              ├─ JWT Auth
                              ├─ Rate Limiting
                              ├─ Subscriptions
                              │
                              ▼
                     ┌──────────────────┐
                     │ Node.js Bridge   │
                     │ :5000 (Stateless)│──────▶ Gemini AI
                     │ MIDI Gen/Parse   │
                     └──────────────────┘
```

### Backend – Dual Layer Architecture
1. **Node.js Stateless Bridge** (port 5000)
   - Express + Multer
   - Google Gemini AI API integration
   - Custom MIDI Parser & Generator
   - In-memory operation – no persistence
   
2. **Java Spring Boot API** (port 8080)
   - Spring Security + JWT authentication
   - PostgreSQL / JPA persistence
   - Subscription tiers & daily limits
   - Chat history & file proxy endpoints
   - Rate limiting & scheduled cleanups

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **JDK** 21+ and Maven 3.8+
- **PostgreSQL** 13+ (local or cloud)
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- **Git**

---

## 🏃 Local Development

### 1. Clone Repository
```bash
git clone https://github.com/bharath-mnr/ai-midi-generator
cd ai-midi-generator
```

### 2. Install Dependencies
```bash
# Node.js layer
cd backend && npm install

# Java layer
cd ../midigenerator && mvn clean install -DskipTests
```

### 3. Configure Environment Variables

**Node.js bridge** (`backend/.env`):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
```

**Java API** (`midigenerator/src/main/resources/application-local.properties`):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/midi_db
spring.datasource.username=postgres
spring.datasource.password=postgres
jwt.secret=change-me-in-production
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8080/api
```

### 4. Run Development Stack

```bash
# Terminal 1 – PostgreSQL (Docker one-liner)
docker run --name midi-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Terminal 2 – Java backend
cd midigenerator && mvn spring-boot:run -Dspring.profiles.active=local

# Terminal 3 – Node.js bridge
cd backend && npm run dev

# Terminal 4 – React frontend
cd frontend && npm run dev
```

### Access Points:
- **React UI:** http://localhost:5173
- **Java API:** http://localhost:8080/api
- **Node Bridge:** http://localhost:5000/api
- **Swagger UI:** http://localhost:8080/swagger-ui.html

---

## 📊 API Endpoints

### Node.js Stateless Bridge (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Generate MIDI from text prompt |
| `POST` | `/api/upload-midi` | Parse MIDI file to text notation |
| `GET` | `/api/health` | Service health check |

### Java Spring Boot API (Port 8080)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | User registration |
| `POST` | `/api/auth/login` | ❌ | JWT authentication |
| `POST` | `/api/auth/refresh` | ❌ | Refresh access token |
| `POST` | `/api/auth/verify-email` | ❌ | Email confirmation |
| `POST` | `/api/midi/generate` | ✅ | Generate MIDI (proxies to Node) |
| `GET` | `/api/user/profile` | ✅ | User dashboard data |
| `GET` | `/api/user/generation-limit` | ✅ | Check daily limit status |
| `GET` | `/api/midi/generations` | ✅ | Paginated generation history |
| `GET` | `/api/midi-files/{name}` | ✅ | Secure MIDI file download |
| `GET` | `/api/pricing/plans` | ❌ | Available subscription tiers |

🔑 **Auth Required** = Include JWT token in `Authorization: Bearer <token>` header

---

## 🎵 MIDI Text Notation Format

Our custom text format supports professional MIDI composition:

### Basic Syntax
```
C4(100)[1] = Note C at octave 4, velocity 100, duration 1 beat
D4(80)[0.5] = Note D at octave 4, velocity 80, duration 0.5 beats
. = Rest
~ = Sustain/hold previous note
```

### Example: Simple Melody
```
Bar 1: C4(90)[1] E4(95)[1] G4(100)[1] C5(105)[1]
Bar 2: B4(100)[2] A4(95)[2]
Bar 3: G4(90)[1] E4(85)[1] C4(80)[2]
```

### Advanced Features
- **Multiple voices:** Separate with commas
- **Chords:** Use `+` between notes
- **Dynamics:** Velocity 0-127
- **Tempo:** Specify BPM
- **Time signatures:** 4/4, 3/4, 6/8, etc.

---

## 🎹 Usage Examples

### Example 1: Generate New Composition
```
Create a 16-bar jazz piano piece in Bb major at 120 BPM.
Use swing rhythm with walking bass line and syncopated chords.
Include a melodic solo in bars 9-12.
```

### Example 2: Enhance Existing MIDI
```
Upload your MIDI file, then prompt:

Add lush string harmony underneath the existing melody.
Keep the original melody untouched in the upper register.
Add 4-part harmony with smooth voice leading.
Use cinematic orchestral voicing throughout.
```

### Example 3: Style Learning
```
1. Upload 2-3 MIDI files of your preferred style
2. Prompt: "Create a new 32-bar composition in the same style"
3. AI analyzes harmony, rhythm, and voicing patterns
4. Generates new composition matching your reference style
```

---

## 🔧 Configuration

### Subscription Tiers

| Tier | Daily Limit | Features |
|------|-------------|----------|
| **Free** | 5 generations | Basic MIDI generation |
| **Pro** | 50 generations | Priority queue, style learning |
| **Premium** | Unlimited | VST plugin, API access, no watermark |

### Rate Limiting
- **Free tier:** 5 requests per minute
- **Pro tier:** 20 requests per minute
- **Premium tier:** 100 requests per minute

### File Limits
- **Max MIDI upload:** 5MB
- **Max bars:** 200
- **Max simultaneous voices:** 16

---

## 🧪 Technical Challenges Solved

### **NEW** – Java Layer Innovations

<table>
<tr>
<td width="50%">

**🔒 Security & Scale**
- **Distributed Rate-Limiting:** In-memory token bucket with header enrichment
- **Optimistic Lock Retry:** Pessimistic write locks on user row to eliminate daily-count race conditions
- **Horizontal Scalability:** Stateless Node bridge + shared-nothing Java instances behind any load balancer

</td>
<td width="50%">

**⚡ Performance & Reliability**
- **SendGrid HTTP API:** SMTP-port-agnostic email delivery for cloud platforms
- **Zero-downtime Daily Reset:** Single SQL UPDATE at 00:00 UTC, no user interruption
- **Connection Pooling:** HikariCP for optimal database performance

</td>
</tr>
</table>

---

## 🎬 Reference Demo Track

https://github.com/user-attachments/assets/676adc35-99de-48c4-b659-5c4df1a5c79a

### 🔊 Audio Only
[Download MP3](https://github.com/user-attachments/files/23290756/audio.mp3)

<details>
<summary><strong>📋 View Full 45-Bar Composition Prompt</strong></summary>

```
Create a 45-bar epic cinematic piano composition in D minor at 85 BPM in 4/4 time.

═══════════════════════════════════════════════════════════════════════
ARCHITECTURAL STRUCTURE: Symmetrical Arc with Central Climax
═══════════════════════════════════════════════════════════════════════

INTRODUCTION - BARS 1-8 (The Awakening)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dynamics: pp to mp (velocity 45→69)
Texture: Sparse, contemplative, building foundation

Chord Progression: Dm - Bb - C - Am (repeating twice)

Bar 1 (Dm, vel 45): 
- Bass: D2 whole note, A2 enters beat 2
- Arpeggios: D3-F3-A3-D4 sixteenth note pattern across middle register
- High notes: A5 whole note (vel 50), D6 enters beat 2 (vel 52)

Bar 2 (Bb, vel 48):
- Bass: Bb1 whole note, F2 enters beat 2
- Arpeggios: Bb2-D3-F3-Bb3 pattern
- High notes: F5 whole note (vel 53), Bb5 enters beat 2 (vel 55)

Bar 3 (C, vel 52):
- Bass: C2 whole note, G2 enters beat 2
- Arpeggios: C3-E3-G3-C4 pattern
- High notes: C5 whole note (vel 57), E5 beat 2 (vel 59), G5 beat 3 (vel 61)
- Gradual ascending melody introduction

Bar 4 (Am, vel 55-58):
- Bass: A2 whole note transitioning to vel 58 at beat 3, E3 enters beat 2
- Arpeggios: A3-C#4-E4-A4 pattern
- High melody becomes active: A5 (vel 63), rising through C#6, E6 with velocities 65-69
- First hint of melodic movement and emotional expression

Bars 5-8: EXACT REPEAT of bars 1-4
- Establishes thematic material
- Reinforces harmonic progression
- Listener becomes familiar with the motif


DEVELOPMENT SECTION - BARS 9-16 (Rising Tension)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dynamics: mp to f (velocity 62→95)
Texture: Thickening, adding layers, increasing rhythmic activity

Bar 9 (Dm, vel 62):
- Texture expands to 12 simultaneous voices
- Bass: D2-A2 foundation
- Mid arpeggios: D3-F3-A3-D4 PLUS F4-A4 layer added
- High cascade: D5 (72), F5 (74), A5 (76), D6 (78) - staggered entrances
- Creates waterfall effect in upper register

[... continues with bars 10-45 detailed specifications ...]

═══════════════════════════════════════════════════════════════════════
EMOTIONAL/NARRATIVE ARC:
═══════════════════════════════════════════════════════════════════════

This is a symphonic piano tone poem representing:
- AWAKENING (bars 1-8): Consciousness emerging
- STRIVING (bars 9-16): Effort and determination
- ASCENT (bars 17-20): Approaching transcendence
- BREAKTHROUGH (bar 20): Shattering of limitations
- APOTHEOSIS (bars 21-24): Ultimate realization/triumph
- VOID (bar 26): Moment outside time
- INTEGRATION (bars 27-42): Wisdom of the descent
- RETURN (bars 43-45): Changed but recognizable, fading into mystery

The piece never truly "ends" - it dissolves, suggesting the journey continues beyond our hearing.
```

</details>

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🎯 Roadmap

| Status | Feature | Priority | Notes |
|--------|---------|----------|-------|
| 🚧 | Stripe Payment Integration | **High** | Java layer ready |
| 🔜 | VST3 Plugin Public Beta | **High** | Works via Node bridge |
| 📋 | Admin Dashboard | **Medium** | Spring Actuator + custom endpoints |
| 💡 | WebSocket Real-time Progress | **Medium** | Generation status updates |
| 📱 | Native Mobile Apps | **Low** | Consumes same Java API |
| 💡 | Multi-instrument Support | **Future** | Beyond piano |
| 💡 | Collaborative Editing | **Future** | Real-time co-composition |

**Legend:** ✅ Done • 🚧 In Progress • 🔜 Next • 📋 Planned • 💡 Considering

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/bharath-mnr/ai-midi-generator/issues)
- **Discussions:** [GitHub Discussions](https://github.com/bharath-mnr/ai-midi-generator/discussions)
- **Email:** support@midiaistudio.com

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful music generation capabilities
- The open-source music technology community
- All contributors and beta testers

---

<p align="center">
  <strong>Made with ❤️ and AI</strong>
  <br>
  <sub>Enjoy composing! 🎼</sub>
</p>

<p align="center">
  <a href="https://github.com/bharath-mnr/ai-midi-generator">⭐ Star this repo if you find it useful!</a>
</p>