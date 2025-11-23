import { Card } from './ui/card';
import { ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

// Déclaration TypeScript pour Instagram embed
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

interface EmbedDisplayProps {
  embeds: string[];
}

const getEmbedCode = (url: string): string | null => {
  // Instagram
  const instagramMatch = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
  if (instagramMatch) {
    const postId = instagramMatch[2];
    return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/${postId}/" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
  }

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 8px;"></iframe>`;
  }

  // Twitter/X
  const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  if (twitterMatch) {
    return `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
  }

  return null;
};

const getEmbedType = (url: string): string => {
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
  return 'Lien';
};

export const EmbedDisplay = ({ embeds }: EmbedDisplayProps) => {
  useEffect(() => {
    // Charger le script Instagram embed après le rendu
    if (embeds.some(url => url.includes('instagram.com'))) {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      
      // Réinitialiser les embeds Instagram après le chargement
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
    }
  }, [embeds]);

  if (!embeds || embeds.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <span className="text-primary">📱</span>
        Contenus
      </h4>
      <div className="grid gap-4">
        {embeds.map((url, index) => {
          const embedCode = getEmbedCode(url);
          const embedType = getEmbedType(url);

          return (
            <Card key={index} className="p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                  {embedType}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  Voir l'original
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {embedCode ? (
                <div 
                  className="embed-container overflow-hidden rounded-lg"
                  dangerouslySetInnerHTML={{ __html: embedCode }}
                />
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {url}
                </a>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
