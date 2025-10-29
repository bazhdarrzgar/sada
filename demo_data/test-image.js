// Demo image data for testing the enhanced image cropper
export const demoImageData = `data:image/svg+xml;base64,${btoa(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="600" fill="url(#bg)"/>
  
  <!-- Tech elements -->
  <circle cx="200" cy="150" r="40" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <circle cx="600" cy="200" r="60" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <circle cx="400" cy="400" r="30" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  
  <!-- CPU/GPU representation -->
  <rect x="300" y="250" width="200" height="100" rx="10" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
  <rect x="320" y="270" width="20" height="20" fill="rgba(255,255,255,0.6)"/>
  <rect x="350" y="270" width="20" height="20" fill="rgba(255,255,255,0.6)"/>
  <rect x="380" y="270" width="20" height="20" fill="rgba(255,255,255,0.6)"/>
  <rect x="410" y="270" width="20" height="20" fill="rgba(255,255,255,0.6)"/>
  <rect x="440" y="270" width="20" height="20" fill="rgba(255,255,255,0.6)"/>
  <rect x="470" y="270" width="20" height="20" fill="rgba(255,255,255,0.6)"/>
  
  <rect x="320" y="300" width="20" height="20" fill="rgba(255,255,255,0.4)"/>
  <rect x="350" y="300" width="20" height="20" fill="rgba(255,255,255,0.4)"/>
  <rect x="380" y="300" width="20" height="20" fill="rgba(255,255,255,0.4)"/>
  <rect x="410" y="300" width="20" height="20" fill="rgba(255,255,255,0.4)"/>
  <rect x="440" y="300" width="20" height="20" fill="rgba(255,255,255,0.4)"/>
  <rect x="470" y="300" width="20" height="20" fill="rgba(255,255,255,0.4)"/>
  
  <!-- Main text -->
  <text x="400" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">GPU</text>
  <text x="400" y="210" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)" text-anchor="middle">Processing Power</text>
  
  <!-- Corner decorations -->
  <path d="M50,50 L100,50 L100,60 L60,60 L60,100 L50,100 Z" fill="rgba(255,255,255,0.3)"/>
  <path d="M750,50 L700,50 L700,60 L740,60 L740,100 L750,100 Z" fill="rgba(255,255,255,0.3)"/>
  <path d="M50,550 L100,550 L100,540 L60,540 L60,500 L50,500 Z" fill="rgba(255,255,255,0.3)"/>
  <path d="M750,550 L700,550 L700,540 L740,540 L740,500 L750,500 Z" fill="rgba(255,255,255,0.3)"/>
</svg>
`)}`