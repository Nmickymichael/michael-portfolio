const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('portfolio-theme', theme);
  if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☼' : '☾';
  if (themeToggle) themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

setTheme(root.dataset.theme || 'dark');

themeToggle?.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Load public repositories from GitHub so new projects appear here automatically.
// GitHub's public API does not require an access token for public repositories.
async function loadGitHubProjects() {
  const grid = document.getElementById('repo-grid');
  const status = document.getElementById('repo-status');
  if (!grid || !status) return;

  try {
    const response = await fetch('https://api.github.com/users/Nmickymichael/repos?type=owner&sort=updated&per_page=100', {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error('GitHub returned ' + response.status);

    const repositories = await response.json();
    const projects = repositories
      .filter(repo => !repo.fork && !repo.archived && repo.name !== 'classtrack-student-attendance')
      .sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));

    grid.replaceChildren();
    if (!projects.length) {
      status.textContent = 'No additional public projects found yet. Visit GitHub to explore all repositories.';
      return;
    }

    projects.forEach(repo => {
      const card = document.createElement('article');
      card.className = 'repo-card';

      const title = document.createElement('h4');
      const titleLink = document.createElement('a');
      titleLink.href = repo.html_url;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      titleLink.textContent = repo.name.replace(/[-_]/g, ' ');
      title.append(titleLink);

      const description = document.createElement('p');
      description.textContent = repo.description || 'A public project on GitHub. Explore the repository to learn more.';

      const meta = document.createElement('div');
      meta.className = 'repo-meta';
      if (repo.language) {
        const language = document.createElement('span');
        language.textContent = repo.language;
        meta.append(language);
      }
      const stars = document.createElement('span');
      stars.textContent = '★ ' + repo.stargazers_count;
      meta.append(stars);

      const links = document.createElement('div');
      links.className = 'repo-links';
      const source = document.createElement('a');
      source.href = repo.html_url;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = 'Source code ↗';
      links.append(source);

      if (repo.homepage) {
        try {
          const liveUrl = new URL(repo.homepage);
          if (liveUrl.protocol === 'https:' || liveUrl.protocol === 'http:') {
            const live = document.createElement('a');
            live.href = liveUrl.href;
            live.target = '_blank';
            live.rel = 'noopener noreferrer';
            live.textContent = 'Live project ↗';
            links.append(live);
          }
        } catch (_) {
          // Ignore invalid homepage URLs from repository metadata.
        }
      }

      card.append(title, description, meta, links);
      grid.append(card);
    });

    status.textContent = 'Showing ' + projects.length + ' public repositories, sorted by recent activity.';
  } catch (error) {
    status.textContent = 'GitHub projects could not be loaded right now. You can still browse all repositories on GitHub.';
  }
}

loadGitHubProjects();
