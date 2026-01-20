import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PublicFooter } from "@/components/PublicFooter";
import { ArrowLeft, Search, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "general", label: t("faq.categories.general"), icon: "🏠" },
    { id: "membership", label: t("faq.categories.membership"), icon: "💳" },
    { id: "features", label: t("faq.categories.features"), icon: "⚡" },
    { id: "support", label: t("faq.categories.support"), icon: "🛟" },
  ];

  const faqItems: FAQItem[] = [
    // General
    { category: "general", question: t("faq.items.whatIs.q"), answer: t("faq.items.whatIs.a") },
    { category: "general", question: t("faq.items.howItWorks.q"), answer: t("faq.items.howItWorks.a") },
    { category: "general", question: t("faq.items.whoCanJoin.q"), answer: t("faq.items.whoCanJoin.a") },
    // Membership
    { category: "membership", question: t("faq.items.pricing.q"), answer: t("faq.items.pricing.a") },
    { category: "membership", question: t("faq.items.howToJoin.q"), answer: t("faq.items.howToJoin.a") },
    { category: "membership", question: t("faq.items.cancel.q"), answer: t("faq.items.cancel.a") },
    // Features
    { category: "features", question: t("faq.items.helloasso.q"), answer: t("faq.items.helloasso.a") },
    { category: "features", question: t("faq.items.dataPrivacy.q"), answer: t("faq.items.dataPrivacy.a") },
    { category: "features", question: t("faq.items.multiAssociation.q"), answer: t("faq.items.multiAssociation.a") },
    // Support
    { category: "support", question: t("faq.items.contactSupport.q"), answer: t("faq.items.contactSupport.a") },
    { category: "support", question: t("faq.items.reportBug.q"), answer: t("faq.items.reportBug.a") },
  ];

  const filteredItems = faqItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 md:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
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
      <main className="flex-1 container px-4 md:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("faq.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("faq.subtitle")}
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t("faq.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              {t("faq.allCategories")}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>

          {/* FAQ List */}
          {filteredItems.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {filteredItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium text-foreground">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("faq.noResults")}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center bg-muted/30 border border-border rounded-xl p-8">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t("faq.stillNeedHelp")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("faq.contactUs")}
            </p>
            <Button asChild>
              <Link to="/contact">{t("faq.contactButton")}</Link>
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default FAQ;
