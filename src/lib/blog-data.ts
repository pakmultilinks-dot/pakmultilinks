import content from "./blog-content.json";

export type BlogSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  checklist?: string[];
  table?: { caption: string; columns: string[]; rows: string[][] };
};

export type BlogArticle = {
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  abstract: string;
  quickAnswer: string;
  takeaways: string[];
  sections: BlogSection[];
  faqs: { question: string; answer: string }[];
  relatedLink: { href: string; label: string };
  relatedSlugs: string[];
  image: string;
  thumbnail: string;
  imageAlt: string;
  sources: { title: string; url: string; note: string }[];
};

export const BLOG_ARTICLES: BlogArticle[] = content;
export const BLOG_TOPICS = [
  ...new Set(BLOG_ARTICLES.map((article) => article.category)),
];

export function getBlogArticleBySlug(slug: string) {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

export function getAllBlogSlugs() {
  return BLOG_ARTICLES.map((article) => article.slug);
}

export function getArticleWordCount(article: BlogArticle) {
  const text = [
    article.quickAnswer,
    article.abstract,
    ...article.takeaways,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.checklist ?? []),
      ...(section.table?.rows.flat() ?? []),
    ]),
    ...article.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ].join(" ");
  return text.trim().split(/\s+/).length;
}

export function getArticleReadTime(article: BlogArticle) {
  return `${Math.max(2, Math.ceil(getArticleWordCount(article) / 200))} min read`;
}

export function formatBlogDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });
}

export type BlogSummary = Pick<
  BlogArticle,
  | "slug"
  | "title"
  | "category"
  | "abstract"
  | "image"
  | "thumbnail"
  | "imageAlt"
  | "publishedAt"
> & { readTime: string; dateLabel: string };

export function getBlogSummaries(): BlogSummary[] {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
    title: article.title,
    category: article.category,
    abstract: article.abstract,
    image: article.image,
    thumbnail: article.thumbnail,
    imageAlt: article.imageAlt,
    publishedAt: article.publishedAt,
    readTime: getArticleReadTime(article),
    dateLabel: formatBlogDate(article.publishedAt),
  }));
}
