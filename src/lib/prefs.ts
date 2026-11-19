/* Display preferences. The product has a single visual identity, so the only
 * preference left is text size. Stored under the same key as before. */

export type FontName = 'sm' | 'md' | 'lg';

export const getFont = (): FontName => {
  try { return (localStorage.getItem('mhd_font') as FontName) || 'md'; } catch { return 'md'; }
};

export function applyFont(v: FontName) {
  document.body.dataset.font = v;
  try { localStorage.setItem('mhd_font', v); } catch { /* storage may be blocked */ }
}

/** Apply stored prefs at startup (called from main.tsx). */
export function initPrefs() {
  applyFont(getFont());
  try { localStorage.removeItem('mhd_theme'); } catch { /* legacy key from the removed theme switcher */ }
}
