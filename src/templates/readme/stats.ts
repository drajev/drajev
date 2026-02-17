export function generateStatsSection(): string {
  return `<!-- STATS:START -->
<p>
  <img src="generated/stats-overview.svg" alt="GitHub Stats" width="100%" />
</p>

<p>
  <img src="generated/languages.svg" alt="Top Languages" width="100%" />
</p>

<p>
  <img src="generated/productivity.svg" alt="Productivity & Commit Semantics" width="100%" />
</p>
<!-- STATS:END -->`;
}
