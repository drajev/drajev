export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  height?: number;
}

const socialLinks: SocialLink[] = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/alexander-drazhev/',
    icon: 'https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg',
    height: 30,
  },
  {
    name: 'X',
    url: 'https://x.com/alxndrazhev',
    icon: 'https://img.shields.io/badge/x-F7DF1E?style=for-the-badge&logo=x&logoColor=black',
    height: 30,
  },
  {
    //TODO: Add portfolio URL
    name: 'Portfolio',
    url: 'http://githubpages',
    icon: 'https://img.shields.io/badge/Portfolio-255E63?style=for-the-badge&logo=react&logoColor=white',
    height: 30,
  },
  {
    name: 'Email',
    url: 'mailto:alxn.drazhev@gmail.com',
    icon: 'https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white',
    height: 30,
  },
  {
    name: 'GitHub',
    url: 'https://github.com/drajev',
    icon: 'https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/github.svg',
    height: 30,
  },
];

export function generateConnect(): string {
  const links = socialLinks
    .map(
      link =>
        `<a href="${link.url}" target="_blank"><img align="center" src="${link.icon}" alt="${link.name.toLowerCase()}" height="${link.height}" ${link.name === 'LinkedIn' || link.name === 'X' || link.name === 'YouTube' ? 'width="40"' : ''} /></a>`,
    )
    .join(' ');

  return `<h3 align="left">📬 Connect with Me:</h3>
<p align="left">
${links}
</p>`;
}

export { socialLinks };
