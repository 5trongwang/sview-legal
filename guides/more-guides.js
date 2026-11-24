// The public index is the source for article-to-article links.
async function showMoreGuides() {
  const navigation = document.querySelector('.more-guides');
  const indexLink = document.querySelector('.article-header .guide-meta');
  const currentPath = new URL(document.querySelector('link[rel="canonical"]').href).pathname;
  const response = await fetch(indexLink.href);
  if (!response.ok) return;

  const index = new DOMParser().parseFromString(await response.text(), 'text/html');
  const list = navigation.querySelector('ul');
  for (const entry of index.querySelectorAll('.guide-list .guide-entry[href]')) {
    const url = new URL(entry.getAttribute('href'), response.url);
    const title = entry.querySelector('h2')?.textContent.trim();
    if (!title || url.origin !== location.origin || url.pathname === currentPath) continue;

    const link = document.createElement('a');
    link.href = url.href;
    link.textContent = title;
    const item = document.createElement('li');
    item.append(link);
    list.append(item);
  }
  navigation.hidden = list.childElementCount === 0;
}

showMoreGuides().catch(() => {
  // Keep the optional section hidden if the index cannot be loaded.
});
