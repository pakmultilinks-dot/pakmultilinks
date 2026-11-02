import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock3,
  List,
  MessageCircle,
} from "lucide-react";
import { CartonCalculator } from "@/components/blog/carton-calculator";
import styles from "@/components/blog/blog.module.css";
import {
  formatBlogDate,
  getAllBlogSlugs,
  getArticleReadTime,
  getArticleWordCount,
  getBlogArticleBySlug,
} from "@/lib/blog-data";
import { company } from "@/lib/company";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";
import { getPublishedBlogPost } from "@/lib/blog-posts-server";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = true;
export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const article = getBlogArticleBySlug(slug);
  const managed = article ? null : await getPublishedBlogPost(slug);
  if (managed) {
    const image = managed.imageUrl || "/images/blog/workplace.webp";
    return { title: managed.title, description: managed.excerpt, alternates: { canonical: `/blog/${managed.slug}` }, openGraph: { title: managed.title, description: managed.excerpt, type: "article", url: `/blog/${managed.slug}`, images: [{ url: image, alt: managed.imageAlt || managed.title }] }, twitter: { card: "summary_large_image", title: managed.title, description: managed.excerpt, images: [image] } };
  }
  if (!article)
    return { title: "Guide not found", robots: { index: false, follow: true } };
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: `/blog/${article.slug}` },
    authors: [{ name: company.name, url: absoluteUrl("/about") }],
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: "article",
      url: `/blog/${article.slug}`,
      siteName: company.name,
      locale: "en_PK",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [absoluteUrl("/about")],
      section: article.category,
      images: [{ url: article.image, alt: article.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
      images: [article.image],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const slug = (await params).slug;
  const article = getBlogArticleBySlug(slug);
  if (!article) {
    const managed = await getPublishedBlogPost(slug);
    if (!managed) notFound();
    const published = managed.publishedAt || managed.createdAt;
    const image = managed.imageUrl || "/images/blog/workplace.webp";
    const pageUrl = absoluteUrl(`/blog/${managed.slug}`);
    const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: managed.title, description: managed.excerpt, url: pageUrl, datePublished: published.toISOString(), dateModified: managed.updatedAt.toISOString(), image: absoluteUrl(image), author: { "@type": "Organization", name: company.name }, publisher: { "@id": `${absoluteUrl("/")}#business` }, inLanguage: "en-PK" };
    return <article className={styles.page}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} /><div className={styles.shell}><nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><Link href="/blog">Buying guides</Link><span>/</span><span>{managed.category}</span></nav><header className={styles.articleHeader}><Link href="/blog" className={styles.backLink}><ArrowLeft size={15} /> All buying guides</Link><p className={styles.eyebrow}>{managed.category}</p><h1>{managed.title}</h1><p className={styles.articleDek}>{managed.excerpt}</p><div className={styles.byline}><span className={styles.authorMark}>PM</span><span>By <Link href="/about">{company.name}</Link></span><time dateTime={published.toISOString()}>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }).format(published)}</time></div></header><div className={styles.articleLayout}><aside className={styles.articleSidebar}><div className={styles.sideQuote}><MessageCircle size={22} /><h2>Buying for your business?</h2><p>Send us your list for a current carton quotation.</p><Link href="/request-quote">Talk to our team <ArrowUpRight size={16} /></Link></div></aside><div className={styles.articleBody}><div className={styles.articleCover}><Image src={image} alt={managed.imageAlt || managed.title} fill sizes="(max-width: 900px) 100vw, 760px" preload /></div><section className={styles.proseSection}>{managed.content.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section><div className={styles.productCta}><div><p className={styles.eyebrow}>Need current rates?</p><h2>Request a business quotation.</h2></div><Link href="/request-quote" className={styles.darkButton}>Request a quote <ArrowUpRight size={17} /></Link></div></div></div></div></article>;
  }
  const pageUrl = absoluteUrl(`/blog/${article.slug}`);
  const related = article.relatedSlugs
    .map(getBlogArticleBySlug)
    .filter((item) => item !== undefined);
  const structuredData = [
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Buying guides", path: "/blog" },
      { name: article.title, path: `/blog/${article.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: article.title,
      description: article.metaDescription,
      url: pageUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      author: {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#business`,
        name: company.name,
        url: absoluteUrl("/about"),
      },
      publisher: { "@id": `${absoluteUrl("/")}#business` },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      image: absoluteUrl(article.image),
      inLanguage: "en-PK",
      articleSection: article.category,
      wordCount: getArticleWordCount(article),
      isPartOf: {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/blog")}#collection`,
        url: absoluteUrl("/blog"),
        name: "Wholesale Tissue & Hygiene Buying Guides",
      },
      citation: article.sources.map((source) =>
        source.url.startsWith("/") ? absoluteUrl(source.url) : source.url,
      ),
    },
  ];
  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <div className={styles.shell}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Buying guides</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{article.category}</span>
        </nav>
        <header className={styles.articleHeader}>
          <Link href="/blog" className={styles.backLink}>
            <ArrowLeft size={15} aria-hidden="true" /> All buying guides
          </Link>
          <p className={styles.eyebrow}>{article.category}</p>
          <h1>{article.title}</h1>
          <p className={styles.articleDek}>{article.abstract}</p>
          <div className={styles.byline}>
            <span className={styles.authorMark} aria-hidden="true">
              PM
            </span>
            <span>
              By <Link href="/about">{company.name}</Link>
            </span>
            <span>
              <time dateTime={article.publishedAt}>
                {formatBlogDate(article.publishedAt)}
              </time>
            </span>
            <span>
              <Clock3 size={14} aria-hidden="true" />
              {getArticleReadTime(article)}
            </span>
          </div>
        </header>
        <div className={styles.articleLayout}>
          <aside className={styles.articleSidebar}>
            <nav aria-label="In this guide" className={styles.toc}>
              <p>
                <List size={17} aria-hidden="true" /> In this guide
              </p>
              <a href="#quick-answer">The short answer</a>
              {article.sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.heading}
                </a>
              ))}
              <a href="#questions">Common questions</a>
              <a href="#references">Sources &amp; references</a>
            </nav>
            <div className={styles.sideQuote}>
              <MessageCircle size={22} aria-hidden="true" />
              <h2>Buying for your business?</h2>
              <p>Send us your list for a current carton quotation.</p>
              <Link href="/request-quote">
                Talk to our team <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </aside>
          <div className={styles.articleBody}>
            <section id="quick-answer" className={styles.quickAnswer}>
              <p className={styles.eyebrow}>The short answer</p>
              <h2>What you need to know</h2>
              <p>{article.quickAnswer}</p>
            </section>
            <div className={styles.articleCover}>
              <Image
                src={article.image}
                alt={article.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 760px"
                preload
              />
            </div>
            <div className={styles.takeaways}>
              <h2>Before you buy</h2>
              <ul>
                {article.takeaways.map((item) => (
                  <li key={item}>
                    <Check size={17} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {article.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className={styles.proseSection}
              >
                <span className={styles.sectionNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.checklist && (
                  <ul className={styles.checklist}>
                    {section.checklist.map((item) => (
                      <li key={item}>
                        <Check size={16} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.table && (
                  <div
                    className={styles.tableWrap}
                    tabIndex={0}
                    role="region"
                    aria-label={`${section.table.caption} comparison table`}
                  >
                    <table>
                      <caption>{section.table.caption}</caption>
                      <thead>
                        <tr>
                          {section.table.columns.map((column) => (
                            <th scope="col" key={column}>
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, cellIndex) =>
                              cellIndex === 0 ? (
                                <th scope="row" key={cellIndex}>
                                  {cell}
                                </th>
                              ) : (
                                <td key={cellIndex}>{cell}</td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
            {article.slug === "carton-vs-piece-price-guide" && (
              <CartonCalculator />
            )}
            <section id="questions" className={styles.articleFaq}>
              <p className={styles.eyebrow}>A few more answers</p>
              <h2>Common buying questions</h2>
              {article.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>
                    {faq.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </section>
            <div className={styles.productCta}>
              <div>
                <p className={styles.eyebrow}>Put the guide to work</p>
                <h2>Find the right supply for your site.</h2>
              </div>
              <Link
                href={article.relatedLink.href}
                className={styles.darkButton}
              >
                {article.relatedLink.label}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <section id="references" className={styles.references}>
              <h2>Sources &amp; product references</h2>
              <p>
                Original purchasing guidance with the references below.
                Calculations are illustrative; confirm the exact specification
                and current quotation before ordering.
              </p>
              <ul>
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url}>
                      {source.title}{" "}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                    <p>{source.note}</p>
                  </li>
                ))}
              </ul>
              <p>
                Published by <Link href="/about">{company.name}</Link>,{" "}
                {company.address}. For a correction or a product-specific
                question, <Link href="/contact">contact our team</Link>.
              </p>
            </section>
          </div>
        </div>
        <section className={styles.related} aria-labelledby="related-heading">
          <div className={styles.archiveHeading}>
            <div>
              <p className={styles.eyebrow}>Keep reading</p>
              <h2 id="related-heading">A little more buying clarity.</h2>
            </div>
            <Link href="/blog">
              All {getAllBlogSlugs().length} guides{" "}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <article key={item.slug}>
                <span className={styles.eyebrow}>{item.category}</span>
                <h3>
                  <Link href={`/blog/${item.slug}`}>{item.title}</Link>
                </h3>
                <p>{getArticleReadTime(item)}</p>
                <ArrowUpRight size={20} aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
