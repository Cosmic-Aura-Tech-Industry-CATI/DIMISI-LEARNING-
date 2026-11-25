// Separate records keep progress for different clips independent across tabs.
const playbackProgress = (() => {
  const prefix = 'cipher-academy-playback-v1:';
  const memory = new Map();
  let available = true;
  function read(key) {
    if (available) {
      try { return JSON.parse(localStorage.getItem(prefix + key)); }
      catch { available = false; }
    }
    return memory.get(key);
  }
  function write(key, value) {
    memory.set(key, value);
    if (available) {
      try { localStorage.setItem(prefix + key, JSON.stringify(value)); }
      catch { available = false; }
    }
  }
  function record(id) {
    const item = read('video:' + id);
    return {time: Number.isFinite(item?.time) ? Math.max(0, item.time) : 0, done: item?.done === true};
  }
  return {
    record,
    save(id, time, ended = false) {
      if (!Number.isFinite(time)) return;
      const done = ended || record(id).done;
      write('video:' + id, {time: done ? 0 : Math.max(0, time), done});
    },
    select(section, id) {
      write('clip:' + section, id);
      write('last-section', section);
    },
    lastSection: () => read('last-section'),
    startingIndex(section, clips) {
      const last = clips.findIndex(c => c.id === read('clip:' + section));
      if (last >= 0 && !record(clips[last].id).done) return last;
      const unfinished = clips.findIndex(c => !record(c.id).done);
      return unfinished >= 0 ? unfinished : Math.max(0, last);
    },
    get persistent() { return available; }
  };
})();
