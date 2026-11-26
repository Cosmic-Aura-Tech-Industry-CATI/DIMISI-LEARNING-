import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { CourseId, View } from "./courses";
import { titles } from "./courses";
import { sceneTransition } from "./motion";

export function CourseLink({
  id,
  view,
  children,
  className,
  label,
  onNavigate,
  track,
}: {
  id?: CourseId;
  view?: View;
  children: ReactNode;
  className?: string;
  label?: string;
  onNavigate?: () => void;
  track?: number;
}) {
  const navigate = useNavigate();
  const target =
    id && view
      ? {
          to: "/courses/$courseId/$view" as const,
          params: { courseId: id, view },
          search: { track },
        }
      : { to: "/" as const };
  return (
    <Link
      {...target}
      className={className}
      aria-label={label}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onNavigate?.();
        void sceneTransition.go(
          "Opening " + (view ? titles[view].toLowerCase() : "catalog"),
          () => {
            void navigate(target);
          },
        );
      }}
    >
      {children}
    </Link>
  );
}
