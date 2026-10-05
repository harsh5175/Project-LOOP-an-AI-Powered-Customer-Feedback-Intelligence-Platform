// Clean, vivid SVG data URIs for FolderPreview fan-out cards

function svgToUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const billingFolderImages = [
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#dc2626">
      <rect width="100" height="100" rx="50" fill="#fee2e2"/>
      <circle cx="50" cy="50" r="40" fill="#ef4444"/>
      <path d="M50 25 v30 M50 68 v5" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#e0e7ff"/>
      <circle cx="50" cy="50" r="40" fill="#6366f1"/>
      <text x="50" y="62" font-family="sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">504</text>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#fef3c7"/>
      <circle cx="50" cy="50" r="40" fill="#f59e0b"/>
      <text x="50" y="65" font-family="sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">$</text>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#dcfce7"/>
      <circle cx="50" cy="50" r="40" fill="#10b981"/>
      <path d="M35 50 l10 10 l25 -25" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none"/>
    </svg>
  `),
];

export const ssoFolderImages = [
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#e0f2fe"/>
      <circle cx="50" cy="50" r="40" fill="#0284c7"/>
      <path d="M50 24 L70 32 V52 C70 66 50 76 50 76 C50 76 30 66 30 52 V32 Z" fill="#ffffff"/>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#ede9fe"/>
      <circle cx="50" cy="50" r="40" fill="#8b5cf6"/>
      <circle cx="45" cy="45" r="14" fill="#ffffff"/>
      <rect x="42" y="45" width="28" height="8" rx="4" fill="#ffffff"/>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#fdf4ff"/>
      <circle cx="50" cy="50" r="40" fill="#d946ef"/>
      <text x="50" y="60" font-family="sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">SAML</text>
    </svg>
  `),
];

export const mobileFolderImages = [
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#fae8ff"/>
      <circle cx="50" cy="50" r="40" fill="#a855f7"/>
      <rect x="36" y="25" width="28" height="50" rx="6" stroke="#ffffff" stroke-width="6" fill="none"/>
      <circle cx="50" cy="67" r="3" fill="#ffffff"/>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#fee2e2"/>
      <circle cx="50" cy="50" r="40" fill="#f43f5e"/>
      <path d="M50 20 l8 18 l20 2 l-15 14 l4 20 l-17 -10 l-17 10 l4 -20 l-15 -14 l20 -2 z" fill="#ffffff"/>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#e0e7ff"/>
      <circle cx="50" cy="50" r="40" fill="#4f46e5"/>
      <text x="50" y="62" font-family="sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">iOS</text>
    </svg>
  `),
];

export const integrationsFolderImages = [
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#ccfbf1"/>
      <circle cx="50" cy="50" r="40" fill="#0d9488"/>
      <path d="M30 50 h40 M50 30 v40" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#ffedd5"/>
      <circle cx="50" cy="50" r="40" fill="#ea580c"/>
      <circle cx="50" cy="50" r="18" fill="#ffffff"/>
      <circle cx="50" cy="50" r="10" fill="#ea580c"/>
    </svg>
  `),
  svgToUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="#e0e7ff"/>
      <circle cx="50" cy="50" r="40" fill="#4338ca"/>
      <path d="M28 50 l14 -14 l14 14 l14 -14" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/>
    </svg>
  `),
];
