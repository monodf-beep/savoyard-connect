import { Card } from './ui/card';
import { ExternalLink } from 'lucide-react';

interface EmbedDisplayProps {
  embeds: string[];
}

const getEmbedCode = (url: string): string | null => {
  // Instagram
  const instagramMatch = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
  if (instagramMatch) {
    const postId = instagramMatch[2];
    return `<iframe src="https://www.instagram.com/p/${postId}/embed" width="100%" height="600" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;
  }

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
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
  if (!embeds || embeds.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Contenus</h4>
      <div className="grid gap-4">
        {embeds.map((url, index) => {
          const embedCode = getEmbedCode(url);
          const embedType = getEmbedType(url);

          return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {embedType}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Ouvrir
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {embedCode ? (
                <div 
                  className="embed-container"
                  dangerouslySetInnerHTML={{ __html: embedCode }}
                />
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
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
