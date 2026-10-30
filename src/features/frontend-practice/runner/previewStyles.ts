/**
 * Styles injected into the sandbox preview so exercise components look like the
 * real InstaCart UI. Tailwind runs inside the iframe (see sandbox.ts) and reads
 * the same design tokens as client/src/index.css, so exercise code can use the
 * app's real class names (bg-app-green, text-app-text-light, …).
 */
export const THEME_CSS = `
@theme {
  --color-app-green: #1b3022;
  --color-app-green-light: #2d4a35;
  --color-app-green-lighter: #3d6b4a;
  --color-app-orange: #f97316;
  --color-app-orange-dark: #ea580c;
  --color-app-cream: #faf7f2;
  --color-app-cream-dark: #f0ebe3;
  --color-app-text: #1b3022;
  --color-app-text-light: #6b7280;
  --color-app-border: #e5e7eb;
  --color-app-success: #22c55e;
  --color-app-error: #ef4444;
  --color-app-warning: #f59e0b;
  --font-sans: "Outfit", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "DM Serif Display", Georgia, serif;
}
`;

export const BASE_CSS = `
body{margin:0;padding:16px;font-family:"Outfit",ui-sans-serif,system-ui,sans-serif;color:#1b3022;background:#faf7f2;-webkit-font-smoothing:antialiased}
a,button{transition:all .2s ease;cursor:pointer}
button:disabled{cursor:not-allowed}
input:focus{outline:none}
.flex-center{display:flex;align-items:center;justify-content:center}
`;
