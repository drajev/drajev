export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  height?: number;
}

const socialLinks: SocialLink[] = [
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/☕-petar-zarkov-7989a670',
    icon: 'https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg',
    height: 30,
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/flaeryw',
    icon: 'https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/twitter.svg',
    height: 30,
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@RustBeats',
    icon: 'https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/youtube.svg',
    height: 30,
  },
  {
    name: 'Portfolio',
    url: 'http://petarzarkov.com/',
    icon: 'https://img.shields.io/badge/Portfolio-255E63?style=for-the-badge&logo=react&logoColor=white',
    height: 30,
  },
  {
    name: 'Email',
    url: 'mailto:pzarko1@gmail.com',
    icon: 'https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white',
    height: 30,
  },
  {
    name: 'GitHub',
    url: 'https://github.com/petarzarkov',
    icon: 'https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/github.svg',
    height: 30,
  },
];

export function generateConnect(): string {
  const links = socialLinks
    .map(
      link => `  <a href="${link.url}" target="_blank">
    <img align="center" src="${link.icon}" alt="${link.name.toLowerCase()}" height="${link.height}" ${link.name === 'LinkedIn' || link.name === 'Twitter' || link.name === 'YouTube' ? 'width="40"' : ''} />
  </a>`,
    )
    .join('\n');

  return `<h3 align="left">📬 Connect with Me:</h3>
<p align="left">
${links}
</p>`;
}

export { socialLinks };
