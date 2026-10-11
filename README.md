
# CosmicAstraX

### *Interactive 3D Solar System Orrery & Astronomical Ephemeris Simulator*

<img width="2864" height="1536" alt="screenshot-1791722853700" src="https://github.com/user-attachments/assets/84575623-166b-4779-ba0c-521c2f4e9fca" />

### 🔗 **[LIVE LINK](https://cosmicastrax.netlify.app)**

Explore the Cosmos in real-time 3D. Accurately calculate and visualize planetary positions, moons, asteroids, and comets across centuries using rigorous Keplerian orbital mechanics.

## 🌟 About the Project

**CosmicAstraX** is a web-based, hardware-accelerated 3D Orrery and celestial mechanics simulator. Powered by **Three.js** and **WebGL**, it accurately models the Sun, planets, planetary satellites, dwarf planets, near-Earth asteroids (such as *1566 Icarus*), extreme trans-Neptunian objects (such as *90377 Sedna*), and periodic comets (such as *Halley*).

Unlike static planetarium models, CosmicAstraX utilizes an analytical **Newton-Raphson orbital solver** running in real-time within the client browser. It calculates the physical positions and trajectories of celestial bodies across an astronomical window spanning from **3000 BC to 3000 AD**.

## 🚀 Key Features

- **🪐 Rigorous Orbital Mechanics**:
  - Ephemeris calculations derived from NASA/JPL planetary data.
  - Numerically solves Kepler's Equation ($M = E - e \sin E$) at 60 FPS.
  - Computes eccentricity, inclination, longitude of ascending node, argument of perihelion, and mean anomaly.

- **☀️ Photorealistic 3D Visuals & Shaders**:
  - High-resolution planetary surface textures and custom atmospheric glow shaders.
  - Clean spherical Solar body rendered with custom WebGL illumination.
  - Dynamic ring systems for Saturn and Uranus with alpha transparency.
  - High-magnitude stellar background map (`starmap_2020_8k.jpg`).

- **🔭 Deep Space & Extreme Orbit Support**:
  - Camera far clipping plane extended to `100,000` units with a maximum view distance of `1400 AU`.
  - Seamlessly renders orbits from near-Sun asteroids like Apollo asteroid *1566 Icarus* (perihelion ~0.186 AU) to trans-Neptunian dwarf planets like *90377 Sedna* (aphelion ~893 AU).

- **🎯 Interactive Orbit & Focus Mechanics**:
  - Hierarchical color-coding:
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

## 🛠️ Tech Stack

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
| **jQuery UI** | ![jQuery UI](https://img.shields.io/badge/jQuery_UI-10659E?style=for-the-badge&logo=jquery&logoColor=white) | Interactive sliders, modal panels, and autocomplete search |

### Ephemerides & Scientific Data
| Technology | Badge | Description |
| :--- | :--- | :--- |
| **NASA JPL Horizons** | ![NASA](https://img.shields.io/badge/NASA_JPL_Data-0B3D91?style=for-the-badge&logo=nasa&logoColor=white) | Observational Keplerian orbital elements and planetary constants |
| **CSV Datasets** | ![CSV](https://img.shields.io/badge/CSV_Datasets-217346?style=for-the-badge&logo=microsoft-excel&logoColor=white) | Tabular orbital parameter tables for planets, asteroids, and stars |

### Deployment & CI/CD
| Technology | Badge | Description |
| :--- | :--- | :--- |
| **Netlify** | ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white) | Production hosting, edge distribution, and continuous deployment |
| **Git** | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) | Distributed version control system |
| **GitHub** | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white) | Source code repository and automated deployment triggers |

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

## 🎮 Navigation & Controls

| Input | Action |
| :--- | :--- |
| **Left Click + Drag** | Rotate view angle around current focal point |
| **Right Click + Drag** | Pan camera across 3D space |
| **Mouse Wheel / Pinch** | Smooth zoom in and out (up to 1400 AU range) |
| **Click on Celestial Body** | Focus camera, show telemetry data, and highlight orbit path |
| **Time Controls (Bottom Bar)**| Play, pause, rewind, fast-forward, or scrub dates |
| **Reset / Deselect** | Return camera to full system overview and restore default orbits |

<div>
  <sub>Developed with curiosity for space exploration. Made for astronomers, students, and stargazers worldwide.</sub>
  <br />
  <sub>🚀 Live at <a href="https://cosmicastrax.netlify.app">cosmicastrax.netlify.app</a></sub>
</div>
