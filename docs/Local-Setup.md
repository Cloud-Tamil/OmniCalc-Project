# OmniCalc Local Setup & Development Guide

This guide walks you through setting up, running, and contributing to **OmniCalc** on your local machine across macOS, Linux, Windows (WSL2 / PowerShell), or Google Cloud Shell.

---

## 1. Prerequisites

Before starting, ensure your system has the following installed:

- **Node.js**: `v20.0.0` or higher (`v22.x` LTS recommended for native TypeScript strip-types execution).
  ```bash
  node --version
  ```
- **npm**: `v9.0.0` or higher (bundled with Node.js).
  ```bash
  npm --version
  ```
- **Git**: Installed and configured on your terminal.
  ```bash
  git --version
  ```

---

## 2. Clone & Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Cloud-Tamil/OmniCalc-Project-master.git
   cd OmniCalc-Project-master
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

   The default `.env` template:
   ```env
   # Base Application URL
   APP_URL="http://localhost:3000"
   ```

---

## 3. Install Dependencies

Install all dependencies cleanly:

```bash
npm install --legacy-peer-deps
```

This installs:
- **Backend Architecture**: `express`, `tsx`, `typescript`, `@types/node`, `@types/express`.
- **Frontend Workstation**: `react`, `react-dom`, `vite`, `@tailwindcss/vite`, `tailwindcss`, `lucide-react`, `motion`.

---

## 4. Running the Development Server

Start the full-stack development server with Vite hot module replacement (HMR) and Express backend APIs:

```bash
npm run dev
```

Output:
```
Initializing Vite development middleware server...
Precision Calculator server listening on http://0.0.0.0:3000
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

> **Using Google Cloud Shell?**
> Click the **Web Preview** icon at the top right of the terminal, select **Change port**, enter `3000`, and click **Change and Preview**.

---

## 5. Type Checking & Code Quality

Run strict TypeScript typechecking and linting:

```bash
npm run lint
```

---

## 6. Building for Production

Compile and bundle client assets to the `/dist` directory:

```bash
npm run build
```

Run the compiled production server:

```bash
npm run start
```

---

## 7. OmniCalc Architecture Overview

OmniCalc consolidates 6 specialized calculation engines into a single unified workstation:

| Engine | Description | Capabilities |
|---|---|---|
| **Scientific Calculator** | Precision math engine | Trig, log, roots, powers, parentheses auto-balancer, physical constants ($\pi, e, \phi, c, h, G$) |
| **Programmer Calculator** | Multi-base integer & bit manipulation | Live simultaneous HEX, DEC (signed/unsigned), OCT, BIN views, 64-bit interactive bit-flipper |
| **Loan & Mortgage** | Financial amortization modeler | Principal vs. interest payoff curves, extra payment simulations, CSV schedule export |
| **2D Grapher** | Canvas function plotter | Drag-to-pan, scroll zoom, coordinate HUD, multiple preset curves |
| **Unit Converter** | Multi-domain converter | Length, mass, temp, digital storage, area, speed, time, live currency exchange |
| **Statistics Engine** | Data analytics workstation | Mean, median, mode, sample variance, standard deviation, quartiles, histogram buckets |
| **Calculation Tape** | Slide-out persistent log | Backend sync (`/api/calc/history`), one-click expression recall, CSV export |
