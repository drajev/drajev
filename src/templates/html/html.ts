import type { GitHubStats } from '../../types.js';
import { socialLinks } from '../readme/connect.js';

export function generateIndexHTML(stats: GitHubStats): string {
  const socialLinksHTML = socialLinks
    .map(
      link => `<a href="${link.url}" target="_blank">
          <img src="${link.icon}" alt="${link.name}" height="40" />
        </a>`,
    )
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="GitHub profile and statistics for Alexander Drazhev">
  <link rel="icon" type="image/x-icon" href="https://avatars.githubusercontent.com/u/${stats.userId}?v=4">
  <title>Hi, I'm Alexander Drazhev</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      background-color: #0d1117;
      color: #c9d1d9;
      line-height: 1.6;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #30363d;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      color: #58a6ff;
    }

    h2 {
      font-size: 1.8em;
      color: #c9d1d9;
      text-align: center;
    }

    .subtitle {
      font-size: 1.2em;
      color: #8b949e;
    }

    .section {
      margin: 40px 0;
      padding: 30px;
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
    }

    .stats-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      margin: 30px 0;
    }

    .stats-container img {
      width: 100%;
      border-radius: 6px;
    }

    .connect {
      display: flex;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .connect a {
      display: inline-flex;
      align-items: center;
      transition: transform 0.2s;
    }

    .connect a:hover {
      transform: scale(1.1);
    }

    .connect img {
      height: 40px;
    }

    a {
      color: #58a6ff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    footer {
      text-align: center;
      padding: 40px 0;
      margin-top: 60px;
      border-top: 1px solid #30363d;
      color: #8b949e;
      font-size: 0.9em;
    }

    .updated {
      text-align: center;
      color: #8b949e;
      font-size: 0.9em;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 2em;
      }

      .section {
        padding: 20px;
      }

      .stats-container img {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Hi <img src="public/webp/peepoHey.webp" alt="Hi" width="30" height="30" style="vertical-align: middle;" />, I'm Alexander Drazhev</h1>
      <p class="subtitle">A passionate software developer from Bulgaria</p>
    </header>

    <main>
      <section class="section">
        <h2>📬 Connect with me</h2>
        <div class="connect">
          ${socialLinksHTML}
        </div>
      </section>

      <section class="section">
        <p class="updated">Last updated: ${new Date().toLocaleString('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'UTC',
        })} UTC</p>
        <div class="stats-container">
          <img src="generated/stats-overview.svg" alt="GitHub Statistics Overview" />
          <img src="generated/languages.svg" alt="Top Languages" />
          <img src="generated/productivity.svg" alt="Productivity & Commit Semantics" />
        </div>
      </section>

    </main>

    <footer>
      <p>© ${new Date().getFullYear()} Alexander Drazhev. Auto-generated with ❤️ using TypeScript & GitHub Actions.</p>
    </footer>
  </div>
</body>
</html>`;
}
