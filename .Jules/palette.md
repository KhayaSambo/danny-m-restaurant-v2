## 2025-05-14 - Mobile Navbar & Global Overlay Accessibility
**Learning:** Fixed navigation bars on mobile often conflict with other global overlays (like cookie banners or chat widgets). To ensure a smooth experience, the mobile menu must have a strictly higher z-index and support multiple intuitive dismissal methods: an explicit 'X' button, clicking the backdrop, and the 'Escape' key.

**Action:** When implementing mobile menus or slide-out panels, always verify z-index stacking order against other global UI components and implement a unified dismissal hook for Escape and click-outside events.
