# Quick Start Guide
## iOS Liquid Glass Design System

### View the Demo
```bash
cd /home/clawd/.openclaw/workspace/mission-control
python3 -m http.server 8000
# Open: http://localhost:8000/public/demo.html
```

---

## Common Components

### Glass Card
```html
<div class="glass-card">
  <h3>Title</h3>
  <p>Content here</p>
</div>
```
**Variants:** `.glass-card.sm`, `.md`, `.lg`, `.xl`, `.accent-blue` (etc)

---

### Button
```html
<button class="btn btn-primary">Click Me</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-danger lg block">Large Full Width</button>
```
**Sizes:** `sm`, `lg`, `xl`  
**Colors:** `btn-primary`, `btn-secondary`, `btn-danger`, `btn-ghost`

---

### Input Field
```html
<div class="input-group">
  <label class="input-label">Email</label>
  <input type="email" class="input" placeholder="you@example.com">
  <span class="input-hint">We'll never share your email</span>
</div>
```
**Sizes:** default, `.sm`, `.lg`

---

### Badge
```html
<span class="badge badge-blue">Blue</span>
<span class="badge badge-green badge-dot">Online</span>
```
**Colors:** `badge-blue`, `badge-green`, `badge-orange`, `badge-red`, `badge-purple`, `badge-teal`

---

### Card with Header
```html
<div class="card">
  <div class="card-header">
    <h3>Title</h3>
  </div>
  <div class="card-body">
    Content here
  </div>
  <div class="card-footer">
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </div>
</div>
```

---

### Modal
```html
<button class="btn btn-primary" onclick="toggleModal()">Open</button>

<div class="glass-modal-overlay" id="myModal">
  <div class="glass-modal">
    <div class="glass-modal-header">
      <h2>Modal Title</h2>
      <button class="glass-modal-close" onclick="toggleModal()">✕</button>
    </div>
    <div class="glass-modal-body">
      Modal content goes here
    </div>
    <div class="glass-modal-footer">
      <button class="btn btn-secondary" onclick="toggleModal()">Close</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>

<script>
  function toggleModal() {
    document.getElementById('myModal').classList.toggle('active');
  }
</script>
```

---

### Responsive Grid
```html
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">
      <!-- Mobile: full width, Tablet: 6 cols, Desktop: 4 cols -->
    </div>
    <div class="col-12 col-md-6 col-lg-4">
      <!-- ... -->
    </div>
    <div class="col-12 col-md-6 col-lg-4">
      <!-- ... -->
    </div>
  </div>
</div>
```

---

### Navigation
```html
<nav class="nav-demo">
  <ul class="nav-list">
    <li><a href="#" class="nav-item active">Home</a></li>
    <li><a href="#" class="nav-item">About</a></li>
    <li><a href="#" class="nav-item">Contact</a></li>
  </ul>
</nav>
```

---

### Animations
```html
<div class="animate-fadeIn">Fade in</div>
<div class="animate-slideInUp">Slide up</div>
<div class="animate-bounce">Bounce</div>
<div class="animate-pulse">Pulse</div>
<div class="animate-spin">Spin</div>
<div class="animate-glow">Glow</div>

<!-- Or add transitions on any change -->
<div class="transition-normal">Smooth transition on any CSS change</div>
```

---

### Spacing Utilities
```html
<!-- Margin -->
<div class="m-4">All sides: 16px</div>
<div class="mx-3 my-4">Sides: 12px, Top/Bottom: 16px</div>

<!-- Padding -->
<div class="p-5">All sides: 20px</div>
<div class="px-4 py-2">Sides: 16px, Top/Bottom: 8px</div>
```
**Scale:** 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px)

---

### Typography
```html
<h1>Heading 1 (38px)</h1>
<h2>Heading 2 (32px)</h2>
<h3>Heading 3 (26px)</h3>
<p>Body text (16px)</p>
<small class="body-sm">Small text (14px)</small>
<span class="body-xs">Extra small (12px)</span>
```

---

### Text Colors
```html
<p style="color: var(--text-primary)">Primary text (100%)</p>
<p style="color: var(--text-secondary)">Secondary text (60%)</p>
<p style="color: var(--text-tertiary)">Tertiary text (35%)</p>
<p style="color: var(--accent-blue)">Accent color</p>
```

---

### Alerts
```html
<div class="alert success">✓ Success message</div>
<div class="alert info">ℹ Info message</div>
<div class="alert warning">⚠ Warning message</div>
<div class="alert error">✕ Error message</div>
```

---

## CSS Variables Reference

### Colors
```css
--bg-deep: #0a0e1a;
--bg-glass: rgba(255, 255, 255, 0.06);
--bg-glass-hover: rgba(255, 255, 255, 0.10);
--bg-glass-active: rgba(255, 255, 255, 0.14);
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.6);
--text-tertiary: rgba(255, 255, 255, 0.35);
--accent-blue: #007AFF;
--accent-green: #30D158;
--accent-orange: #FF9F0A;
--accent-red: #FF453A;
--accent-purple: #BF5AF2;
--accent-teal: #64D2FF;
```

### Sizing
```css
--radius-sm: 12px;      /* Buttons, small elements */
--radius-md: 16px;      /* Inputs, inner elements */
--radius-lg: 20px;      /* Cards, containers */
--radius-pill: 999px;   /* Badges, pills */

--blur-sm: blur(10px);
--blur-md: blur(20px);
--blur-lg: blur(40px);
```

### Timing
```css
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--duration-fast: 0.15s;
--duration-normal: 0.3s;
--duration-slow: 0.5s;
```

---

## File Structure
```
mission-control/
├── src/styles/
│   ├── main.css          ← Import this file
│   ├── reset.css
│   ├── theme.css
│   ├── glass.css
│   ├── layout.css
│   ├── components.css
│   └── animations.css
├── public/
│   └── demo.html         ← See all components
├── DESIGN_SYSTEM.md      ← Full documentation
└── QUICK_START.md        ← You are here
```

---

## Tips & Tricks

### Create Custom Accent Color
```css
/* Add to your CSS */
.glass-card.accent-custom {
  background: linear-gradient(135deg,
    rgba(147, 51, 234, 0.08) 0%,  /* Your color at 8% */
    var(--bg-glass) 100%);
  border-color: rgba(147, 51, 234, 0.2);  /* Your color at 20% */
}
```

### Add Custom Component
```css
.my-component {
  background: var(--bg-glass);
  backdrop-filter: var(--blur-lg);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 16px;
  transition: all var(--duration-normal) var(--ease-smooth);
}

.my-component:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-glass-highlight);
}
```

### Responsive Text
```html
<h1 style="font-size: clamp(24px, 5vw, 48px);">
  Responsive heading
</h1>
```

### Disable Animations
```css
/* For user preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Browser Compatibility
- ✓ Chrome 80+
- ✓ Firefox 75+
- ✓ Safari 13+
- ✓ Edge 80+
- ✓ Mobile browsers

---

## Support for Dark/Light Modes
The system includes automatic light mode support via:
```css
@media (prefers-color-scheme: light) {
  /* Light mode colors automatically applied */
}
```

---

## Accessibility Features
- ✓ High contrast mode support
- ✓ Reduced motion respects user preference
- ✓ Proper focus states (3px blue outline)
- ✓ Semantic HTML defaults
- ✓ WCAG 2.1 AA compliant colors

---

## Common Tasks

### Make Full Width Container
```html
<div class="container fluid">
  <!-- Full width with padding -->
</div>
```

### Center Content
```html
<div style="text-align: center;">
  <!-- Centered content -->
</div>

<!-- Or use flexbox -->
<div class="row justify-center items-center">
  <!-- Centered both ways -->
</div>
```

### Responsive Spacing
```html
<div class="my-2 my-md-4 my-lg-6">
  Different margins on different screen sizes
</div>
```

### Hide/Show on Breakpoints
```html
<div class="visible-mobile">
  Only shown on mobile
</div>
<div class="hidden-mobile">
  Hidden on mobile, shown on larger screens
</div>
```

---

## Need Help?
1. Check the demo: `/public/demo.html`
2. Read full docs: `DESIGN_SYSTEM.md`
3. View CSS source: `/src/styles/*.css`

All files are well-commented and self-documenting!
