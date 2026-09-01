type GuideTocItem = { href: `#${string}`; label: string };

/** R18 inner-guide anchor navigation; content remains fully SSR rendered. */
export function GuideToc({ items }: { items: readonly GuideTocItem[] }) {
  return (
    <aside className="r18-toc" aria-label="On this page">
      <nav className="r18-toc-card">
        <p className="r18-toc-title">On this page</p>
        {items.map((item, index) => (
          <a key={item.href} href={item.href} className={`r18-toc-link${index === 0 ? " r18-toc-active" : ""}`}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}