import { THEME, ENHANCED_ANIMATIONS } from '../utils/Theme.js';
import { escapeXml } from '../utils/FormatUtils.js';

/**
 * Base SVG generator class with common SVG structure, theme, and animations
 */
export abstract class SVGGenerator {
  protected readonly theme = THEME;
  protected readonly width: number;
  protected height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Generate the SVG content
   */
  abstract generate(): string;

  /**
   * Create gradient definitions
   */
  protected createGradientDefinitions(): string {
    return `
  <defs>
    <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f97316" />
    </linearGradient>
    <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#dc2626" />
    </linearGradient>
    <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="gradient-pink" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ec4899" />
      <stop offset="100%" stop-color="#db2777" />
    </linearGradient>
    <linearGradient id="gradient-teal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14b8a6" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <linearGradient id="gradient-indigo" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="gradient-grey" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6b7280" />
      <stop offset="100%" stop-color="#4b5563" />
    </linearGradient>
  </defs>`;
  }

  /**
   * Create SVG wrapper with styles
   */
  protected createSVGWrapper(content: string, styles: string = ''): string {
    return `
<svg width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    ${styles}
    ${ENHANCED_ANIMATIONS}
  </style>
  ${this.createGradientDefinitions()}
  
  <rect x="0.5" y="0.5" width="${this.width - 1}" height="${this.height - 1}" rx="4.5" fill="${this.theme.bg}" stroke="${this.theme.border}"/>
  
  ${content}
</svg>`.trim();
  }

  /**
   * Create header text
   */
  protected createHeader(text: string, x = 25, y = 35): string {
    return `<text x="${x}" y="${y}" class="header">${escapeXml(text)}</text>`;
  }

  /**
   * Create subheader text
   */
  protected createSubheader(text: string, x = 25, y = 54): string {
    return `<text x="${x}" y="${y}" class="subheader">${escapeXml(text)}</text>`;
  }
}
