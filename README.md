# OmniCalc: Modern Precision Calculator Suite

**OmniCalc** is a high-precision, multi-disciplinary mathematical workstation and developer computing environment. It consolidates scientific computing, physical and digital unit conversions, real-time currency exchange, financial loan and mortgage modeling, programmer bitwise and multi-base manipulation, statistical data analysis, and hardware-accelerated 2D canvas function plotting into a responsive, single-page application with tactile acoustic feedback.

---

## 1. About This Application

OmniCalc was engineered to eliminate the fragmentation common in digital calculation workflows. Rather than switching between separate tools for trigonometry, unit conversions, mortgage estimations, binary bit-shifting, and data set statistics, OmniCalc provides a unified suite powered by high-precision calculation algorithms:

- **Unified Multi-Tool Workflow**: 7 specialized calculation engines operating within a consistent interface.
- **Client & Server Synergy**: Client-side instantaneous evaluation paired with a persistent Node.js Express backend for calculation tape logging, live currency conversions, and amortization schedule generation.
- **Hardware-Style Tactile Typing**: Integrated Web Audio API synthesizer generating micro-acoustic haptic ticks for button taps and physical keyboard strokes.
- **Developer & Engineer First**: Live simultaneous 4-base conversion (HEX, DEC, OCT, BIN) with interactive 64-bit binary bit flippers, BigInt precision, and mathematical constant libraries.
- **Zero Third-Party Telemetry**: Fast, privacy-respecting computing environment without trackers or ad networks.

---

## 2. Programming Languages & Technology Stack

OmniCalc is built end-to-end with modern web standards and typed language tooling:

| Layer | Technology | Details |
|---|---|---|
| **Primary Language** | **TypeScript (v5.8)** | 100% strict type safety across both client-side components and server-side routes |
| **Markup & Presentation** | **HTML5 & CSS3** | Semantic markup, HTML5 Canvas 2D API, and modern CSS color variables |
| **Styling Framework** | **Tailwind CSS** | Atomic design system with dark slate canvas aesthetics and optical contrast compensation |
| **Frontend Framework** | **React 19** | Functional component architecture, concurrent rendering, and custom state hooks |
| **Build & Dev Tooling** | **Vite 8** | Near-instantaneous Hot Module Replacement (HMR) and optimized Rollup asset bundling |
| **Server Runtime** | **Node.js v22 (LTS)** | High-throughput asynchronous event loop with native TypeScript execution |
| **Backend Framework** | **Express 4.21** | Lightweight RESTful routing and API endpoints |
| **Acoustic Engine** | **Web Audio API** | Real-time browser oscillator and gain nodes synthesizing tactile click feedback |
| **Icons & Typography** | **Lucide Icons** | SVG icon system with Plus Jakarta Sans and JetBrains Mono monospace typography |
| **Containerization** | **Docker & Compose** | 2-stage multi-stage Alpine containerization producing lightweight production images |

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OmniCalc React 19 Client                        │
│  ┌──────────────┬──────────────┬──────────────┬─────────────────────┐  │
│  │  Scientific  │  Converter   │   Finance    │     Programmer      │  │
│  ├──────────────┼──────────────┼──────────────┼─────────────────────┤  │
│  │  Statistics  │  2D Grapher  │ History Tape │ Web Audio Synthesizer│  │
│  └──────────────┴──────────────┴──────────────┴─────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON HTTP REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Node.js v22 Express Backend Service                   │
│  ┌───────────────────────┬────────────────────────┬─────────────────┐  │
│  │ /api/calc/history     │ /api/calc/amortization │ /api/calc/rates │  │
│  └───────────────────────┴────────────────────────┴─────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Specialized Calculator Modules

### 4.1. Scientific & Advanced Math Calculator
- **Dual-Line Precision Display**: Live expression tape showing operator precedence, matched parentheses, and a large formatted result terminal with comma thousands separators (`1,234.56`).
- **Angle Units**: One-click switching between Degrees (`DEG`) and Radians (`RAD`) for trigonometric operations.
- **Trigonometric Functions**: Standard (`sin`, `cos`, `tan`) and inverse (`asin`, `acos`, `atan`).
- **Logarithms & Exponentials**: Natural logarithm (`ln`), base-10 log (`log₁₀`), base-2 log (`log₂`), powers (`x²`, `x³`, `xʸ`), roots (`√x`, `∛x`), and reciprocal (`1/x`).
- **Mathematical Constants**: High-precision Euler's number ($e \approx 2.71828$) and Archimedes' constant ($\pi \approx 3.14159$).
- **Combinatorics & Logic**: Factorials ($n!$), absolute values ($|x|$), modulo arithmetic (`mod`), and percentages (`%`).
- **Hardware Memory Registers**: `MC` (Clear), `MR` (Recall), `M+` (Add), `M-` (Subtract), and `MS` (Store) with an active memory visual indicator.
- **Acoustic Haptics**: Real-time micro-tick acoustic feedback synthesized via the browser's Web Audio API with a one-click mute/unmute control.

### 4.2. Multi-Dimensional Unit & Currency Converter
Bi-directional instant conversion with automatic decimal scaling across 8 domains:
- **Length**: Meters (`m`), Kilometers (`km`), Centimeters (`cm`), Millimeters (`mm`), Miles (`mi`), Yards (`yd`), Feet (`ft`), Inches (`in`), Nautical Miles (`NM`).
- **Mass & Weight**: Kilograms (`kg`), Grams (`g`), Milligrams (`mg`), Pounds (`lb`), Ounces (`oz`), Metric Tons (`t`), Stones (`st`).
- **Temperature**: Celsius (`°C`), Fahrenheit (`°F`), Kelvin (`K`).
- **Digital Storage**: Bytes (`B`), Kilobytes (`KB`), Megabytes (`MB`), Gigabytes (`GB`), Terabytes (`TB`), Petabytes (`PB`) based on standard $1024$ binary byte scaling.
- **Area**: Square Meters (`m²`), Square Kilometers (`km²`), Square Feet (`ft²`), Square Miles (`mi²`), Acres (`ac`), Hectares (`ha`).
- **Speed**: Meters per second (`m/s`), Kilometers per hour (`km/h`), Miles per hour (`mph`), Knots (`kn`).
- **Time**: Seconds (`s`), Minutes (`min`), Hours (`hr`), Days (`d`), Weeks (`wk`), Months (`mo`), Years (`yr`).
- **Currency**: Real-time exchange rate conversions anchored to USD (`EUR`, `GBP`, `JPY`, `CAD`, `AUD`, `INR`, `CNY`, `CHF`).
- **Quick Controls**: Instant unit swap (`⇄`) button and conversion ratio calculation details.

### 4.3. Financial, Loan & Mortgage Calculator
- **Interactive Modeling**: Sliders and numerical inputs for Principal Loan Amount, Annual Interest Rate ($1\% - 15\%$), and Term ($5$, $15$, $20$, $30$ years).
- **Payment Breakdown**: Real-time computation of Monthly Payment, Total Interest Paid, and Total Loan Cost.
- **Visual Proportion**: Dynamic color-coded proportion bar visualizing Principal percentage vs. Total Interest percentage.
- **Early Payoff Accelerator**: Input extra monthly payments to calculate accelerated loan payoff and interest savings.
- **Amortization Milestone Table**: Scrollable breakdown showing Month index, Principal Paid, Interest Paid, and Remaining Balance.

### 4.4. Programmer Multi-Base & Bitwise Calculator
- **Simultaneous 4-Radix Live Display**: Live synchronized representation across **HEX** (Hexadecimal), **DEC** (Decimal), **OCT** (Octal), and **BIN** (Binary).
- **Word Sizes**: Toggleable word boundaries: `64-bit (QWORD)`, `32-bit (DWORD)`, `16-bit (WORD)`, and `8-bit (BYTE)`.
- **Interactive 64-Bit Binary Grid**: Visual grid of all bit positions ($63 \dots 0$). Click any individual bit to toggle it ($0 \leftrightarrow 1$) and update all bases instantaneously.
- **Bitwise Logic**: `AND`, `OR`, `XOR`, `NOT`, `NAND`, `NOR`.
- **Bit Shifts**: Arithmetic and logical Left Shift (`<<`) and Right Shift (`>>`).

### 4.5. Statistical Data Analysis
- **Flexible Ingestion**: Paste or type numbers separated by commas, spaces, or newlines.
- **Pre-Loaded Sample Datasets**: Includes real-world presets (*Exam Grades*, *Server Latencies in ms*, *Weekly Temperatures*).
- **Descriptive Statistics**:
  - Sample Size ($n$), Total Sum, Arithmetic Mean (Average), Median, Mode.
  - Extremes: Minimum, Maximum, and Range.
  - Dispersion: Sample Variance ($s^2$) and Standard Deviation ($s$).
  - Percentiles: First Quartile ($Q_1$), Median ($Q_2$), Third Quartile ($Q_3$), and Interquartile Range ($IQR$).

### 4.6. 2D Function Graphing & Plotting
- **HTML5 Canvas Coordinate Plane**: High-DPI hardware-accelerated 2D rendering.
- **Custom Expressions**: Plot any arbitrary function $f(x) = \dots$ using standard mathematical expressions.
- **Presets**: Sine Wave, Parabola, Cubic Polynomials, Damped Sinc Waves, and Gaussian Bell Distributions.
- **Interactive Viewport**: Zoom in, Zoom out, Pan offset reset, and mouse hover crosshairs with live coordinate tracking ($x, y$).

### 4.7. Calculation History Tape & Recall
- **Persistent Backend Logging**: Every calculation is recorded via `/api/calc/history`.
- **Slide-Out Tape Drawer**: View previous expressions, results, timestamps, and calculator modes.
- **One-Click Recall**: Click any historical entry to reload its formula directly into the active calculator terminal.
- **Export**: One-click CSV export and clipboard copying.

---

## 5. Keyboard Shortcuts Reference

OmniCalc supports physical keyboard navigation:

| Key | Function |
|---|---|
| `0` - `9` | Input numerical digits |
| `.` | Input decimal point |
| `+`, `-`, `*`, `/` | Arithmetic operators (`+`, `−`, `×`, `÷`) |
| `%` | Calculate percentage |
| `(`, `)` | Parentheses grouping |
| `Enter` or `=` | Evaluate expression |
| `Backspace` | Delete last entered character |
| `Escape` or `c` | Clear expression terminal (AC) |

---

## 6. REST API Reference

The Node.js Express backend provides the following endpoints:

### 6.1. Calculation History
```http
curl -s http://localhost:3000/api/calc/history

GET /api/calc/history
```
**Response (200 OK)**:
```json
{
  "ok": true,
  "data": [
    {
      "id": "h-1729012345",
      "expression": "sin(45°) + √(144)",
      "result": "12.7071",
      "mode": "scientific",
      "timestamp": "2026-10-15T10:14:00.000Z"
    }
  ]
}
```

```http
POST /api/calc/history
Content-Type: application/json

{
  "expression": "1250 * 1.0825",
  "result": "1353.125",
  "mode": "scientific"
}
```

```http
DELETE /api/calc/history
```
Clears the calculation history tape.

---

### 6.2. Loan & Mortgage Amortization
```http
POST /api/calc/amortization
Content-Type: application/json

{
  "principal": 300000,
  "annualRate": 6.5,
  "years": 30,
  "extraMonthly": 100
}
```
**Response (200 OK)**:
```json
{
  "ok": true,
  "data": {
    "monthlyPayment": 1896.20,
    "totalPayment": 612450.10,
    "totalInterest": 312450.10,
    "payoffMonths": 318,
    "schedule": [
      {
        "month": 1,
        "principal": 371.20,
        "interest": 1625.00,
        "balance": 299628.80
      }
    ]
  }
}
```

---

### 6.3. Currency Exchange Rates
```http
GET /api/calc/exchange-rates
```
**Response (200 OK)**:
```json
{
  "ok": true,
  "base": "USD",
  "rates": {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.78,
    "JPY": 154.20,
    "CAD": 1.36,
    "AUD": 1.52,
    "INR": 83.45,
    "CNY": 7.24,
    "CHF": 0.89
  },
  "updatedAt": "2026-10-15T10:14:00.000Z"
}
```

---

## 7. Deployment & Containerization

### 7.1. Running with Docker Compose (Recommended)
```bash
docker compose up -d --build
```
- Access application on: `http://localhost:3000` (or Cloud Shell Web Preview on port `3000`).
- Healthcheck endpoint: `http://localhost:3000/api/calc/history`

### 7.2. Running with Standalone Docker CLI
```bash
docker build -t omnicalc:latest .
docker run -d -p 3000:3000 -e NODE_ENV=production omnicalc:latest
```

### 7.3. Automated Jenkins CI/CD
A fully configured Jenkins setup is included in the `/Jenkins` directory.
- Start Jenkins Controller: `cd Jenkins && docker compose up -d --build`
- Access Jenkins Web UI: `http://localhost:8080`
- Pipeline file: `Jenkins/Jenkinsfile`

---

## 8. Local Development Quickstart

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start full-stack development server with HMR
npm run dev

# 3. Type check & Lint
npm run lint

# 4. Production build
npm run build
npm run start
```