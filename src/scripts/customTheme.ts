export function applyCustomTheme() {
  const style = document.createElement('style');
  style.textContent = `
    body {
      background-color: #101010 !important;
      color: #fff !important;
    }

    button {
      border-radius: 6px !important;
      transition: all 0.2s ease;
    }

    button:hover {
      transform: scale(1.03);
    }
  `;
  document.head.appendChild(style);
}
