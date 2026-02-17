/**
 * Centralized theme constants
 */
export const THEME = {
  bg: '#0d1117',
  border: '#30363d',
  text: '#c9d1d9',
  textSecondary: '#8b949e',
  accent: '#58a6ff',
  success: '#3fb950',
  warning: '#d29922',
  danger: '#f85149',
  contribution: {
    level0: '#161b22',
    level1: '#0e4429',
    level2: '#006d32',
    level3: '#26a641',
    level4: '#39d353',
  },
} as const;

export const ENHANCED_ANIMATIONS = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-5px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInUp {
    from { transform: translateY(5px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes growBar {
    from { transform: scaleX(0); transform-origin: left; }
    to { transform: scaleX(1); transform-origin: left; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    80% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .fade-in { animation: fadeIn 1.2s ease-out; }
  .slide-in-left { animation: slideInLeft 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .slide-in-up { animation: slideInUp 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .grow-bar { animation: growBar 2.4s cubic-bezier(0.4, 0, 0.2, 1); }
  .pulse { animation: pulse 3s ease-in-out infinite; }
  .pop-in { animation: popIn 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
`;
