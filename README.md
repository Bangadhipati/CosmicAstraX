<div align="center">

# 🌌 CosmicAstraX

### *Interactive 3D Solar System Orrery & Astronomical Ephemeris Simulator*

[![GitHub license](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)
[![Three.js](https://img.shields.io/badge/Three.js-r156-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
[![GitHub repo](https://img.shields.io/badge/GitHub-CosmicAstraX-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Bangadhipati/CosmicAstraX)

<br />

<p align="center">
  <strong>Explore the Cosmos in real-time 3D. Accurately calculate and visualize planetary positions, moons, asteroids, and comets across centuries using rigorous Keplerian orbital mechanics.</strong>
</p>

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Astronomical Engine & Mathematics](#-astronomical-engine--mathematics)
- [Project Architecture](#-project-architecture)
- [Quick Start](#-quick-start)
- [Deployment on Netlify](#-deployment-on-netlify)
- [Navigation & Controls](#-navigation--controls)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**CosmicAstraX** is a web-based, hardware-accelerated 3D Orrery and celestial mechanics simulator. Built upon **Three.js** and **WebGL**, it models the Sun, planets, planetary moons, dwarf planets, near-Earth asteroids (such as *1566 Icarus*), extreme trans-Neptunian objects (such as *90377 Sedna*), and periodic comets (such as *Halley*).

Unlike static planetarium apps, CosmicAstraX employs an analytical **Newton-Raphson orbital solver** executing directly in the client browser, calculating the real ephemerides and orbital positions of celestial bodies across an epoch window spanning from **3000 BC to 3000 AD**.

---

## 🚀 Key Features

- **🪐 Rigorous Orbital Mechanics**:
  - Ephemeris calculations derived from NASA/JPL planetary data.
  - Numerically solves Kepler's Equation ($M = E - e \sin E$) at 60 FPS.
  - Accurate orbital eccentricity, inclination, longitude of ascending node, argument of perihelion, and mean anomaly.

- **☀️ Photorealistic 3D Visuals & Shaders**:
  - High-resolution planetary surface textures and atmospheric scattering.
  - Clean spherical Solar body rendered with custom WebGL illumination.
  - Dynamic ring systems for Saturn and Uranus with alpha transparency.
  - High-magnitude stellar background map (`starmap_2020_8k.jpg`).

- **🔭 Deep Space & Extreme Orbit Support**:
  - Camera far clipping plane extended to `100,000` units with a max distance of `1400 AU`.
  - Full view of highly eccentric orbits, including Apollo asteroid *1566 Icarus* (perihelion ~0.186 AU) to trans-Neptunian dwarf planets like *90377 Sedna* (aphelion ~893 AU).

- **🎯 Interactive Orbit & Focus Mechanics**:
  - Distinct hierarchical color-coding:
    - **Planets**: Crisp green label (`#4ade80`), unselected white orbit paths, vibrant red active highlight (`#ef4444`).
    - **Non-Planetary Bodies**: Clean white label (`#f8fafc`), light blue orbit paths (`#66aaff`), golden active highlight (`#ffd700`).
  - Selection dimming: non-selected orbits automatically soften to 15% opacity to emphasize the focused body's trajectory.
  - Smooth camera interpolation and focal locking powered by Tween.js.

- **⏱️ Temporal Navigation (Time Machine)**:
  - Scrub forward and backward in time from 3000 BC to 3000 AD.
  - Variable speed playback: real-time, days-per-second, and years-per-second simulation rates.
  - Jump instantly to the current moment with the **Now** trigger.

- **🛡️ UI Touch & Zoom Safeguards**:
  - Intercepted browser pinch/wheel scaling to keep navigation bars, sidebars, and HUD elements crisp and stable across desktop, mobile, and tablet displays.

---

## 🛠️ Tech Stack

CosmicAstraX is engineered using modern web standards, lightweight libraries, and mathematical solvers without unnecessary framework overhead.

### Core & Languages
| Technology | Badge | Description |
| :--- | :--- | :--- |
| **JavaScript (ES6+)** | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) | Core application logic, modular orbital solvers, and runtime management |
| **HTML5** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) | Semantic structure, viewport metadata, and UI overlay containers |
| **CSS3** | ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) | Glassmorphic HUD styling, responsive sidebars, and typography |
| **GLSL** | ![GLSL](https://img.shields.io/badge/GLSL-5586A4?style=for-the-badge&logo=opengl&logoColor=white) | Custom hardware-accelerated shaders and lighting models |

### 3D Graphics & Animation
| Technology | Badge | Description |
| :--- | :--- | :--- |
| **Three.js** | ![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white) | 3D scene graphing, perspective cameras, mesh geometries, and materials |
| **WebGL** | ![WebGL](https://img.shields.io/badge/WebGL-990000?style=for-the-badge&logo=webgl&logoColor=white) | Low-level GPU rendering context for high-framerate celestial display |
| **Tween.js** | ![Tween.js](https://img.shields.io/badge/Tween.js-FF6F00?style=for-the-badge&logo=javascript&logoColor=white) | Smooth camera panning, orbital transitions, and easing animations |

### UI & Interaction
| Technology | Badge | Description |
| :--- | :--- | :--- |
| **jQuery** | ![jQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white) | DOM manipulation, date selection controls, and dynamic event listeners |
| **jQuery UI** | ![jQuery UI](https://img.shields.io/badge/jQuery_UI-10659E?style=for-the-badge&logo=jquery&logoColor=white) | Interactive sliders, modal panels, and accordion UI elements |

### Ephemerides & Scientific Data
| Technology | Badge | Description |
| :--- | :--- | :--- |
| **NASA JPL Horizons** | ![NASA](https://img.shields.io/badge/NASA_JPL_Data-0B3D91?style=for-the-badge&logo=nasa&logoColor=white) | Observational Keplerian orbital elements and planetary constants |
| **CSV Datasets** | ![CSV](https://img.shields.io/badge/CSV_Datasets-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white) | Tabular orbital parameter tables for planets, asteroids, and stars |

### Development, Version Control & CI/CD
| Technology | Badge | Description |
| :--- | :--- | :--- |
| **Netlify** | ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white) | Production hosting, edge distribution, and continuous deployment |
| **Git** | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) | Distributed version control system |
| **GitHub** | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white) | Remote source code repository and automated deployment triggers |
| **Node.js / npm** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) | Package dependency management |

---

## 🔬 Astronomical Engine & Mathematics

CosmicAstraX computes planetary positions using classical celestial mechanics:

1. **Keplerian Elements**:
   Each body is parameterized by six orbital elements:
   - $a$: Semi-major axis
   - $e$: Eccentricity
   - $I$: Orbital inclination
   - $L$ / $M_0$: Mean longitude / Mean anomaly at epoch
   - $\varpi$: Longitude of perihelion
   - $\Omega$: Longitude of ascending node

2. **Kepler's Equation**:
   The eccentric anomaly $E$ is determined from the mean anomaly $M$:
   $$M = E - e \sin E$$

3. **Newton-Raphson Solver**:
   Iteratively computed until convergence ($|E_{n+1} - E_n| < 10^{-6}$):
   $$E_{n+1} = E_n - \frac{E_n - e \sin E_n - M}{1 - e \cos E_n}$$

4. **Heliocentric 3D Coordinates**:
   True anomaly $\nu$ and radius $r$ are mapped into 3D Cartesian space via Euler angle rotation matrices corresponding to $(I, \Omega, \omega)$.

---

## 📁 Project Architecture

```text
CosmicAstraX/
├── CSS/
│   └── orrery.css               # Main styling, responsive HUD, label color hierarchies
├── data/
│   ├── planets_*.csv            # Orbital elements for major planets (1850-2050 & 3000BC-3000AD)
│   ├── asteroids*.csv           # Keplerian data for asteroids (Icarus, Ceres, Vesta, etc.)
│   ├── comets.csv               # Highly eccentric comets (Halley, Encke, Swift-Tuttle)
│   ├── moons.csv                # Natural satellites orbital datasets
│   ├── stars_*.csv              # Star catalogs with magnitude measurements
│   └── 1k_*.jpg / *.png         # High-resolution planetary, ring, and solar textures
├── js/
│   └── orrery/
│       ├── launch.js            # Main bootstrap entry point
│       └── src/
│           ├── setup.js         # Scene initialization, camera clipping, lighting, materials
│           ├── maker.js         # Three.js 3D mesh instantiators (Sun sphere, planets, rings)
│           ├── spacetime.js     # Date arithmetic, Julian day conversion, Keplerian solvers
│           ├── ui.js            # HUD controls, color pickers, orbit dimming & selection logic
│           └── algorithm.js     # Orbital path calculations & point generator
├── fonts/                       # Custom typography assets
├── index.html                   # Main application interface and canvas root
├── package.json                 # Dependency definitions (Three.js, jQuery, Tween.js)
└── README.md                    # Project documentation
```

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Bangadhipati/CosmicAstraX.git
cd CosmicAstraX
```

### 2. Install Dependencies (Optional)
```bash
npm install
```

### 3. Launch Locally
Since CosmicAstraX uses WebGL textures and ES modules, serve it via any static HTTP server:

```bash
# Using Python 3:
python -m http.server 8080

# Using Node.js npx:
npx serve .
```

Open your browser and navigate to `http://localhost:8080`.

---

## 🌐 Deployment on Netlify

CosmicAstraX is ready for deployment on **Netlify**:

1. **Log in to Netlify** and select **Add new site > Import an existing project**.
2. Connect your **GitHub** account and select the `Bangadhipati/CosmicAstraX` repository.
3. Configure the build settings:
   - **Branch to deploy**: `main`
   - **Base directory**: *(leave empty)*
   - **Build command**: *(leave empty)*
   - **Publish directory**: `.` (or root directory where `index.html` resides)
4. Click **Deploy CosmicAstraX**.

Any subsequent push to `origin main` will trigger an automated build and continuous deployment to Netlify edge servers.

---

## 🎮 Navigation & Controls

| Input | Action |
| :--- | :--- |
| **Left Click + Drag** | Rotate view angle around current focal point |
| **Right Click + Drag** | Pan camera across 3D space |
| **Mouse Wheel / Pinch** | Smooth zoom in and out (up to 1400 AU range) |
| **Click on Celestial Body** | Focus camera, show telemetry data, and highlight orbit path |
| **Time Controls (Bottom Bar)**| Play, pause, rewind, fast-forward, or scrub dates |
| **Reset / Deselect** | Return camera to full system overview and restore default orbits |

---

## 📄 License & Credits

- **License**: Released under the [ISC License](LICENSE).
- **Planetary Data**: NASA Jet Propulsion Laboratory (JPL) Solar System Dynamics.
- **Star Catalog**: Hipparcos & Yale Bright Star Catalogs.

---

<div align="center">
  <sub>Developed with curiosity for space exploration. Made for astronomers, students, and stargazers worldwide.</sub>
</div>
