import type { GitHubStats } from '../types.js';
import { SVGGenerator } from './SVGGenerator.js';

/**
 * Generates combined productivity rhythm (Clock) and Weekly Cadence (Donut)
 */
export class ProductivitySemanticsGenerator extends SVGGenerator {
  #stats: GitHubStats;

  // Colors for Days of the Week (Mon -> Sun)
  readonly #dayColors = [
    '#f472b6', // Mon: Pink
    '#fbbf24', // Tue: Amber
    '#34d399', // Wed: Emerald
    '#60a5fa', // Thu: Blue
    '#818cf8', // Fri: Indigo
    '#a78bfa', // Sat: Violet (Weekend)
    '#fb7185', // Sun: Rose (Weekend)
  ];

  readonly #dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  constructor(stats: GitHubStats) {
    super(800, 380);
    this.#stats = stats;
  }

  generate(): string {
    // 1. Prepare Data
    const weeklyCadenceSVG = this.#generateWeeklyCadence();
    const productivitySVG = this.#generateProductivityRhythm();

    // 2. Define Styles
    const styles = `
      .header { font: 600 20px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      .subheader { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }
      
      /* Chart Text */
      .chart-label { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }
      .chart-value { font: 600 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      .chart-sub { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }
      
      /* Legend */
      .legend-key { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      .legend-val { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }
      
      /* Animations */
      .bar-anim { 
        animation: scaleUp 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
        stroke-dasharray: 200; 
        stroke-dashoffset: 200; 
        transform-origin: center;
      }
      .slice-anim {
        animation: rotateIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        transform-origin: 240px 170px; /* Updated transform origin to match new CY */
      }
      
      @keyframes scaleUp { to { stroke-dashoffset: 0; } }
      @keyframes rotateIn { 
        from { transform: scale(0.8) rotate(-10deg); opacity: 0; }
        to { transform: scale(1) rotate(0deg); opacity: 1; }
      }
    `;

    // 3. Define Gradients
    const defs = `
      <defs>
        <linearGradient id="grad-day" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
        <linearGradient id="grad-night" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
      </defs>
    `;

    // 4. Layout Assembly
    const content = `
      ${defs}
      
      <!-- Header Section -->
      <g transform="translate(0, 0)">
        ${this.createHeader('⏰ Productivity & Weekly Cadence')}
      </g>

      <!-- Left Panel: Weekly Cadence (Donut) -->
      <g transform="translate(20, 0)">
        ${weeklyCadenceSVG}
      </g>

      <!-- Vertical Divider Line -->
      <line x1="460" y1="70" x2="460" y2="340" stroke="${this.theme.border}" stroke-width="1" opacity="0.3" stroke-dasharray="4 4" />

      <!-- Right Panel: Productivity (Clock) -->
      <g transform="translate(430, 0)">
        ${productivitySVG}
      </g>
    `;

    return this.createSVGWrapper(content, styles);
  }

  /**
   * Generates the Radial Clock Chart (Right Side)
   */
  #generateProductivityRhythm(): string {
    const hours = this.#stats.productivityStats.hourlyDistribution;
    const maxCommits = Math.max(...hours) || 1;

    const cx = 185;
    const cy = 210;
    const r = 60;
    const maxBarH = 70;

    let barsSVG = '';

    const trackSVG = `
      <circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="${this.theme.border}" stroke-width="1" opacity="0.2" />
      <circle cx="${cx}" cy="${cy}" r="${r + maxBarH + 5}" fill="none" stroke="${this.theme.border}" stroke-width="1" opacity="0.1" stroke-dasharray="4 4"/>
    `;

    hours.forEach((count, hour) => {
      if (count === 0) return;
      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      const barHeight = Math.max(4, (count / maxCommits) * maxBarH);
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      const x2 = cx + (r + barHeight) * Math.cos(angle);
      const y2 = cy + (r + barHeight) * Math.sin(angle);

      const isDay = hour >= 6 && hour <= 18;
      const colorUrl = isDay ? 'url(#grad-day)' : 'url(#grad-night)';

      barsSVG += `
        <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" 
              x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" 
              stroke="${colorUrl}" stroke-width="5" stroke-linecap="round" 
              class="bar-anim" style="animation-delay: ${hour * 0.03}s">
        </line>
      `;
    });

    const labels = [
      { text: '12 AM', x: cx, y: cy - r - maxBarH - 15 },
      { text: '6 AM', x: cx + r + maxBarH + 25, y: cy + 4 },
      { text: '12 PM', x: cx, y: cy + r + maxBarH + 20 },
      { text: '6 PM', x: cx - r - maxBarH - 25, y: cy + 4 },
    ];

    const labelsSVG = labels
      .map(
        l =>
          `<text x="${l.x}" y="${l.y}" text-anchor="middle" class="chart-label">${l.text}</text>`,
      )
      .join('');

    const centerText = `
      <text x="${cx}" y="${cy - 5}" text-anchor="middle" class="chart-value" font-size="18">UTC</text>
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" class="chart-sub">Timezone</text>
    `;

    return `
      ${trackSVG}
      ${barsSVG}
      ${labelsSVG}
      ${centerText}
    `;
  }

  /**
   * Generates the Weekly Cadence Donut Chart (Left Side)
   */
  #generateWeeklyCadence(): string {
    // 1. Aggregate Data by Day of Week
    const days = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat

    this.#stats.contributionGraph.forEach(day => {
      const date = new Date(day.date);
      if (!isNaN(date.getTime())) {
        days[date.getDay()] += day.count;
      }
    });

    const totalContributions = days.reduce((a, b) => a + b, 0);

    if (totalContributions === 0) {
      return `<text x="240" y="170" text-anchor="middle" class="chart-sub">No Data</text>`;
    }

    // 2. Find Busiest Day
    let maxDayIndex = 0;
    days.forEach((count, i) => {
      if (count > days[maxDayIndex]) maxDayIndex = i;
    });

    // 3. Geometry (Updated CY to 170 to make room for legend)
    const cx = 240;
    const cy = 170; // Moved UP from 210
    const r = 85;
    const width = 18;

    let pathsSVG = '';
    let currentAngle = -Math.PI / 2;

    const order = [1, 2, 3, 4, 5, 6, 0]; // Mon -> Sun

    order.forEach((dayIndex, i) => {
      const count = days[dayIndex];
      if (count === 0) return;

      const sliceAngle = (count / totalContributions) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;

      // SVG Arc Logic
      const x1 = cx + (r - width) * Math.cos(currentAngle);
      const y1 = cy + (r - width) * Math.sin(currentAngle);
      const x2 = cx + r * Math.cos(currentAngle);
      const y2 = cy + r * Math.sin(currentAngle);
      const x3 = cx + r * Math.cos(endAngle);
      const y3 = cy + r * Math.sin(endAngle);
      const x4 = cx + (r - width) * Math.cos(endAngle);
      const y4 = cy + (r - width) * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const d = `M ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${r - width} ${r - width} 0 ${largeArc} 0 ${x1} ${y1} Z`;

      const color = this.#dayColors[dayIndex];

      pathsSVG += `
        <path d="${d}" fill="${color}" stroke="${this.theme.bg}" stroke-width="2"
              class="slice-anim" style="animation-delay: ${i * 0.05}s">
          <title>${this.#dayNames[dayIndex]}: ${count}</title>
        </path>
      `;

      currentAngle = endAngle;
    });

    // 4. Legend (Static Grid) - Improved spacing
    let legendSVG = '';
    order.forEach((dayIndex, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      // Increased column width from 110 to 125 to prevent overlap
      const lx = 30 + col * 125;
      const ly = 280 + row * 20;
      const count = days[dayIndex];
      const percent = ((count / totalContributions) * 100).toFixed(0);

      legendSVG += `
        <g transform="translate(${lx}, ${ly})">
          <rect width="10" height="10" rx="3" fill="${this.#dayColors[dayIndex]}" />
          <text x="16" y="9" class="legend-key">${this.#dayNames[dayIndex]}</text>
          <text x="105" y="9" text-anchor="end" class="legend-val">${percent}%</text>
        </g>
      `;
    });

    // 5. Text Stats
    const centerStats = `
      <text x="${cx}" y="${cy - 5}" text-anchor="middle" class="chart-value">${totalContributions.toLocaleString()}</text>
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" class="chart-sub">Contributions</text>
    `;

    const periodDays =
      Math.ceil(
        (new Date(this.#stats.periodEnd).getTime() -
          new Date(this.#stats.periodStart).getTime()) /
          (1000 * 60 * 60 * 24),
      ) || 1;
    const avg = (totalContributions / periodDays).toFixed(1);

    // Aligned Side Stats closer to the new chart position
    const textStats = `
      <g transform="translate(30, 110)">
         <text class="chart-sub" y="0">Avg / Day</text>
         <text class="chart-value" y="25" font-size="20">${avg}</text>
         
         <text class="chart-sub" y="60">Most Active</text>
         <text class="chart-value" y="85" font-size="20" fill="${this.#dayColors[maxDayIndex]}">${this.#dayNames[maxDayIndex]}</text>
      </g>
    `;

    return `
      ${pathsSVG}
      ${centerStats}
      ${legendSVG}
      ${textStats}
    `;
  }
}
