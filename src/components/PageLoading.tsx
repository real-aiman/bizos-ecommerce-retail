export function PageLoading({ rows = 8 }: { rows?: number }) {
  return (
    <main className="container page" aria-busy="true" aria-label="Loading">
      <div className="skeleton skeleton-title" />
      <div className="skeleton-grid">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="skeleton" key={index} />
        ))}
      </div>
    </main>
  );
}
