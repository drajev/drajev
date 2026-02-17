import type { GitHubStats, LanguageStats } from '../types.js';
import { SVGGenerator } from './SVGGenerator.js';
import { formatLinesOfCode, escapeXml } from '../utils/FormatUtils.js';

/**
 * Generates the languages SVG card
 */
export class LanguagesGenerator extends SVGGenerator {
  readonly #barHeight = 12; // Sleeker, thinner bars
  readonly #barSpacing = 52; // Increased spacing for "Label-Above" layout
  readonly #maxBarWidth = 720;
  readonly #headerHeight = 80;
  readonly #bottomPadding = 30;
  #stats: GitHubStats;

  constructor(stats: GitHubStats) {
    super(800, 0); // Height will be calculated dynamically
    this.#stats = stats;
  }

  generate(): string {
    // 1. Smart Filtering: Sort and take Top 8
    const sortedLanguages = [...this.#stats.languages].sort(
      (a, b) => b.size - a.size,
    );

    // Separate Top N and the rest
    const topLimit = 8;
    const mainLanguages = sortedLanguages.slice(0, topLimit);
    const otherLanguages = sortedLanguages.slice(topLimit);

    const displayLangs: LanguageStats[] = [...mainLanguages];

    // 2. Aggregate "Other"
    // This cleans up the "Long Tail" of tiny languages (Dockerfiles, Shell, etc.)
    if (otherLanguages.length > 0) {
      const otherSize = otherLanguages.reduce((acc, l) => acc + l.size, 0);
      const otherPercentage = otherLanguages.reduce(
        (acc, l) => acc + l.percentage,
        0,
      );

      // Only add "Other" if it's significant (> 0.5%)
      if (otherPercentage > 0.5) {
        displayLangs.push({
          name: 'Other',
          size: otherSize,
          percentage: otherPercentage,
          color: '#64748b', // Slate-500
        });
      }
    }

    // 3. Calculate dynamic height
    this.height =
      this.#headerHeight +
      displayLangs.length * this.#barSpacing +
      this.#bottomPadding;

    let barsSVG = '';
    let styleRules = '';
    let yOffset = this.#headerHeight;

    displayLangs.forEach((lang, index) => {
      const barWidth = ((lang.percentage / 100) * this.#maxBarWidth).toFixed(2);
      const delay = 0.2 + index * 0.1;
      const linesOfCode = formatLinesOfCode(lang.size);

      // Label Logic: "TypeScript" (Bold)  "1.2M lines" (Grey)
      const nameText = lang.name;
      const statsText = `${linesOfCode} lines`;

      // Create unique animation for each bar
      styleRules += `
        @keyframes slide-right-${index} {
          from { width: 0; }
          to { width: ${barWidth}px; }
        }
        .bar-${index} {
          animation: slide-right-${index} 1s cubic-bezier(0.2, 0, 0.2, 1) ${delay}s forwards;
        }
        .fade-${index} {
          animation: fadeIn 0.5s ease-out ${delay}s forwards;
          opacity: 0;
        }
      `;

      barsSVG += `
        <g transform="translate(40, ${yOffset})">
          <!-- Row 1: Text Labels (Above Bar) -->
          <!-- Left: Language Name + Lines -->
          <text x="0" y="0" class="lang-name fade-${index}">${escapeXml(nameText)}</text>
          <text x="${this.#calculateTextWidth(nameText) + 10}" y="0" class="lang-lines fade-${index}">${statsText}</text>
          
          <!-- Right: Percentage -->
          <text x="${this.#maxBarWidth}" y="0" text-anchor="end" class="lang-percent fade-${index}">${lang.percentage.toFixed(1)}%</text>

          <!-- Row 2: Progress Bar -->
          <!-- Track (Background) -->
          <rect x="0" y="12" width="${this.#maxBarWidth}" height="${this.#barHeight}" rx="6" fill="${this.theme.border}" opacity="0.2"/>
          
          <!-- Filled Bar -->
          <rect x="0" y="12" width="0" height="${this.#barHeight}" rx="6" fill="${lang.color}" class="bar-${index}">
             <title>${lang.name}: ${linesOfCode} lines</title>
          </rect>
        </g>`;

      yOffset += this.#barSpacing;
    });

    const styles = `
      .header { font: 600 22px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      
      /* Typography Improvements */
      .lang-name { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      .lang-lines { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }
      .lang-percent { font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      
      .fade-in { animation: fadeIn 1s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      
      ${styleRules}
    `;

    const content = `
      <g class="fade-in">
        ${this.createHeader('💻 Top Languages')}
      </g>
      ${barsSVG}
    `;

    return this.createSVGWrapper(content, styles);
  }

  /**
   * Simple helper to estimate text width for spacing
   * (Since we can't measure DOM elements in Node.js)
   */
  #calculateTextWidth(text: string): number {
    // Approx 8px per char for bold font
    return text.length * 9;
  }
}
