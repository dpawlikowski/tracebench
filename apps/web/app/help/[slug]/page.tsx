import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_ARTICLES, getArticle } from "@/lib/help-articles";

export function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article
      className="mx-auto max-w-[720px] px-6 pb-16"
      style={{ paddingTop: "var(--tb-pad-y)" }}
      data-testid="help-article"
    >
      <Link
        href="/help"
        className="mb-4 inline-block text-[13px] text-tb-text-muted no-underline hover:text-tb-text"
      >
        ← Help hub
      </Link>
      <h1 className="m-0 text-[22px] tracking-tight">{article.title}</h1>
      <p className="mt-2 text-tb-text-muted">{article.summary}</p>
      <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-tb-text">
        {article.body.map((p) => (
          <p key={p.slice(0, 24)} className="m-0">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
