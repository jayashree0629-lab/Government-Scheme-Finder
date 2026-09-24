import { UserIcon, GlobeIcon, BuildingIcon, SparkleIcon, CheckCircleIcon } from "./icons";

const NODES = [
  { label: "You", Icon: UserIcon },
  { label: "Live web search", Icon: GlobeIcon },
  { label: "Government sources", Icon: BuildingIcon },
  { label: "AI reasoning", Icon: SparkleIcon },
  { label: "Your benefits", Icon: CheckCircleIcon },
];

/**
 * Decorative conceptual visualization for the hero: a vertical chain of glowing nodes
 * representing the real pipeline (profile -> SerpApi search -> government sources ->
 * Gemini reasoning -> benefits). Purely illustrative — no live data is plotted here.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[320px] py-2" aria-hidden="true">
      <div
        className="absolute left-[23px] top-5 bottom-5 w-px bg-gradient-to-b from-transparent via-accent-400/60 to-transparent"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, var(--color-accent-400) 0 3px, transparent 3px 10px)",
          opacity: 0.5,
        }}
      />
      <div className="flex flex-col gap-9">
        {NODES.map((node, i) => (
          <div key={node.label} className="relative flex items-center gap-3.5">
            <span
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent-400/50 bg-navy-800 text-accent-300"
              style={{ boxShadow: "0 0 0 6px color-mix(in srgb, var(--color-accent-500) 12%, transparent)" }}
            >
              <span
                className="absolute inset-0 rounded-full motion-safe:animate-[glow-pulse_2.6s_ease-in-out_infinite]"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--color-accent-400) 45%, transparent) 0%, transparent 70%)",
                  animationDelay: `${i * 0.35}s`,
                }}
              />
              <node.Icon className="h-5 w-5 relative" />
            </span>
            <span className="text-base font-medium text-white/90">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
