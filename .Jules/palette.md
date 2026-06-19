## 2025-05-14 - Mobile Navbar & Global Overlay Accessibility
**Learning:** Fixed navigation bars on mobile often conflict with other global overlays (like cookie banners or chat widgets). To ensure a smooth experience, the mobile menu must have a strictly higher z-index and support multiple intuitive dismissal methods: an explicit 'X' button, clicking the backdrop, and the 'Escape' key.

**Action:** When implementing mobile menus or slide-out panels, always verify z-index stacking order against other global UI components and implement a unified dismissal hook for Escape and click-outside events.

## 2025-05-15 - Cart Drawer Accessibility & Interaction
**Learning:** When implementing backdrop dismissal for drawers or menus, using `stopPropagation` on the internal content container is critical to prevent nested clicks from triggering a close event. Additionally, icon-only quantity adjustment buttons in carts are frequently missed by screen readers; they require explicit 'aria-label' attributes to be truly accessible.

**Action:** Always wrap internal modal content with a click handler that calls `e.stopPropagation()` when implementing backdrop click-to-close. Ensure all +/- buttons in cart interfaces have descriptive ARIA labels.
