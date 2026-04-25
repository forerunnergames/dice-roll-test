// CSS dot-pattern dice face. Pure presentational component — no state, no effects.
// Each face is a dark square with gold dots arranged in the standard pip layout.
//
// The dot positions use a 3x3 grid (top/middle/bottom x left/center/right).
// Standard dice pip layouts:
//   1: center
//   2: top-right, bottom-left
//   3: top-right, center, bottom-left
//   4: four corners
//   5: four corners + center
//   6: left column (3) + right column (3)

// Dot position classes within the 3x3 grid.
const TOP_LEFT = "top-[20%] left-[20%]";
const TOP_RIGHT = "top-[20%] right-[20%]";
const MID_LEFT = "top-1/2 left-[20%] -translate-y-1/2";
const MID_CENTER = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
const MID_RIGHT = "top-1/2 right-[20%] -translate-y-1/2";
const BOT_LEFT = "bottom-[20%] left-[20%]";
const BOT_RIGHT = "bottom-[20%] right-[20%]";

// Which dots to show for each face value (1-6).
const PIP_LAYOUTS: Record<number, string[]> = {
  1: [MID_CENTER],
  2: [TOP_RIGHT, BOT_LEFT],
  3: [TOP_RIGHT, MID_CENTER, BOT_LEFT],
  4: [TOP_LEFT, TOP_RIGHT, BOT_LEFT, BOT_RIGHT],
  5: [TOP_LEFT, TOP_RIGHT, MID_CENTER, BOT_LEFT, BOT_RIGHT],
  6: [TOP_LEFT, MID_LEFT, BOT_LEFT, TOP_RIGHT, MID_RIGHT, BOT_RIGHT],
};

export function DiceFace({ value }: { value: number }) {
  const pips = PIP_LAYOUTS[value] ?? PIP_LAYOUTS[1];

  return (
    <div className="relative aspect-square w-14 rounded-lg border border-foreground/10 bg-surface sm:w-16"
         aria-label={`Die showing ${value}`}
         role="img"
    >
      {pips.map((position, i) => (
        <span
          key={i}
          className={`absolute h-2.5 w-2.5 rounded-full bg-gold sm:h-3 sm:w-3 ${position}`}
        />
      ))}
    </div>
  );
}
