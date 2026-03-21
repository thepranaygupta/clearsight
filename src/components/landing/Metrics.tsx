export function BuiltWith() {
  return (
    <section className="border-y border-border/40 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-[13px] text-muted-foreground/60">
          Built on{" "}
          <span className="font-semibold text-foreground/70">axe-core</span>
          {" "}— the same accessibility engine used by Microsoft, Google, and the U.S. government.
          Rendered with{" "}
          <span className="font-semibold text-foreground/70">Playwright</span>
          . Enriched by{" "}
          <span className="font-semibold text-foreground/70">AI</span>.
        </p>
      </div>
    </section>
  );
}
