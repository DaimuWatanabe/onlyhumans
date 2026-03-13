export function SkeletonCard({ height }: { height: number }) {
  return (
    <div
      className="break-inside-avoid mb-4 rounded-2xl bg-muted animate-pulse"
      style={{ height: `${height}px` }}
    />
  )
}

export function SkeletonGrid() {
  const heights = [300, 450, 380, 520, 280, 420, 360, 480, 310, 550, 390, 440]

  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 px-4 md:px-6">
      {heights.map((height, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  )
}
