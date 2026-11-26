import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useParams,
  useRouterState,
  notFound,
} from "@tanstack/react-router";
import { courses, titles, type CourseId, type View } from "./courses";
import { CourseLink } from "./navigation";
import { Catalog } from "./catalog";
import { Workspace } from "./workspace";
import { sceneTransition } from "./motion";

function Shell() {
  const { courseId, view } = useParams({ strict: false });
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const title = view ? titles[view] : "Course catalog";
  const drawer = useRef<HTMLDialogElement>(null);
  const close = () => drawer.current?.close();
  useEffect(() => {
    document.title = title + " · Cipher Academy";
    document.body.classList.toggle("catalog-home", pathname === "/");
    close();
    window.scrollTo(0, 0);
    sceneTransition.cancel();
  }, [title, pathname]);
  return (
    <>
      <header className="mast">
        <button
          id="menu"
          aria-label="Open course menu"
          aria-haspopup="dialog"
          aria-controls="drawer"
          onClick={() => drawer.current?.showModal()}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <CourseLink className="brand">
          <i>ϟ</i>Cipher<span>Academy</span>
        </CourseLink>
        <span className="divider" />
        <strong id="crumb">{title}</strong>
        <span className="avatar" aria-label="Learner">
          L
        </span>
      </header>
      <dialog
        id="drawer"
        ref={drawer}
        aria-labelledby="menuTitle"
        onClick={(e) => {
          if (
            e.target === e.currentTarget &&
            e.clientX > e.currentTarget.getBoundingClientRect().right
          )
            close();
        }}
      >
        <form method="dialog">
          <button aria-label="Close course menu">×</button>
        </form>
        <h2 id="menuTitle">Course menu</h2>
        <nav>
          <CourseLink className={!view ? "active" : ""} onNavigate={close}>
            Course catalog
          </CourseLink>
          {courseId &&
            Object.entries(titles).map(([key, name]) => (
              <CourseLink
                key={key}
                id={courseId}
                view={key as View}
                onNavigate={close}
                className={view === key ? "active" : ""}
              >
                {name}
              </CourseLink>
            ))}
        </nav>
        <div className="drawer-foot">Cipher Academy</div>
      </dialog>
      <main>
        <div id="page">
          <Outlet />
        </div>
      </main>
    </>
  );
}
function Missing() {
  return (
    <section className="panel">
      <h1>Page unavailable</h1>
      <CourseLink>Back to course catalog</CourseLink>
    </section>
  );
}
const rootRoute = createRootRoute({
  component: Shell,
  notFoundComponent: Missing,
});
const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Catalog,
});
const courseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses/$courseId/$view",
  params: {
    parse(raw) {
      if (
        !Object.hasOwn(courses, raw.courseId) ||
        !Object.hasOwn(titles, raw.view)
      )
        throw notFound();
      return { courseId: raw.courseId as CourseId, view: raw.view as View };
    },
  },
  validateSearch: (search: Record<string, unknown>): { track?: number } =>
    typeof search.track === "number" &&
    Number.isInteger(search.track) &&
    search.track >= 0
      ? { track: search.track }
      : {},
  component: CoursePage,
});
function CoursePage() {
  const { courseId, view } = courseRoute.useParams(),
    { track } = courseRoute.useSearch();
  return (
    <Workspace
      key={courseId + "/" + view}
      course={courses[courseId]}
      view={view}
      track={
        track !== undefined && track < courses[courseId].tracks.length
          ? track
          : undefined
      }
    />
  );
}
function legacyUrl() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path !== "" && path !== "/index.html" && path !== "/bug-bounty") return;
  const hash = location.hash.slice(1);
  if (hash === "catalog") return "/";
  if (path === "/bug-bounty" || Object.hasOwn(titles, hash))
    return (
      "/courses/" +
      (path === "/bug-bounty" ? "bug-bounty" : "cybersecurity") +
      "/" +
      (Object.hasOwn(titles, hash) ? hash : "path")
    );
  if (path === "/index.html") return "/";
}
const legacy = legacyUrl();
if (legacy) history.replaceState(history.state, "", legacy + location.search);
const router = createRouter({
  routeTree: rootRoute.addChildren([catalogRoute, courseRoute]),
  defaultPreload: "intent",
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
window.addEventListener("hashchange", () => {
  const path = legacyUrl();
  if (path) router.history.replace(path + location.search);
});
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
