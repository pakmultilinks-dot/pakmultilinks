import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Check,
  MapPin,
} from "lucide-react";
import { BlogArchive } from "@/components/blog/blog-archive";
import styles from "@/components/blog/blog.module.css";
import {
  BLOG_ARTICLES,
  BLOG_TOPICS,
  getBlogSummaries,
  getArticleReadTime,
} from "@/lib/blog-data";
import { company } from "@/lib/company";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";
import { listPublishedBlogPosts } from "@/lib/blog-posts-server";

const title = "Wholesale Tissue & Hygiene Buying Guides";
const description =
  "Practical tissue buying guides, carton price calculations and workplace supply checklists for businesses in Lahore and Pakistan. Find answers before you order.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/blog",
    siteName: company.name,
    locale: "en_PK",
    images: [
      {
        url: "/images/blog/workplace.webp",
        alt: "Workplace tissue and hygiene supplies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/blog/workplace.webp"],
  },
};

export default async function BlogIndexPage() {
  const managedPosts = await listPublishedBlogPosts();
  const managedSummaries = managedPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    abstract: post.excerpt,
    image: post.imageUrl || "/images/blog/workplace.webp",
    thumbnail: post.imageUrl || "/images/blog/workplace.webp",
    imageAlt: post.imageAlt || post.title,
    publishedAt: (post.publishedAt || post.createdAt).toISOString(),
    readTime: `${Math.max(2, Math.ceil(post.content.trim().split(/\s+/).length / 200))} min read`,
    dateLabel: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(post.publishedAt || post.createdAt),
  }));
  const allSummaries = [...managedSummaries, ...getBlogSummaries()];
  const allTopics = [...new Set([...managedPosts.map((post) => post.category), ...BLOG_TOPICS])];
  const featured = BLOG_ARTICLES[0];
  const structuredData = [
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Buying guides", path: "/blog" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${absoluteUrl("/blog")}#collection`,
      name: title,
      description,
      url: absoluteUrl("/blog"),
      inLanguage: "en-PK",
      publisher: { "@id": `${absoluteUrl("/")}#business` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: BLOG_ARTICLES.length,
        itemListElement: BLOG_ARTICLES.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: article.title,
          url: absoluteUrl(`/blog/${article.slug}`),
        })),
      },
    },
  ];
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <div className={styles.shell}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">The buying journal</span>
        </nav>
        <header className={styles.journalHeader}>
          <div>
            <p className={styles.eyebrow}>
              <span className={styles.dot} /> The Pak Multilinks journal
            </p>
            <h1>
              Tissue &amp; hygiene.
              <br />
              <em>Smarter buying.</em>
            </h1>
          </div>
          <div className={styles.headerIntro}>
            <p>
              Wholesale tissue &amp; hygiene buying guides for the people who
              keep workplaces running.
            </p>
            <div>
              <span>
                <MapPin size={15} aria-hidden="true" /> Lahore, Pakistan
              </span>
              <span>
                <BookOpen size={15} aria-hidden="true" /> {allSummaries.length}{" "}
                practical guides
              </span>
            </div>
            <a href="#all-guides">
              Explore the journal <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </header>
        <section className={styles.featured} aria-labelledby="featured-heading">
          <div className={styles.featuredCopy}>
            <span className={styles.featuredLabel}>
              Start here · The buying essentials
            </span>
            <h2 id="featured-heading">
              Your next tissue order,
              <br />
              made simpler.
            </h2>
            <p>
              From choosing the right format to comparing carton value: a
              practical guide to buying wholesale tissue in Lahore.
            </p>
            <Link
              href={`/blog/${featured.slug}`}
              className={styles.lightButton}
            >
              Read the buying guide{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <span className={styles.featuredFoot}>
              {getArticleReadTime(featured)} <span aria-hidden="true">·</span>{" "}
              Product selection &amp; purchasing
            </span>
          </div>
          <div className={styles.featuredImage}>
            <Image
              src="/images/blog/tissue-boxes.webp"
              alt="Nozomi tissue boxes showing the boxed tissue format"
              fill
              sizes="(max-width: 760px) 100vw, 50vw"
              preload
            />
            <div className={styles.imageNote}>
              <span>THE DETAIL THAT MATTERS</span>
              <p>
                Compare what’s inside
                <br />
                the carton.
              </p>
            </div>
          </div>
        </section>
        <div className={styles.editorialStrip}>
          <span>
            <Check size={17} aria-hidden="true" /> Clear answers, before you
            order
          </span>
          <span>
            <Check size={17} aria-hidden="true" /> Practical comparisons &amp;
            checklists
          </span>
          <span>
            <Check size={17} aria-hidden="true" /> Product references where they
            matter
          </span>
        </div>
        <BlogArchive articles={allSummaries} topics={allTopics} />
        <section className={styles.toolsBanner} aria-labelledby="tool-heading">
          <div className={styles.toolIcon}>
            <Calculator size={30} aria-hidden="true" />
          </div>
          <div>
            <p className={styles.eyebrow}>A useful number to know</p>
            <h2 id="tool-heading">What does each piece actually cost?</h2>
            <p>
              Use the carton calculator to turn a quote into a delivered cost
              per unit.
            </p>
          </div>
          <Link
            href="/blog/carton-vs-piece-price-guide#calculator-heading"
            className={styles.darkButton}
          >
            Try the calculator <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>
        <section className={styles.contactBanner}>
          <div>
            <p className={styles.eyebrow}>From reading to restocking</p>
            <h2>Have a list? Let’s work through it.</h2>
            <p>
              Send your products, quantities and delivery city. Our Lahore sales
              team can help with a current quotation.
            </p>
          </div>
          <Link href="/request-quote" className={styles.darkButton}>
            Request a quotation <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>
        <p className={styles.editorialNote}>
          Published by <Link href="/about">{company.name}</Link>. Our guides
          explain purchasing decisions; examples are illustrative. Confirm
          current product specifications, prices and delivery terms before
          ordering.
        </p>
      </div>
    </div>
  );
}
