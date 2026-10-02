// "COLOR MATH" as a block-pixel wordmark (DESIGN.md: the brand name is block-pixel ASCII).
// Drawn as SVG cells so the shape does not depend on which font has the █ glyph.
const ROWS = [
  '███ ███ █   ███ ██    █   █ ███ ███ █ █',
  '█   █ █ █   █ █ █ █   ██ ██ █ █  █  █ █',
  '█   █ █ █   █ █ ██    █ █ █ ███  █  ███',
  '█   █ █ █   █ █ █ █   █   █ █ █  █  █ █',
  '███ ███ ███ ███ █ █   █   █ █ █  █  █ █',
];

export default function Wordmark() {
  return (
    <svg
      className="wordmark"
      viewBox={`0 0 ${ROWS[0].length} ${ROWS.length}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      {ROWS.flatMap((row, y) =>
        [...row].map((cell, x) => (cell === '█' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)),
      )}
    </svg>
  );
}
