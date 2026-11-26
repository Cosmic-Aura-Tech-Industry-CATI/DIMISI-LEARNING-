import type { Course, Video } from "./courses";

class Progress {
  private memory = new Map<string, string>();
  persistent = true;
  private prefix: string;
  readonly sequenceKey: string;
  constructor(private course: Course) {
    const suffix = course.id === "bug-bounty" ? "-bounty-v1" : "-v1";
    this.prefix = "cipher-academy-playback" + suffix + ":";
    this.sequenceKey = "cipher-academy-sequence" + suffix;
  }
  private read(key: string) {
    try {
      if (this.persistent) return localStorage.getItem(key);
    } catch {
      this.persistent = false;
    }
    return this.memory.get(key) ?? null;
  }
  private write(key: string, value: string) {
    this.memory.set(key, value);
    try {
      if (this.persistent) localStorage.setItem(key, value);
    } catch {
      this.persistent = false;
    }
  }
  private value(key: string): unknown {
    try {
      return JSON.parse(this.read(this.prefix + key) ?? "null");
    } catch {
      return null;
    }
  }
  completed() {
    const n = Number(this.read(this.sequenceKey));
    return Number.isInteger(n) && n >= 0 && n <= this.course.sections.length
      ? n
      : 0;
  }
  finish(index: number) {
    if (this.completed() === index)
      this.write(this.sequenceKey, String(index + 1));
  }
  record(id: string) {
    const v = this.value("video:" + id);
    if (!v || typeof v !== "object") return { time: 0, done: false };
    return {
      time:
        "time" in v && typeof v.time === "number" && Number.isFinite(v.time)
          ? Math.max(0, v.time)
          : 0,
      done: "done" in v && v.done === true,
    };
  }
  save(id: string, time: number, ended = false) {
    if (!Number.isFinite(time)) return;
    const done = ended || this.record(id).done;
    this.write(
      this.prefix + "video:" + id,
      JSON.stringify({ done, time: done ? 0 : Math.max(0, time) }),
    );
  }
  select(section: string, id: string) {
    this.write(this.prefix + "clip:" + section, JSON.stringify(id));
    this.write(this.prefix + "last-section", JSON.stringify(section));
  }
  lastSection() {
    return this.value("last-section");
  }
  startingIndex(section: string, clips: Video[]) {
    const last = clips.findIndex((c) => c.id === this.value("clip:" + section));
    if (last >= 0 && !this.record(clips[last].id).done) return last;
    const next = clips.findIndex((c) => !this.record(c.id).done);
    return next >= 0 ? next : Math.max(0, last);
  }
  resume() {
    const sections = this.course.sections,
      completed = this.completed();
    const last = sections.find(
      (s) =>
        s.key === this.lastSection() &&
        s.index <= completed &&
        s.videos.some((c) => !this.record(c.id).done),
    );
    return last ?? sections[Math.min(completed, sections.length - 1)];
  }
}
const stores = new Map<Course, Progress>();
export function progress(course: Course) {
  const store = stores.get(course) ?? new Progress(course);
  stores.set(course, store);
  return store;
}
