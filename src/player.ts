import type { Course, Section, LessonFile } from "./courses";
import { progress } from "./progress";
import { sceneTransition } from "./motion";
export function listFiles(
  container: HTMLElement,
  files: readonly LessonFile[],
) {
  let openRow: (() => void) | null;
  for (const [id, name] of files) {
    const row = document.createElement("div");
    row.className = "lesson-file";
    row.innerHTML =
      '<div class="file-row"><b></b><span class="filename"></span><div class="file-actions"><button type="button" aria-expanded="false">Preview</button><a>Download</a></div></div><div class="file-preview" hidden></div>';
    const preview = row.querySelector<HTMLElement>(".file-preview")!;
    const button = row.querySelector("button")!;
    const download = row.querySelector("a")!;
    const base = "/lesson-files/" + id;
    row.querySelector("b")!.textContent = name.split(".").pop()!.toUpperCase();
    row.querySelector(".filename")!.textContent = name;
    download.href = base + "/download";
    download.download = name;
    download.setAttribute("aria-label", "Download " + name);
    button.setAttribute("aria-label", "Preview " + name);
    function close() {
      preview.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Preview";
      openRow = null;
    }
    button.onclick = async () => {
      if (!preview.hidden) return close();
      if (openRow) openRow();
      openRow = close;
      preview.hidden = false;
      button.setAttribute("aria-expanded", "true");
      button.textContent = "Close preview";
      if (preview.childNodes.length) return;
      const text = document.createElement("pre");
      text.textContent = "Loading preview…";
      preview.append(text);
      try {
        const response = await fetch(base + "/preview");
        if (!response.ok) throw new Error();
        text.textContent = await response.text();
      } catch {
        text.textContent =
          "Preview unavailable. Close and reopen to try again.";
        button.addEventListener("click", () => preview.replaceChildren(), {
          once: true,
        });
      }
    };
    container.append(row);
  }
}
export function mountPlayer(
  host: HTMLElement,
  course: Course,
  section: Section,
  onWatched: (all: boolean) => void,
) {
  const key = section.t + "-" + (section.i + 1);
  const clips = section.videos;
  const playbackProgress = progress(course);
  host.innerHTML =
    (clips.length
      ? `<div class="studio"><div class="screen-column">
    <div class="theater"><div class="video-stage"></div>
    <div class="transport"><div class="settings-wrap">
    <button class="settings-toggle" aria-label="Video settings" aria-expanded="false" aria-controls="video-settings"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg></button>
    <div class="video-settings" id="video-settings" hidden>
    <div class="source-quality">Quality <span>Original</span></div>
    <label>Speed<select class="speed"><option value=".75">0.75×</option><option selected value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></div></div>
    <button class="expand" aria-label="Enter fullscreen" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path/></svg></button></div></div>
    <div class="clip-heading"><div><small class="clip-count"></small><h3 class="clip-title"></h3></div></div>
    <div class="clip-nav"><button class="previous">Previous</button><button class="advance">Next video</button></div><p class="feedback" role="status"></p></div>
    <section class="queue"><h3>Section playlist</h3><div class="clips"></div></section></div>`
      : "") +
    '<section class="materials"><h3>Lesson files</h3><div class="file-list"></div></section>';
  const find = <T extends HTMLElement = HTMLElement>(s: string) =>
    host.querySelector<T>(s)!;
  listFiles(find(".file-list"), [...section.files, ...course.shared]);
  if (course.id === "cybersecurity" && key === "1-1") {
    const note = document.createElement("p");
    note.textContent =
      "Lessons 4, 5, 6 and 9 have subtitles only. Their video files are unavailable.";
    find(".materials h3").after(note);
  }
  if (!find(".file-list").childElementCount) find(".materials").hidden = true;
  if (!clips.length) return () => {};
  const stage = find(".video-stage"),
    theater = find(".theater"),
    expand = find(".expand");
  let active = 0;
  let flush = () => {};
  let disposed = false;
  const lifecycle = new AbortController();
  const save = () => flush();
  window.addEventListener("pagehide", save, { signal: lifecycle.signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) save();
    },
    { signal: lifecycle.signal },
  );
  function switchClip(index: number) {
    sceneTransition.go("Changing video", () => {
      if (!disposed) play(index);
    });
  }
  const buttons = clips.map((clip, i) => {
    const b = document.createElement("button");
    b.className = "clip";
    const num = document.createElement("span");
    num.textContent = String(i + 1).padStart(2, "0");
    b.append(num, document.createTextNode(clip.title));
    b.onclick = () => switchClip(i);
    find(".clips").append(b);
    return b;
  });
  const toggle = find(".settings-toggle"),
    settings = find(".video-settings");
  function menu(open: boolean) {
    settings.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }
  toggle.onclick = () => menu(settings.hidden);
  theater.addEventListener("focusout", (e) => {
    if (
      !find(".settings-wrap").contains(
        e.relatedTarget instanceof Node ? e.relatedTarget : null,
      )
    )
      menu(false);
  });
  theater.addEventListener("pointerdown", (e) => {
    if (!(e.target instanceof Element && e.target.closest(".settings-wrap")))
      menu(false);
  });
  theater.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !settings.hidden) {
      e.preventDefault();
      e.stopPropagation();
      menu(false);
      toggle.focus();
    }
  });
  function loadMedia() {
    flush();
    flush = () => {};
    const clip = clips[active];
    const previous = stage.querySelector("video");
    if (previous) previous.pause();
    stage.replaceChildren();
    const loader = document.createElement("div");
    loader.className = "media-load";
    loader.setAttribute("role", "status");
    loader.textContent = "Loading video";
    find(".feedback").replaceChildren();
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.controls = true;
    v.playsInline = true;
    v.preload = "metadata";
    v.setAttribute("aria-label", clip.title);
    v.setAttribute("controlslist", "nofullscreen noplaybackrate");
    let ready = false,
      lastSave = 0;
    const current = () => !disposed && stage.contains(v);
    flush = () => {
      if (ready && current())
        playbackProgress.save(clip.id, v.currentTime, v.ended);
    };
    v.ontimeupdate = () => {
      if (Date.now() - lastSave >= 3000) {
        flush();
        lastSave = Date.now();
      }
    };
    v.onpause = v.onseeked = flush;
    v.onended = () => {
      if (!current()) return;
      playbackProgress.save(clip.id, v.currentTime, true);
      paintPlaylist();
      find(".feedback").textContent = "Video complete. Your progress is saved.";
      onWatched(clips.every((item) => playbackProgress.record(item.id).done));
    };
    v.oncanplay = v.onplaying = () => {
      loader.hidden = true;
    };
    v.onwaiting = () => {
      if (!v.paused) {
        loader.hidden = false;
        loader.textContent = "Buffering";
      }
    };
    v.onloadedmetadata = () => {
      if (!stage.contains(v)) return;
      const saved = playbackProgress.record(clip.id).time;
      if (saved > 0 && Number.isFinite(v.duration))
        v.currentTime = Math.min(saved, Math.max(0, v.duration - 0.25));
      ready = true;
      loader.hidden = true;
      v.playbackRate = Number(find<HTMLSelectElement>(".speed").value);
      let previousTap: {
        zone: HTMLButtonElement;
        time: number;
        x: number;
        y: number;
      } | null = null;
      for (const delta of [-10, 10]) {
        const zone = document.createElement("button");
        zone.className = "seek-zone " + (delta < 0 ? "left" : "right");
        zone.setAttribute(
          "aria-label",
          delta < 0 ? "Rewind 10 seconds" : "Forward 10 seconds",
        );
        zone.innerHTML =
          '<span aria-hidden="true">' +
          (delta < 0 ? "↶" : "↷") +
          "<b>10</b></span>";
        let timer: number;
        zone.onclick = (event) => {
          // Keyboard and assistive technology activate the button directly.
          if (event.detail > 0) {
            const paired =
              previousTap?.zone === zone &&
              event.timeStamp - previousTap.time <= 350 &&
              Math.hypot(
                event.clientX - previousTap.x,
                event.clientY - previousTap.y,
              ) <= 40;
            previousTap = paired
              ? null
              : {
                  zone,
                  time: event.timeStamp,
                  x: event.clientX,
                  y: event.clientY,
                };
            if (!paired) return;
          } else {
            previousTap = null;
          }
          if (!Number.isFinite(v.duration)) return;
          v.currentTime = Math.min(
            v.duration,
            Math.max(0, v.currentTime + delta),
          );
          zone.classList.add("tapped");
          clearTimeout(timer);
          timer = setTimeout(() => zone.classList.remove("tapped"), 500);
        };
        stage.append(zone);
      }
    };
    v.onerror = () => {
      if (!current()) return;
      loader.hidden = true;
      const retry = document.createElement("button");
      retry.textContent = "Retry video";
      retry.onclick = loadMedia;
      find(".feedback").replaceChildren(
        "Video temporarily unavailable. ",
        retry,
      );
    };
    v.src = "/media/" + clip.id;
    stage.append(v, loader);
  }
  function paintPlaylist() {
    buttons.forEach((button, i) => {
      const watched = playbackProgress.record(clips[i].id).done;
      button.classList.toggle("watched", watched);
      button.firstElementChild!.textContent = watched
        ? "✓"
        : String(i + 1).padStart(2, "0");
      button.setAttribute(
        "aria-label",
        clips[i].title + (watched ? ", completed" : ""),
      );
      button.setAttribute("aria-current", String(i === active));
    });
  }
  function play(i: number) {
    active = i;
    playbackProgress.select(key, clips[i].id);
    find(".clip-title").textContent = clips[i].title;
    find(".clip-count").textContent =
      "VIDEO " + (i + 1) + " OF " + clips.length;
    paintPlaylist();
    find<HTMLButtonElement>(".previous").disabled = i === 0;
    find<HTMLButtonElement>(".advance").disabled = i === clips.length - 1;
    loadMedia();
  }
  find<HTMLSelectElement>(".speed").onchange = (e) => {
    const v = stage.querySelector("video");
    if (v) v.playbackRate = Number(find<HTMLSelectElement>(".speed").value);
  };
  find<HTMLButtonElement>(".previous").onclick = () => switchClip(active - 1);
  find<HTMLButtonElement>(".advance").onclick = () => switchClip(active + 1);
  let orientationRequested = false;
  function update() {
    const wide =
      document.fullscreenElement === theater ||
      theater.classList.contains("wide-screen");
    expand.setAttribute(
      "aria-label",
      wide ? "Exit fullscreen" : "Enter fullscreen",
    );
    expand.setAttribute("aria-pressed", String(wide));
    expand
      .querySelector("path")!
      .setAttribute(
        "d",
        wide
          ? "M3 8h5V3m8 0v5h5M3 16h5v5m8 0v-5h5"
          : "M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6",
      );
    if (!wide && orientationRequested) {
      orientationRequested = false;
      try {
        screen.orientation.unlock();
      } catch {}
    }
  }
  theater.onfullscreenchange = update;
  expand.onclick = async () => {
    menu(false);
    if (document.fullscreenElement === theater) await document.exitFullscreen();
    else if (theater.classList.contains("wide-screen"))
      theater.classList.remove("wide-screen");
    else {
      try {
        await theater.requestFullscreen();
      } catch {
        theater.classList.add("wide-screen");
      }
      const orientation = screen.orientation as
        | (ScreenOrientation & { lock?: (mode: "landscape") => Promise<void> })
        | undefined;
      if (orientation?.lock) {
        orientationRequested = true;
        try {
          await orientation.lock("landscape");
        } catch {
          orientationRequested = false;
        }
      }
    }
    update();
  };
  update();
  play(playbackProgress.startingIndex(key, clips));
  return () => {
    flush();
    disposed = true;
    lifecycle.abort();
    const video = stage.querySelector("video");
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  };
}
