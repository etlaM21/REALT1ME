# Project REALT1ME: Pure Vector Concept

"REALT1ME" is a minimalist 3D clock representing actual celestial mechanics. Instead of a flat dial, it uses three hands (vectors) originating from a single central point (Earth) in a 3D space.

### The Hands
1.  **The Year Hand (Sun Vector):**
    * **Speed:** Completes one sweep every 365.24 days.
    * **Plane:** Rides on a flat, horizontal baseline (The Ecliptic).
    * **Function:** Points to the exact position of the Sun.

2.  **The Day Hand (Earth Rotation Vector):** 
    * **Speed:** Completes one sweep every ~24 hours.
    * **Plane:** Permanently tilted at **23.5°** relative to the Year Hand's plane (The Equator).
    * **Function:** Represents a specific meridian on Earth facing outward.

3.  **The Moon Hand (Lunar Vector):** 
    * **Speed:** Completes one sweep every 29.53 days (Synodic month).
    * **Plane:** Tilted at **5.1°** relative to the Year Hand's plane.
    * **Function:** Points to the exact position of the Moon.

## Reading the Clock
Because the clock is purely structural, data is read via the angles between the hands:
* **Time of Year:** The position of the Year Hand on its 360° flat track.
* **Time of Day:** The position of the Day Hand relative to the Year Hand. (When they align as closely as their tilts allow, it is Solar Noon).
* **Moon Phase:** The angle between the Moon Hand and the Year Hand.
    * **0° (Aligned):** New Moon
    * **90° (Perpendicular):** Quarter Moon (Half)
    * **180° (Opposite):** Full Moon

## JS Libraries
To animate this in ThreeJS, use client-side astronomy libraries that calculate exact celestial coordinates locally, preventing API lag.
* **`astronomy-engine`:** Highly recommended. Provides exact 3D vectors for Sun and Moon based on the system's current time.
* **`suncalc`:** A lighter alternative for basic sun/moon positioning.

## Next Steps for the ThreeJS Prototype
1.  **Setup Scene:** Initialize an empty ThreeJS scene with a central `AxesHelper` for reference.
2.  **Draw Vectors:** Use `THREE.ArrowHelper` or `THREE.Line` to draw the three hands originating from `(0,0,0)`.
3.  **Apply Logic:** Use `astronomy-engine` to get the real-time coordinates of the Sun and Moon, converting their Right Ascension and Declination into ThreeJS `(x, y, z)` vector positions.
4.  **Simulate:** Add a UI slider to fast-forward time to watch the complex 3D dance of the three vectors.