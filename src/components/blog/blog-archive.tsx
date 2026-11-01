"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, Search, X } from "lucide-react";
import type { BlogSummary } from "@/lib/blog-data";
import styles from "./blog.module.css";

export function BlogArchive({
  articles,
  topics,
}: {
  articles: BlogSummary[];
  topics: string[];
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All guides");
  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return articles.filter((article) => {
      const haystack =
        `${article.title} ${article.abstract} ${article.category}`.toLowerCase();
      return (
        (topic === "All guides" || article.category === topic) &&
        terms.every((term) => haystack.includes(term))
      );
    });
  }, [articles, query, topic]);

  return (
    <section
      id="all-guides"
      className={styles.archive}
      aria-labelledby="guides-heading"
    >
      <div className={styles.archiveHeading}>
        <div>
          <p className={styles.eyebrow}>The reading room</p>
          <h2 id="guides-heading">Find your next useful answer.</h2>
        </div>
        <label className={styles.search}>
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Search buying guides</span>
          <input
            type="search"
            placeholder="Try “tissue”, “carton” or “office”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <div className={styles.filters} aria-label="Filter guides by topic">
        {["All guides", ...topics].map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setTopic(item)}
            aria-pressed={topic === item}
          >
            {item}
            <span>
              {item === "All guides"
                ? articles.length
                : articles.filter((article) => article.category === item)
                    .length}
            </span>
          </button>
        ))}
      </div>
      <div className={styles.results}>
        <p role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
          {topic !== "All guides"
            ? ` in ${topic.toLowerCase()}`
            : " for better buying decisions"}
        </p>
        {(query || topic !== "All guides") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTopic("All guides");
            }}
          >
            Clear filters <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className={styles.cardGrid}>
        {filtered.map((article, index) => (
          <article className={styles.card} key={article.slug}>
            <div className={styles.cardImage}>
              <Image
                src={article.thumbnail}
                alt={article.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <span className={styles.cardNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}>
                <span>{article.category}</span>
                <span>
                  <Clock3 size={12} aria-hidden="true" />
                  {article.readTime}
                </span>
              </div>
              <h3>
                <Link href={`/blog/${article.slug}`} prefetch={false}>
                  {article.title}
                </Link>
              </h3>
              <p>{article.abstract}</p>
              <div className={styles.cardBottom}>
                <time dateTime={article.publishedAt}>{article.dateLabel}</time>
                <span aria-hidden="true">
                  Read guide <ArrowUpRight size={17} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className={styles.empty}>
          <Search aria-hidden="true" />
          <h3>No matching guides yet</h3>
          <p>
            Try a broader term or clear the topic filter. For a product-specific
            question, our sales team can help.
          </p>
          <Link href="/request-quote">
            Ask about your requirement <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
