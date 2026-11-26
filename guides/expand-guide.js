// The standalone article is also the source of the inline guide.
async function loadGuide(link, panel, signal) {
  const response = await fetch(link.href, { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error('Guide unavailable');
  const template = document.createElement('template');
  template.innerHTML = await response.text();
  const lead = template.content.querySelector('article .lead');
  const layout = template.content.querySelector('article .guide-layout');
  const steps = layout?.querySelector('.instructions');
  if (!lead || !steps) throw new Error('Guide content unavailable');

  const copy = document.createElement('div');
  steps.before(copy);
  copy.append(lead, steps);

  for (const attr of ['src', 'href', 'poster']) {
    for (const element of layout.querySelectorAll('[' + attr + ']')) {
      element.setAttribute(attr, new URL(element.getAttribute(attr), response.url).href);
    }
  }
  const store = document.querySelector('.nav-download');
  const download = layout.querySelector('[data-store-download]');
  if (store && download) download.href = store.href;
  if (!signal.aborted) panel.replaceChildren(layout);
}

let closeOpenGuide;
for (const [index, link] of document.querySelectorAll('.guide-entry').entries()) {
  const panel = document.createElement('div');
  panel.className = 'guide-panel';
  panel.id = 'guide-panel-' + index;
  panel.hidden = true;
  link.after(panel);
  link.setAttribute('role', 'button');
  link.setAttribute('aria-expanded', 'false');
  link.setAttribute('aria-controls', panel.id);

  link.addEventListener('keydown', event => {
    if (event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) link.click();
    }
  });

  link.addEventListener('click', async event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const wasOpen = !panel.hidden;
    closeOpenGuide?.();
    if (wasOpen) return;

    const request = new AbortController();
    closeOpenGuide = () => {
      request.abort();
      panel.querySelector('video')?.pause();
      panel.hidden = true;
      panel.replaceChildren();
      panel.removeAttribute('aria-busy');
      link.setAttribute('aria-expanded', 'false');
      closeOpenGuide = null;
    };
    link.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    panel.setAttribute('aria-busy', 'true');
    panel.textContent = 'Loading guide…';
    link.scrollIntoView({ block: 'nearest' });
    try {
      await loadGuide(link, panel, request.signal);
    } catch {
      if (request.signal.aborted) return;
      const fallback = document.createElement('a');
      fallback.href = link.href;
      fallback.textContent = 'Open full guide';
      panel.replaceChildren(fallback);
    } finally {
      if (!request.signal.aborted) panel.removeAttribute('aria-busy');
    }
  });
}
