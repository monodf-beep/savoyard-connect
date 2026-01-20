import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { PublicFooter } from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Newspaper } from "lucide-react";

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  category: string;
  published_at: string | null;
}

const BlogPost = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  const categories: Record<string, string> = {
    actualites: t("blog.categories.news"),
    tutoriels: t("blog.categories.tutorials"),
    temoignages: t("blog.categories.testimonials"),
  };

  useEffect(() => {
    // Blog posts table will be created later - use placeholder for demo
    setPost({
      id: "demo",
      slug: slug || "",
      title: t("blog.placeholder.post1.title"),
      content: `<p>${t("blog.placeholder.post1.excerpt")}</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
      excerpt: t("blog.placeholder.post1.excerpt"),
      cover_image_url: null,
      author_name: "Équipe Associacion",
      category: "actualites",
      published_at: new Date().toISOString(),
    });
    setLoading(false);
  }, [slug, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container px-4 md:px-8 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/blog">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link to="/" className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-foreground">associacion</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container px-4 md:px-8 py-12 max-w-4xl">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container px-4 md:px-8 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/blog">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link to="/" className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-foreground">associacion</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container px-4 md:px-8 py-12 text-center">
          <Newspaper className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("blog.notFound")}</h1>
          <p className="text-muted-foreground mb-6">{t("blog.notFoundDesc")}</p>
          <Button asChild>
            <Link to="/blog">{t("blog.backToList")}</Link>
          </Button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 md:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-foreground">associacion</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {/* Cover Image */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          {post.cover_image_url ? (
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Newspaper className="h-20 w-20 text-primary/30" />
          )}
        </div>

        <article className="container px-4 md:px-8 py-12 max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            {categories[post.category] || post.category}
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author_name || t("blog.anonymous")}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </div>
          </div>

          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 pt-8 border-t border-border">
            <Button variant="outline" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("blog.backToList")}
              </Link>
            </Button>
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
};

export default BlogPost;
