declare global {
  interface Window {
    SakugaFX?: {
      P: Record<string, unknown>;
      calm: boolean;
      ticks: Effect;
      burst: Effect;
      shards: Effect;
    };
  }
}
type Effect = (x: number, y: number, options: Record<string, number>) => void;
// Use the upstream Sakuga effects on native controls so keyboard and touch share the same actions.
(() => {
  const fx = window.SakugaFX;
  if (!fx) return;
  Object.assign(fx.P, {
    fill: "#fff6e8",
    shade: "#ffbf88",
    line: "#983711",
    accent: "#ff6a2a",
    ink: "#322018",
    sfx: ["#322018", "#fff6e8"],
  });

  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest("a,button")
          : null;
      if (
        !target ||
        target.matches(":disabled") ||
        fx.calm ||
        target.closest(".video-stage")
      )
        return;

      const element = target.querySelector(".catalog-action") || target;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = scrollX + Math.min(innerWidth - 14, rect.right - 8);
      const y = scrollY + Math.max(14, rect.top + 6);
      const primary = target.matches(".catalog-course,.btn,#complete");
      fx.ticks(x, y, { n: 3, r: 8, len: 12, life: 0.25 });
      if (primary) {
        fx.burst(x, y, { r: 24, spikes: 9, life: 0.27 });
        fx.shards(x, y, { n: 5, speed: 100, size: 4, life: 0.38 });
      }
      // Native dialogs sit above document content. Use a transparent top-layer
      // canvas for the brief effect without intercepting focus or pointer input.
      const canvas =
        document.querySelector<HTMLCanvasElement>("canvas.sakuga-fx");
      if (canvas && canvas.showPopover) {
        canvas.popover = "manual";
        if (!canvas.matches(":popover-open")) canvas.showPopover();
      }
    },
    { capture: true },
  );
})();

// Navigation keeps native links and browser history. Latest destination wins.
export const sceneTransition = (() => {
  let sequence = 0;
  const layer = document.querySelector<HTMLElement>("#scene-change")!;
  const status = document.querySelector<HTMLElement>("#scene-status")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  function hide() {
    if (layer.matches?.("[popover]") && layer.hidePopover) layer.hidePopover();
    layer.hidden = true;
    status.textContent = "";
  }
  function cancel() {
    sequence++;
    hide();
  }
  async function go(label: string, change: () => void) {
    const token = ++sequence;
    if (reduced.matches) {
      hide();
      change();
      return;
    }
    layer.querySelector("strong")!.textContent = label;
    status.textContent = label;
    layer.hidden = false;
    if (layer.showPopover) {
      layer.popover = "manual";
      layer.showPopover();
    }
    await new Promise((resolve) => setTimeout(resolve, 320));
    if (token !== sequence) return;
    try {
      change();
    } finally {
      if (token === sequence) hide();
    }
  }
  return { go, cancel };
})();
