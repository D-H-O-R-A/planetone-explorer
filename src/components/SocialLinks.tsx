
import React from 'react';
import { Github, Twitter, MessageSquare, Instagram } from 'lucide-react';

const SocialLinks = () => {
  const socialLinks = [
    { id: 'github', url: 'https://github.com/', icon: Github },
    { id: 'twitter', url: 'https://x.com/', icon: Twitter },
    { id: 'telegram', url: 'https://t.me/', icon: MessageSquare },
    { id: 'instagram', url: 'https://www.instagram.com/planetone_oficial', icon: Instagram }
  ];

  return (
    <div className="flex items-center gap-3 justify-center w-full md:w-auto mt-4 md:mt-0 mb-2 md:mb-0 ml-4">
      {socialLinks.map((link) => (
        <a 
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#129E4E] transition-colors duration-200 hover:scale-110 transform"
        >
          <link.icon size={18} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
