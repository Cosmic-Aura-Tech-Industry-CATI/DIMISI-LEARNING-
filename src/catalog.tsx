import { useStorageRefresh } from "./sync";
import { courses } from "./courses";
import { progress } from "./progress";
import { CourseLink } from "./navigation";

export function Catalog() {
  useStorageRefresh();
  return (
    <section className="catalog" aria-labelledby="catalog-title">
      <div className="catalog-head">
        <h1 id="catalog-title">
          Course catalog<span aria-hidden="true">.</span>
        </h1>
        <span className="catalog-count">
          {Object.keys(courses).length} courses
        </span>
      </div>
      <ul className="catalog-list">
        {Object.values(courses).map((course) => {
          const store = progress(course),
            done = store.completed(),
            total = course.sections.length;
          const bounty = course.id === "bug-bounty";
          return (
            <li key={course.id}>
              <CourseLink
                id={course.id}
                view="path"
                className={"catalog-course" + (bounty ? " bounty-card" : "")}
                label={"Open " + course.name + " course"}
              >
                {bounty ? (
                  <div className="bounty-art" aria-hidden="true">
                    <div className="report-art">
                      <i />
                      <i />
                      <i />
                      <b>✓</b>
                    </div>
                  </div>
                ) : (
                  <div className="cover-art">
                    <img
                      src="/cybersecurity.webp"
                      alt="An illustrated rooftop courier overlooking a city beneath a vermilion sun"
                      fetchPriority="high"
                    />
                  </div>
                )}
                <div className="course-copy">
                  <div className="course-format">VIDEO COURSE</div>
                  <h2>{course.name}</h2>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>{course.tracks.length} tracks</span>
                    <span>{total} sections</span>
                    <span>{course.videoCount} videos</span>
                  </div>
                  <div className="course-progress">
                    <div>
                      <span>Your progress</span>
                      <strong>{Math.round((done / total) * 100)}%</strong>
                    </div>
                    <progress
                      max={total}
                      value={done}
                      aria-label={course.name + " course progress"}
                    />
                  </div>
                  <span className="catalog-action">
                    {done === total
                      ? "Review course"
                      : done || store.lastSection()
                        ? "Continue course"
                        : "Open course"}
                  </span>
                </div>
              </CourseLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
