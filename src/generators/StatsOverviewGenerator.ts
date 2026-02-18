import type { GitHubStats, ContributionDay } from '../types.js';
import { SVGGenerator } from './SVGGenerator.js';
import { formatDate } from '../utils/FormatUtils.js';

/**
 * Generates the stats overview SVG card with a modern dashboard layout
 */
export class StatsOverviewGenerator extends SVGGenerator {
  #stats: GitHubStats;

  // Simple SVG paths for icons
  readonly #icons = {
    commit:
      'M10.5 13.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z M7 7v1.5M7 15.5V17M3.5 12H2M15.5 12H12',
    pr: 'M10 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM6 6v3.5a2.5 2.5 0 1 0 5 0V6M4 13.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm10-3a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
    issue:
      'M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 12.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z',
    star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
    fork: 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0Z',
    review:
      'M8 1.5c-3.5 0-6.5 3-6.5 6.5s3 6.5 6.5 6.5 6.5-3 6.5-6.5-3-6.5-6.5-6.5ZM8 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8Z',
    user: 'M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
  };

  constructor(stats: GitHubStats) {
    super(800, 500);
    this.#stats = stats;
  }

  generate(): string {
    // 1. Top Section: Hero Stats
    const heroSection = this.#generateHeroSection();

    // 2. Middle Section: The Grid (Commits, PRs, etc.)
    const gridSection = this.#generateGridSection();

    // 3. Bottom Section: Heatmap & mini stats
    const bottomSection = this.#generateBottomSection();

    const styles = `
      .header { font: 600 22px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      .subheader { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }

      /* Card Styles */
      .card-bg { fill: ${this.theme.border}; opacity: 0.15; }
      .card-label { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px; }
      .card-value { font: 600 20px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }
      .card-sub { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }

      /* Hero Styles */
      .hero-val { font: 700 32px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.accent}; }
      .hero-lbl { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.textSecondary}; }

      /* Heatmap Styles */
      .heatmap-lbl { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${this.theme.text}; }

      /* Animations */
      /* Fixed: Removed 'opacity: 0' default to prevent invisible elements if animation fails */
      .slide-content {
        animation: slideUp 0.6s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        transform-origin: center;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

    const content = `
      <defs>
        <linearGradient id="grad-streak" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
      </defs>

      <!-- Fixed: Removed animation class from header to ensure visibility -->
      <g>
        ${this.createHeader('📊 GitHub Overview')}
        ${this.createSubheader(
          `${formatDate(this.#stats.periodStart, { month: 'short', day: 'numeric', year: 'numeric' })} - ${formatDate(this.#stats.periodEnd, { month: 'short', day: 'numeric', year: 'numeric' })}`,
        )}
      </g>

      ${heroSection}
      ${gridSection}
      ${bottomSection}
    `;

    return this.createSVGWrapper(content, styles);
  }

  #generateHeroSection(): string {
    return `
      <g transform="translate(40, 80)">
        <g class="slide-content" style="animation-delay: 0.1s">
          <!-- Total Contributions -->
          <g>
            <text x="0" y="0" class="hero-lbl">Total Contributions</text>
            <text x="0" y="35" class="hero-val">${this.#stats.streak.totalContributions.toLocaleString()}</text>
          </g>

          <!-- Vertical Divider -->
          <line x1="220" y1="0" x2="220" y2="45" stroke="${this.theme.border}" stroke-width="1" opacity="0.3"/>

          <!-- Current Streak -->
          <g transform="translate(260, 0)">
            <text x="0" y="0" class="hero-lbl">Current Streak</text>
            <text x="0" y="35" class="hero-val" fill="url(#grad-streak)">${this.#stats.streak.currentStreak} days</text>
            <text x="140" y="35" class="card-sub" dy="-5">Best: ${this.#stats.streak.longestStreak}</text>
          </g>
        </g>
      </g>
    `;
  }

  #generateGridSection(): string {
    const stats = [
      {
        label: 'Commits',
        value: this.#stats.totalCommits,
        icon: this.#icons.commit,
        sub: `${this.#stats.contributionPercentages.commits}%`,
        color: '#3b82f6',
      },
      {
        label: 'Pull Requests',
        value: this.#stats.totalPRs,
        icon: this.#icons.pr,
        sub: `${this.#stats.contributionPercentages.prs}%`,
        color: '#10b981',
      },
      {
        label: 'Code Reviews',
        value: this.#stats.totalReviews,
        icon: this.#icons.review,
        sub: `${this.#stats.contributionPercentages.reviews}%`,
        color: '#8b5cf6',
      },
      {
        label: 'Issues',
        value: this.#stats.totalIssues,
        icon: this.#icons.issue,
        sub: `${this.#stats.contributionPercentages.issues}%`,
        color: '#f59e0b',
      },
      {
        label: 'Repositories',
        value: this.#stats.totalRepos,
        icon: this.#icons.repo,
        sub: 'Contributed',
        color: '#ec4899',
      },
      {
        label: 'Stars Earned',
        value: this.#stats.totalStars,
        icon: this.#icons.star,
        sub: 'Total',
        color: '#eab308',
      },
      {
        label: 'Forks',
        value: this.#stats.totalForks,
        icon: this.#icons.fork,
        sub: 'Total',
        color: '#64748b',
      },
      {
        label: 'Followers',
        value: this.#stats.followers,
        icon: this.#icons.user,
        sub: 'Network',
        color: '#06b6d4',
      },
    ];

    let gridSVG = '';
    const cardW = 170;
    const cardH = 75;
    const gapX = 20;
    const gapY = 20;
    const startX = 40;
    const startY = 150;

    stats.forEach((stat, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const x = startX + col * (cardW + gapX);
      const y = startY + row * (cardH + gapY);

      // NESTED GROUP structure to isolate CSS transforms
      gridSVG += `
        <g transform="translate(${x}, ${y})">
          <g class="slide-content" style="animation-delay: ${0.2 + i * 0.05}s">
            <!-- Card Background -->
            <rect width="${cardW}" height="${cardH}" rx="8" class="card-bg" />

            <!-- Icon (Top Right) -->
            <g transform="translate(${cardW - 28}, 12) scale(1.2)">
               <path d="${stat.icon}" fill="${stat.color}" opacity="0.8"/>
            </g>

            <!-- Value & Label -->
            <g transform="translate(16, 28)">
              <text y="0" class="card-label" fill="${stat.color}">${stat.label}</text>
              <text y="24" class="card-value">${stat.value.toLocaleString()}</text>
              <text y="38" class="card-sub" opacity="0.7">${stat.sub}</text>
            </g>
          </g>
        </g>
      `;
    });

    return gridSVG;
  }

  #generateBottomSection(): string {
    const last12Weeks = this.#stats.contributionGraph.slice(-84);
    const weeks: ContributionDay[][] = [];
    for (let i = 0; i < last12Weeks.length; i += 7) {
      weeks.push(last12Weeks.slice(i, i + 7));
    }

    // Compact layout so it doesn't overflow narrow containers (README, mobile)
    const cellSize = 9;
    const cellGap = 2;
    const heatmapWidth = 12 * (cellSize + cellGap) - cellGap;
    const cardX = 40;
    const cardW = 480;
    const startX = 48;
    const startY = 378;
    const labelY = 368;

    let heatmapSVG = '';
    weeks.forEach((week, wI) => {
      week.forEach((day, dI) => {
        const x = startX + wI * (cellSize + cellGap);
        const y = startY + dI * (cellSize + cellGap);
        const color =
          day.level === 0
            ? '#21262d'
            : this.theme.contribution[
                `level${day.level}` as keyof typeof this.theme.contribution
              ];
        heatmapSVG += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${color}" stroke="${this.theme.border}" stroke-width="0.5" opacity="${day.level === 0 ? 0.6 : 0.95}" />`;
      });
    });

    return `
      <g class="slide-content" style="animation-delay: 0.6s">
        <defs>
          <clipPath id="activity-clip">
            <rect x="${cardX}" y="350" width="${cardW}" height="120" rx="8" />
          </clipPath>
        </defs>
        <g clip-path="url(#activity-clip)">
          <rect x="${cardX}" y="350" width="${cardW}" height="120" rx="8" class="card-bg" />
          <g>${heatmapSVG}</g>
          <g transform="translate(280, 368)">
            <text x="0" y="0" class="card-label">Average</text>
            <text x="0" y="22" class="card-value">${this.#stats.avgCommitsPerDay} / day</text>
            <text x="0" y="52" class="card-label">Contributed To</text>
            <text x="0" y="74" class="card-value">${this.#stats.contributedTo} Repos</text>
          </g>
        </g>
      </g>
    `;
  }
}
