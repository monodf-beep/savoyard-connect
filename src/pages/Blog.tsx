import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowRight, Newspaper } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  category: string;
  published_at: string | null;
}

const Blog = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "actualites", label: t("blog.categories.news") },
    { id: "tutoriels", label: t("blog.categories.tutorials") },
    { id: "temoignages", label: t("blog.categories.testimonials") },
  ];

  useEffect(() => {
    // Blog posts table will be created later - use placeholders for now
    setLoading(false);
  }, []);

  const filteredPosts = posts.filter(
    (post) => selectedCategory === null || post.category === selectedCategory
  );

  const getCategoryBadge = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.label || category;
  };

  // Placeholder posts for demo
  const placeholderPosts: BlogPost[] = [
    {
      id: "1",
      slug: "bienvenue-sur-associacion",
      title: t("blog.placeholder.post1.title"),
      excerpt: t("blog.placeholder.post1.excerpt"),
      cover_image_url: null,
      author_name: "Équipe Associacion",
      category: "actualites",
      published_at: new Date().toISOString(),
    },
    {
      id: "2",
      slug: "comment-creer-votre-association",
      title: t("blog.placeholder.post2.title"),
      excerpt: t("blog.placeholder.post2.excerpt"),
      cover_image_url: null,
      author_name: "Marie Dupont",
      category: "tutoriels",
      published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      slug: "temoignage-club-alpin",
      title: t("blog.placeholder.post3.title"),
      excerpt: t("blog.placeholder.post3.excerpt"),
      cover_image_url: null,
      author_name: "Jean Martin",
      category: "temoignages",
      published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const displayPosts = posts.length > 0 ? filteredPosts : placeholderPosts.filter(
    (post) => selectedCategory === null || post.category === selectedCategory
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Unified Navbar */}
      <PublicNavbar />

      {/* Content */}
      <main className="flex-1 container px-4 md:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Newspaper className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("blog.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("blog.subtitle")}
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t("blog.allCategories")}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Newspaper className="h-12 w-12 text-primary/50" />
                    )}
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-3">
                      {getCategoryBadge(post.category)}
                    </Badge>
                    <h2 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {post.author_name || t("blog.anonymous")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {t("blog.readMore")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Newspaper className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">{t("blog.noPosts")}</h3>
              <p className="text-muted-foreground">{t("blog.noPostsDesc")}</p>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Blog;
