/* =========================================================
   CIDIA — MAIN JAVASCRIPT
   =========================================================
   01. Mobile navigation
   02. Utilities
   03. JSON loader
   04. Statistics
   05. Projects
   06. Publications
   07. Featured people
   08. Community directory
   09. Home initialization
   ========================================================= */


/* =========================================================
   01. MOBILE NAVIGATION
   ========================================================= */

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');

    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '×' : '☰';
  });

  document.addEventListener('click', event => {
    const isMobile = window.innerWidth <= 900;
    const isOpen = sidebar.classList.contains('open');
    const clickedOutside = !sidebar.contains(event.target);
    const clickedMenuButton = event.target === menuToggle;

    if (isMobile && isOpen && clickedOutside && !clickedMenuButton) {
      sidebar.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    }
  });
}


/* =========================================================
   02. UTILITIES
   ========================================================= */

/**
 * Escapes HTML characters before inserting external
 * JSON content into the page.
 */
function safe(value = '') {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}


/**
 * Generates initials when a person has no image.
 *
 * Example:
 * "Juan Camilo Zapata" → "JC"
 */
function getInitials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
}


/**
 * Converts the internal status value into a visible label.
 */
function getStatusLabel(status = 'active') {
  const normalized = String(status).toLowerCase();

  const labels = {
    active: 'Activo',
    inactive: 'Inactivo',
    alumni: 'Egresado',
    external: 'Externo'
  };

  return labels[normalized] || status;
}


/* =========================================================
   03. JSON LOADER
   ========================================================= */

async function loadJSON(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`No fue posible cargar ${path}`);
  }

  return response.json();
}


/* =========================================================
   04. STATISTICS
   ========================================================= */

function renderStatistics(projects, publications, people) {
  const statProjects = document.getElementById('statProjects');
  const statPublications = document.getElementById('statPublications');
  const statPeople = document.getElementById('statPeople');

  if (statProjects) {
    statProjects.textContent = projects.length;
  }

  if (statPublications) {
    statPublications.textContent = publications.length;
  }

  if (statPeople) {
    statPeople.textContent = people.length;
  }
}


/* =========================================================
   05. PROJECTS
   ========================================================= */

function renderProjects(projects) {
  const projectGrid = document.getElementById('projectGrid');

  if (!projectGrid) return;

  if (!projects.length) {
    projectGrid.innerHTML = `
      <p class="loading">
        No hay proyectos registrados actualmente.
      </p>
    `;
    return;
  }

  projectGrid.innerHTML = projects
    .slice(0, 6)
    .map((project, index) => {

      /*
       * Compatibility with the original project structure.
       * Existing .html project links are redirected to the
       * Markdown-based project page.
       */
      let target = '#';

      if (project.url && project.url !== '#') {
        target = project.url.endsWith('.html')
          ? 'page.html?content=projects/computer-vision-industrial'
          : project.url;
      }

      return `
        <a
          class="project-card"
          href="${safe(target)}">

          <span class="project-index">
            ${String(index + 1).padStart(2, '0')}
          </span>

          <small>
            ${safe(project.area || 'INVESTIGACIÓN')}
          </small>

          <h3>
            ${safe(project.title || 'Proyecto CIDIA')}
          </h3>

          <p>
            ${safe(project.description || '')}
          </p>

          <b>Ver proyecto ↗</b>

        </a>
      `;
    })
    .join('');
}


/* =========================================================
   06. PUBLICATIONS
   ========================================================= */

function renderPublications(publications) {
  const publicationList = document.getElementById('publicationList');

  if (!publicationList) return;

  if (!publications.length) {
    publicationList.innerHTML = `
      <p class="loading">
        No hay publicaciones registradas actualmente.
      </p>
    `;
    return;
  }

  publicationList.innerHTML = publications
    .slice(0, 6)
    .map(publication => `
      <article class="publication-row">

        <strong>
          ${safe(publication.year || '')}
        </strong>

        <div>
          <h3>
            ${safe(publication.title || '')}
          </h3>

          <p>
            ${safe(publication.authors || '')}
            ${publication.venue ? ` · ${safe(publication.venue)}` : ''}
          </p>
        </div>

        <span>↗</span>

      </article>
    `)
    .join('');
}


/* =========================================================
   07. FEATURED PEOPLE
   =========================================================
   People with:
   "featured": true

   are displayed as the large cards with photographs.
   ========================================================= */

function renderFeaturedPeople(people) {
  const peopleGrid = document.getElementById('peopleGrid');

  if (!peopleGrid) return;

  const featuredPeople = people
    .filter(person => person.featured === true)
    .slice(0, 5);

  if (!featuredPeople.length) {
    peopleGrid.innerHTML = `
      <p class="loading">
        No hay integrantes destacados actualmente.
      </p>
    `;
    return;
  }

  peopleGrid.innerHTML = featuredPeople
    .map(person => {

      const image = person.image
        ? `
          <img
            src="${safe(person.image)}"
            alt="${safe(person.name)}">
        `
        : `
          <span>
            ${safe(getInitials(person.name))}
          </span>
        `;

      /*
       * Supports both "type" and "role" because the
       * original people.json used "type".
       */
      const cardType = person.type || person.role || 'Investigador';

      const details = [
        person.role,
        person.area
      ]
        .filter(Boolean)
        .join(' · ');

      return `
        <article class="person-card">

          <div class="person-image">
            ${image}
          </div>

          <small>
            ${safe(cardType)}
          </small>

          <h3>
            ${safe(person.name)}
          </h3>

          <p>
            ${safe(details)}
          </p>

        </article>
      `;
    })
    .join('');
}


/* =========================================================
   08. COMMUNITY DIRECTORY
   =========================================================
   People with:
   "featured": false

   are displayed in the compact member directory.
   ========================================================= */

function renderCommunityDirectory(people) {
  const communityMembers = document.getElementById('communityMembers');
  const communityCount = document.getElementById('communityCount');

  if (!communityMembers) return;

  const otherPeople = people.filter(person => person.featured !== true);

  /* Member counter */

  if (communityCount) {
    const label = otherPeople.length === 1
      ? 'MIEMBRO'
      : 'MIEMBROS';

    communityCount.textContent =
      `${String(otherPeople.length).padStart(2, '0')} ${label}`;
  }


  /* Empty directory */

  if (!otherPeople.length) {
    communityMembers.innerHTML = `
      <p class="loading">
        No hay otros integrantes registrados actualmente.
      </p>
    `;
    return;
  }


  /* Member rows */

  communityMembers.innerHTML = otherPeople
    .map((person, index) => {

      const role = person.role || person.type || 'Integrante';
      const area = person.area || 'CIDIA';
      const status = getStatusLabel(person.status || 'active');

      return `
        <div class="community-member">

          <span class="member-number">
            ${String(index + 1).padStart(2, '0')}
          </span>

          <strong class="member-name">
            ${safe(person.name)}
          </strong>

          <span class="member-role">
            ${safe(role)}
          </span>

          <span class="member-area">
            ${safe(area)}
          </span>

          <span class="member-status">
            <i></i>
            ${safe(status)}
          </span>

        </div>
      `;
    })
    .join('');
}


/* =========================================================
   09. HOME INITIALIZATION
   ========================================================= */

async function populateHome() {

  /*
   * If projectGrid does not exist, we are not on index.html.
   * This prevents the script from unnecessarily loading data
   * on other pages.
   */
  if (!document.getElementById('projectGrid')) {
    return;
  }

  try {

    /* Load all home data in parallel */

    const [
      projects,
      publications,
      people
    ] = await Promise.all([
      loadJSON('data/projects.json'),
      loadJSON('data/publications.json'),
      loadJSON('data/people.json')
    ]);


    /* Render each section */

    renderStatistics(
      projects,
      publications,
      people
    );

    renderProjects(projects);

    renderPublications(publications);

    renderFeaturedPeople(people);

    renderCommunityDirectory(people);

  } catch (error) {

    console.error(
      'CIDIA — Error cargando datos:',
      error
    );

    document
      .querySelectorAll('.loading')
      .forEach(element => {
        element.textContent =
          'No fue posible cargar los datos. Abre el sitio desde un servidor local o GitHub Pages.';
      });

  }
}


/* =========================================================
   START
   ========================================================= */

populateHome();