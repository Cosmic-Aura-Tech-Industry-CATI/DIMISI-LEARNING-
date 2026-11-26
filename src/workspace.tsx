import { useStorageRefresh } from "./sync";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Course, View, Section } from "./courses";
import { progress } from "./progress";
import { CourseLink } from "./navigation";
import { FileList, Lesson } from "./lesson";
import { sceneTransition } from "./motion";

export function Workspace({
  course,
  view,
  track,
}: {
  course: Course;
  view: View;
  track?: number;
}) {
  useStorageRefresh();
  const store = progress(course),
    done = store.completed(),
    total = course.sections.length;
  const current = course.sections[done]?.t ?? course.tracks.length - 1;
  const [expanded, setExpanded] = useState(track ?? current);
  const [selected, setSelected] = useState<Section | null>(null);
  const [, refresh] = useState(0);
  const pending = useRef(0);
  useEffect(
    () => () => {
      pending.current++;
    },
    [],
  );
  useEffect(() => {
    if (track !== undefined) setExpanded(track);
  }, [track]);
  const count = (t: number) =>
    course.tracks[t].sections.filter((s) => s.index < done).length;
  const status = (t: number) =>
    count(t) === course.tracks[t].sections.length
      ? "Completed"
      : course.sections[done]?.t === t
        ? "Current"
        : "Locked";
  function open(s: Section) {
    if (s.index > store.completed()) return;
    const request = ++pending.current;
    void sceneTransition.go("Opening lesson", () => {
      if (request === pending.current) setSelected(s);
    });
  }
  const finish = useCallback(() => {
    if (!selected || store.completed() !== selected.index) return;
    store.finish(selected.index);
    setExpanded(
      course.sections[store.completed()]?.t ?? course.tracks.length - 1,
    );
    refresh((n) => n + 1);
  }, [course, selected, store]);
  const close = () => {
    pending.current++;
    setSelected(null);
    refresh((n) => n + 1);
  };
  const resume = store.resume(),
    clip = resume.videos[store.startingIndex(resume.key, resume.videos)];
  const seconds = clip ? Math.floor(store.record(clip.id).time) : 0;
  const stats = [
    ["◴", Math.round((done / total) * 100) + "%", "Overall progress"],
    ["▤", done + " / " + total, "Sections complete"],
    [
      "⚑",
      course.tracks.filter((_, t) => status(t) === "Completed").length +
        " / " +
        course.tracks.length,
      "Milestones earned",
    ],
  ];
  return (
    <>
      {!store.persistent && (
        <p role="alert">
          Browser storage is unavailable. Progress will last for this visit
          only.
        </p>
      )}
      {view === "path" && (
        <>
          <CourseLink className="catalog-back">All courses</CourseLink>
          <section
            className={
              "hero anime-hero " +
              (course.id === "bug-bounty" ? "bounty-hero" : "")
            }
          >
            <div className="eyebrow">
              {course.name.toUpperCase()}　/　LEARNING PATH
            </div>
            <h1>
              {course.name}
              <br />
              learning path
            </h1>
            <p>
              {course.id === "cybersecurity"
                ? "Study security foundations, Python and advanced analysis in three guided tracks."
                : course.description}
            </p>
            <button className="btn" onClick={() => open(resume)}>
              ▶　
              {done === total
                ? "Review final section"
                : done || store.lastSection()
                  ? "Resume learning"
                  : "Start learning"}
            </button>
            {resume.key === store.lastSection() && clip && (
              <small className="resume-info">
                Up next · {clip.title}
                {seconds > 0
                  ? " · " +
                    Math.floor(seconds / 60) +
                    ":" +
                    String(seconds % 60).padStart(2, "0")
                  : ""}
              </small>
            )}
          </section>
          <div className="stats">
            {stats.map(([icon, value, label]) => (
              <div className="stat" key={label}>
                <div className="icon">{icon}</div>
                <div>
                  <strong>{value}</strong>
                  <small>{label}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="sectionhead">
            <h2>Course curriculum</h2>
            <span>
              {course.tracks.length} tracks · {total} sections
            </span>
          </div>
          {course.tracks.map((tr, t) => (
            <article
              key={tr.name}
              className={"card " + (status(t) === "Current" ? "current" : "")}
            >
              <button
                className="track"
                aria-expanded={expanded === t}
                onClick={() => setExpanded(expanded === t ? -1 : t)}
              >
                <span className="badge">0{t + 1}</span>
                <span className="track-title">
                  <strong>{tr.name}</strong>
                  <small>
                    {tr.sections.length} sections · Milestone {t + 1}
                  </small>
                </span>
                <span className="status">{status(t)}</span>
                <span aria-hidden="true">{expanded === t ? "−" : "+"}</span>
              </button>
              {expanded === t &&
                tr.sections.map((s) => (
                  <button
                    className="track lesson"
                    key={s.key}
                    disabled={s.index > done}
                    onClick={() => open(s)}
                  >
                    <span className="muted">
                      {String(s.i + 1).padStart(2, "0")}
                    </span>
                    <span>{s.title}</span>
                    <span className="end">
                      {s.index < done
                        ? "✓ Done"
                        : s.index === done
                          ? "Open section"
                          : "Locked"}
                    </span>
                  </button>
                ))}
            </article>
          ))}
          <section className="about">
            <h2>About this learning path</h2>
            <p>
              Work through each section in order. Finish every video in a
              section to unlock the next. Mark reading-only sections complete
              after reviewing their materials. Each finished track earns a
              milestone.
            </p>
          </section>
        </>
      )}
      {view === "milestones" && (
        <>
          <h1>Milestones</h1>
          <p className="note">
            Complete every section in a track to earn its milestone.
          </p>
          {course.tracks.map((tr, t) => (
            <section className="panel" key={tr.name}>
              <div className="tag">
                MILESTONE 0{t + 1} · {status(t).toUpperCase()}
              </div>
              <h2>{tr.name}</h2>
              <p>
                {count(t)} of {tr.sections.length} sections complete
              </p>
              <div className="bar">
                <i
                  style={{ width: (100 * count(t)) / tr.sections.length + "%" }}
                />
              </div>
              <p>
                <CourseLink
                  id={course.id}
                  view="path"
                  className="btn"
                  track={t}
                >
                  View track
                </CourseLink>
              </p>
            </section>
          ))}
          <section className="about">
            <h2>How milestones work</h2>
            <p>
              Each milestone represents one track. Finish its sections to earn
              it. You can revisit completed lessons at any time.
            </p>
          </section>
        </>
      )}
      {view === "resources" && (
        <>
          <h1>Course resources</h1>
          <p className="note">
            Preview or download the files for each section.
          </p>
          {course.sections
            .filter((s) => s.index <= done && s.files.length)
            .map((s) => (
              <details className="panel resource-group" key={s.key}>
                <summary>
                  {s.title}{" "}
                  <small>
                    Track {s.t + 1} · Section {s.i + 1}
                  </small>
                </summary>
                <FileList files={s.files} />
              </details>
            ))}
          {course.shared.length > 0 && (
            <section className="panel">
              <h2>Shared course files</h2>
              <FileList files={course.shared} />
            </section>
          )}
        </>
      )}
      {selected && (
        <Lesson
          course={course}
          section={selected}
          onComplete={finish}
          onClose={close}
          onNext={() => open(course.sections[selected.index + 1])}
        />
      )}
    </>
  );
}
