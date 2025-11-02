# 🎹 MIDI AI Studio

> AI-powered music composition platform with professional MIDI generation, editing, and style learning capabilities.

## ✨ Features

**💡 Workflow Revolution:** If you have strong theoretical knowledge but lack instrumental proficiency, this tool bridges that gap instantly.


- **AI Music Generation**: Create professional MIDI compositions from text descriptions
- **Reference Style Learning**: Upload MIDI files to teach AI your preferred musical style
- **MIDI Editing**: Upload and edit existing MIDI files with AI assistance
- **Text ↔ MIDI Conversion**: Bidirectional conversion between text notation and MIDI
- **Professional Output**: Support for 1-200 bars with sophisticated harmony and dynamics
- **Real-time Preview**: View MIDI notation before downloading
- **NEW** – **Enterprise-grade Java Backend**: JWT auth, rate-limiting, subscription tiers, chat history, PostgreSQL persistence, horizontal-ready stateless Node.js bridge


## 📸 Gallery

<!-- Row 1: Frontend 4 full width (same style as row 2) -->
<p align="center">
  <a href="images/frontend.png" target="_blank">
    <img src="images/frontend.png" alt="Chat Bot" width="98%"/>
  </a>
</p>

<p align="center">
  <a href="images/dashboard.png" target="_blank">
    <img src="images/dashboard.png" alt="dashboard" width="98%"/>
  </a>
</p>

<p align="center">
  <a href="images/vst_download.png" target="_blank">
    <img src="images/vst_download.png" alt="dashboard" width="98%"/>
  </a>
</p>


<!-- Row 2: Mobile Screenshots (vertical) -->
<p align="center">
  <a href="images/mobile_1.jpg" target="_blank">
    <img src="images/mobile_1.jpg" alt="Mobile Screen 1" width="32%"/>
  </a>
  <a href="images/mobile_2jpg" target="_blank">
    <img src="images/mobile_2.jpg" alt="Mobile Screen 2" width="32%"/>
  </a>
  <a href="images/mobile_3.jpg" target="_blank">
    <img src="images/mobile_3.jpg" alt="Mobile Screen 3" width="32%"/>
  </a>
</p>

<!-- Row 3: VST Screenshots (side-by-side) -->
<p align="center">
  <a href="images/vst_1.png" target="_blank">
    <img src="images/vst_1.png" alt="VST3 – Login Screen" width="49%"/>
  </a>
  <a href="images/vst_2.png" target="_blank">
    <img src="images/vst_2.png" alt="VST3 – Generation Panel" width="49%"/>
  </a>
</p>


## 🎨 Example: Orchestral Harmony Enhancement

### Original MIDI (Before)
![Original MIDI](images/before-midi.png)
*Simple melody line (33 bars)*

### AI-Enhanced Result (After)
![Enhanced MIDI](images/after-midi.png)
*Full orchestral arrangement with 5-part harmony*

Prompt Used:
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


**Result:** The AI successfully added cinematic harmonic layers across 5 voices while preserving the original melody's position and character, creating a professional orchestral arrangement.

---

## 🚀 Live Demo

https://midi-generator-seven.vercel.app/


---

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Lucide React Icons
- React Router (client-side routing)

### Backend – Dual Layer
1. **Node.js Stateless Bridge** (port 5000)
   - Express + Multer
   - Google Gemini AI API
   - Custom MIDI Parser & Generator
   - In-memory operation – no persistence
2. **Java Spring-Boot API** (port 8080)
   - Spring Security + JWT
   - PostgreSQL / JPA
   - Subscription tiers & daily limits
   - Chat-history & file-proxy endpoints
   - Rate-limiting & scheduled clean-ups

---

## 📋 Prerequisites

- Node.js 18+ and npm
- JDK 21+ and Maven 3.8+
- PostgreSQL 13+ (local or cloud)
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- Git

---

## 🏃 Local Development

### 1. Clone Repository
```bash
git clone https://github.com/bharath-mnr/ai-midi-generator
cd ai-midi-generator
2. Install Dependencies
bash

# Node layer
cd backend && npm install

# Java layer
cd ../midigenerator && mvn clean install -DskipTests
3. Configure Environment Variables
Node.js bridge (backend/.env):
env

GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=5000
Java API (midigenerator/src/main/resources/application-local.properties):
properties

spring.datasource.url=jdbc:postgresql://localhost:5432/midi_db
spring.datasource.username=postgres
spring.datasource.password=postgres
jwt.secret=change-me-in-production
Frontend (frontend/.env):
env

VITE_API_URL=http://localhost:8080/api
4. Run Development Stack
bash

# Terminal 1 – PostgreSQL (Docker one-liner)
docker run --name midi-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Terminal 2 – Java backend
cd midigenerator && mvn spring-boot:run -Dspring.profiles.active=local

# Terminal 3 – Node bridge
cd backend && npm run dev

# Terminal 4 – React frontend
cd frontend && npm run dev
Access points:
React: http://localhost:5173
Java API: http://localhost:8080/api
Node bridge: http://localhost:5000/api
Swagger UI: http://localhost:8080/swagger-ui.html
🎵 MIDI Text Notation Format
(unchanged – see original docs)
🎹 Usage Examples
(unchanged – see original docs)
🔧 Configuration
(unchanged – see original docs)
📊 API Endpoints
Node.js Stateless Bridge

POST  /api/chat                 # AI → MIDI (stateless)
POST  /api/upload-midi          # MIDI → text
GET   /api/health               # health
Java Spring-Boot API
C
POST  /api/auth/signup          # user registration
POST  /api/auth/login           # JWT login
POST  /api/auth/refresh         # refresh token
POST  /api/auth/verify-email    # email confirmation
POST  /api/midi/generate        # proxy to Node (auth required)
GET   /api/user/profile         # user data
GET   /api/user/generation-limit
GET   /api/midi/generations     # paginated history
GET   /api/midi-files/{name}    # secure file proxy
GET   /api/pricing/plans        # subscription tiers

🧪 Technical Challenges Solved
NEW – Java layer additions:
Distributed Rate-Limiting: In-memory token bucket with header enrichment
Optimistic Lock Retry: Pessimistic write locks on user row to eliminate daily-count race conditions
SendGrid HTTP API: SMTP-port-agnostic email delivery for cloud platforms
Zero-downtime Daily Reset: Single SQL UPDATE at 00:00 UTC, no user interruption
Horizontal Scalability: Stateless Node bridge + shared-nothing Java instances behind any LB

## 🎬 Reference Demo Track  

https://github.com/user-attachments/assets/676adc35-99de-48c4-b659-5c4df1a5c79a

### Audio Only
🔊 [Download MP3](https://github.com/user-attachments/files/23290756/audio.mp3)

Prompt Used:
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

Bar 10 (Bb, vel 65):
- Similar 12-voice texture
- Bb1-F2 bass
- Extended arpeggios through D4-F4
- No high melody - focuses on harmonic density

Bar 11 (Gm substitute, vel 68):
- HARMONIC SHIFT: Uses Gm instead of C major
- Creates modal mixture, darker color
- High melody introduced: G5 leads with velocities climbing 88→94
- Three-note melody: G5, Bb5, D6 with rhythmic displacement
- Most animated high voice yet

Bar 12 (Am, vel 72-75):
- Continuing intensity, velocity shift mid-bar
- Extended range: A2 through E6
- High melody: A5 (96), C#6, E6 with peaks at 98-102
- Melodic phrases becoming more urgent

Bars 13-16: Second iteration with increased intensity
- Bar 13 (Dm, 78): Reaches into D7 register, velocities up to 111
- Bar 14 (Bb, 82): Full 10-voice texture
- Bar 15 (C, 85): Dense harmonic block
- Bar 16 (Am, 88-95): Accelerating high melody with syncopation
  High notes: A5 with velocity changes 90-92-95 showing rhythmic urgency


CLIMAX BUILD - BARS 17-20 (The Ascent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dynamics: f to fff (velocity 98→118)
Texture: Maximum density approaching

Bar 17 (Dm, vel 98):
- 11 simultaneous voices spanning D2-A5
- Full saturation of all registers
- Continuous arpeggio motion
- Preparing for ultimate climax

Bar 18 (Gm, vel 102):
- Harmonic substitution returns
- G2-D3 bass foundation
- All voices at 102 velocity - unified power

Bar 19 (Am, vel 105-112):
- Intensity surge, velocities climbing within single bar
- High melody: A5 through C#6 with peaks 108-110-112
- Energy coiling for release

Bar 20 (Dm, vel 115-118): ★ BREAKING POINT ★
- TEXTURAL SHIFT: Sustained notes STOP in beat 3
- Staccato hits emerge: Non-sustained attacks
- Rhythmic fragmentation: F3, A3, F4 become detached eighth notes
- Creates dramatic rupture in texture
- High notes F6-F6 appear as short accents
- Builds into bar 21's explosion


ABSOLUTE PEAK - BARS 21-24 (The Summit)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dynamics: fff (velocity 120-127 MAX)
Texture: Full orchestral piano density

Bar 21 (Dm, vel 120-127):
- 14 simultaneous voices
- Range: D2 through D7 (five full octaves)
- High register cascade: F6 (125), A6 (125), D7 (127) - MAXIMUM VELOCITY
- Overwhelming power, all registers activated

Bar 22 (Bb, vel 120):
- Sustained maximum intensity
- 12 voices, all at velocity 120
- No dynamic variation - pure sustained power

Bar 23 (C, vel 120):
- Maintains fff dynamic
- 12-voice C major harmony
- Continuous energy, no release

Bar 24 (Am, vel 127): ★★★ ULTIMATE CLIMAX ★★★
- 15 SIMULTANEOUS VOICES - maximum polyphony
- SEVEN OCTAVE SPAN: A2 through A7
- Every voice at maximum velocity 127
- A major chord (Picardy third resolution)
- Represents the absolute peak of emotional/dynamic journey
- Most notes, highest range, loudest dynamic all converge


RESET/TRANSFORMATION - BARS 25-26 (The Void)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bar 25 (Dm, vel 127 fading):
- Deconstruction begins
- High notes F6-A6 become short, non-sustained
- Texture thins slightly
- Final subdivision shows silence (.) - first true rest since climax
- Represents exhaustion after peak

Bar 26 (D power chord, vel 127): ★ VOID/RESET ★
- ONLY 5 NOTES: D2-D3-D4-D5-D6
- Perfect octave unisons across five octaves
- Maximum velocity but MINIMAL notes
- Pure, hollow, ringing resonance
- Symbolic reset - clearing the canvas
- Moment of stillness before descent
- Last subdivision shows silence - true pause


MIRROR DESCENT - BARS 27-42 (The Return Journey)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Texture: Progressively thinning, unwinding
Dynamics: Systematic descent matching bars 9-24 in reverse

The descent follows a precise mirror of the ascent with these velocity steps:
120 → 112 → 108 → 105 → 98 → 92 → 88 → 85 → 82 → 78 → 75 → 72 → 68 → 62 → 58 → 55

Bar 27 (Dm, 120): Mirrors bar 21, but descending energy
Bar 28 (Bb, 112): Mirrors bar 22, slightly softer
Bar 29 (C, 108): Gradual unwinding continues
Bar 30 (Am, 105): Seven-octave span maintained but softer
Bar 31 (Dm, 98): Mirrors bar 17
Bar 32 (Bb, 92): Continuing descent
Bar 33 (C, 88): Mirrors bar 16
Bar 34 (Am, 85): Texture still rich but mellowing
Bar 35 (Dm, 82): Mirrors bar 14
Bar 36 (Bb, 78): Gradual thinning
Bar 37 (C, 75): Mirrors bar 12
Bar 38 (Am, 72): Seven-octave A major returns, softer
Bar 39 (Dm, 68): Mirrors bar 11
Bar 40 (Bb, 62): Mirrors bar 10
Bar 41 (C, 58): Mirrors bar 9
Bar 42 (Dm, 55): Returns to opening texture richness


DISSOLUTION - BARS 43-45 (Fading to Silence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bar 43 (Dm, vel 45): EXACT MIRROR of bar 1
- Returns to opening 8-voice texture
- Arpeggios: D3-F3-A3-D4
- High notes: A5 (50), D6 (52)
- Circular return to beginning

Bar 44 (Dm, vel 40): Below opening dynamic
- Same pattern as bar 43 but softer (pp)
- A5 (45), D6 (47)
- Fading further into distance

Bar 45 (Dm, incomplete): ★ FINAL BREATH ★
- UNFINISHED - bar ends mid-phrase
- Suggests continuation beyond the piece
- Eternal echo, not a resolution
- Music doesn't "end" - it dissolves into silence

═══════════════════════════════════════════════════════════════════════
TECHNICAL SPECIFICATIONS:
═══════════════════════════════════════════════════════════════════════

Voice Leading:
- Sustained bass notes (whole notes in lowest register)
- Arpeggiated patterns in middle voices (sixteenth note figures)
- Melodic high register (enters and exits dynamically)
- All voices maintain smooth connections throughout

Velocity Architecture:
- ASCENT: 45→69→95→118→127 (bars 1-24)
- PEAK: 127 sustained (bars 24-26)
- DESCENT: 127→55→40 (bars 27-44)
- Creates perfect parabolic emotional curve

Harmonic Strategy:
- Primary: Dm - Bb - C - Am (i - VI - VII - v in D minor)
- Substitution: Gm appears at moments of heightened tension (bars 11, 18)
- Picardy third: A MAJOR at climax (bar 24) for triumphant peak
- Returns to minor for descent

Textural Evolution:
- Bars 1-8: 6-8 voices
- Bars 9-20: 10-12 voices
- Bars 21-24: 12-15 voices (MAXIMUM)
- Bar 26: 5 voices (MINIMUM at loud dynamic)
- Bars 27-42: Gradual reduction 12→8 voices
- Bars 43-45: 6-8 voices, fading

Rhythmic Devices:
- Sustained notes (~) create harmonic pillars
- Arpeggios provide constant motion
- Bar 20: Staccato breaks create dramatic tension
- Bar 25: First substantial rests after climax
- Bar 26: Silence in final subdivision - breathing space

Register Usage:
- Lowest: D2, A#1, C2 (bass foundation)
- Highest: D7, E7, A7 (climactic peaks)
- Spans up to 7 octaves at climax
- Returns to 5-6 octave span in coda

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

📝 License
MIT – see LICENSE file.
🎯 Roadmap
[ ] Stripe checkout integration (Java layer ready)
[ ] VST3 plugin (works via Node bridge)
[ ] Admin dashboard (Spring-Actuator + custom endpoints)
[ ] WebSocket real-time generation progress
[ ] Mobile app (consumes same Java API)
Enjoy composing! 🎼
