// Wait for Gmail to fully load, then apply dark theme via Gmail's own settings URL
window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style')
  style.textContent = `
    .wa, .wl, [role="complementary"] .bAw { display: none !important; }
  `
  document.head.appendChild(style)
})
