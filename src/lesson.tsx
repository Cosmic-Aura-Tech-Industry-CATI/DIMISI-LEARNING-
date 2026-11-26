import { useLayoutEffect, useRef } from "react";
import type { Course, Section, LessonFile } from "./courses";
import { listFiles, mountPlayer } from "./player";
import { progress } from "./progress";
import { CourseLink } from "./navigation";

export function FileList({ files }: { files: readonly LessonFile[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current!;
    listFiles(el, files);
    return () => el.replaceChildren();
  }, [files]);
  return <div ref={ref} />;
}
export function Lesson({
  course,
  section,
  onComplete,
  onClose,
  onNext,
}: {
  course: Course;
  section: Section;
  onComplete: () => void;
  onClose: () => void;
  onNext: () => void;
}) {
  const modal = useRef<HTMLDialogElement>(null),
    screen = useRef<HTMLDivElement>(null);
  const store = progress(course),
    complete = section.index < store.completed();
  useLayoutEffect(() => {
    const el = modal.current!,
      host = screen.current!;
    if (!el.open) el.showModal();
    el.scrollTop = 0;
    if (
      section.videos.length &&
      section.videos.every((c) => store.record(c.id).done)
    )
      onComplete();
    const release = mountPlayer(host, course, section, (all) => {
      if (all) onComplete();
    });
    return () => {
      release();
      host.replaceChildren();
    };
  }, [section, course, store, onComplete]);
  const next = course.sections[section.index + 1];
  return (
    <dialog
      id="lesson"
      ref={modal}
      aria-label="Lesson workspace"
      onClose={onClose}
      onCancel={(e) => {
        const wide = modal.current?.querySelector<HTMLButtonElement>(
          ".wide-screen .expand",
        );
        if (wide) {
          e.preventDefault();
          wide.click();
        }
      }}
    >
      <form method="dialog">
        <button aria-label="Close lesson">×</button>
      </form>
      <div id="detail">
        <p className="tag">
          TRACK 0{section.t + 1} · SECTION {section.i + 1}
        </p>
        <h2>{section.title}</h2>
        <div id="sectionMedia" ref={screen} />
        <section className="checkpoint" aria-live="polite">
          <h3>Learning checkpoint</h3>
          <p>{section.goal}</p>
          {complete ? (
            <>
              <p className="completion-note">
                ✓{" "}
                {next?.t !== section.t
                  ? "Milestone earned · " + course.tracks[section.t].name
                  : "Section complete"}
              </p>
              {next ? (
                <button className="btn" onClick={onNext}>
                  Continue to next section
                </button>
              ) : (
                <CourseLink
                  id={course.id}
                  view="milestones"
                  className="btn"
                  onNavigate={onClose}
                >
                  View milestones
                </CourseLink>
              )}
            </>
          ) : section.videos.length ? (
            <p className="auto-note">
              Progress saves as you watch. Finish each video to unlock the next
              section.
            </p>
          ) : (
            <button id="complete" className="btn" onClick={onComplete}>
              Mark section complete
            </button>
          )}
        </section>
      </div>
    </dialog>
  );
}
