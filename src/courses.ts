import cyber from "./data/cybersecurity.json";
import bounty from "./data/bounty.json";

export type CourseId = "cybersecurity" | "bug-bounty";
export type View = "path" | "milestones" | "resources";
export const titles: Record<View, string> = {
  path: "Learning path",
  milestones: "Milestones",
  resources: "Course resources",
};
export interface Video {
  id: string;
  title: string;
}
export type LessonFile = readonly [id: string, name: string];
interface TrackData {
  name: string;
  sections: {
    title: string;
    goal?: string;
    videos: Video[];
    files: string[][];
  }[];
}
export interface Section {
  title: string;
  goal: string;
  t: number;
  i: number;
  index: number;
  key: string;
  videos: Video[];
  files: LessonFile[];
}
function files(rows: string[][]): LessonFile[] {
  return rows.map(([id, name]) => [id, name]);
}
function course(
  id: CourseId,
  name: string,
  description: string,
  data: TrackData[],
  shared: string[][] = [],
) {
  let index = 0;
  const tracks = data.map((track, t) => ({
    name: track.name,
    sections: track.sections.map(
      (s, i): Section => ({
        title: s.title,
        goal:
          s.goal ??
          "Summarize one takeaway from " + s.title + " in your study notes.",
        t,
        i,
        index: index++,
        key: t + "-" + (i + 1),
        videos: s.videos,
        files: files(s.files),
      }),
    ),
  }));
  const sections = tracks.flatMap((t) => t.sections);
  return {
    id,
    name,
    description,
    tracks,
    sections,
    shared: files(shared),
    videoCount: sections.reduce((sum, s) => sum + s.videos.length, 0),
  };
}
export type Course = ReturnType<typeof course>;
export const courses = {
  cybersecurity: course(
    "cybersecurity",
    "Cybersecurity",
    "Explore Linux, Python and defensive security through guided lessons and hands-on checkpoints.",
    cyber.tracks,
    cyber.shared,
  ),
  "bug-bounty": course(
    "bug-bounty",
    "Bug Bounty Foundations",
    "Learn how bug bounty programs work, interpret web security risks, and write a clear vulnerability report.",
    bounty,
  ),
};
