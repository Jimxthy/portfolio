console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$("nav a")

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
//   );

//   currentLink.classList.add('current');
  
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: "https://github.com/Jimxthy", title: 'Github' },
  { url: "resume/", title: 'Resume' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;

  
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;  
  }

  console.log('Final URL:', url);
  
  let title = p.title;
  
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.append(a)
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select id="color-scheme-select">
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    `
  );
  
  const select = document.querySelector('#color-scheme-select');


const savedColorScheme = localStorage.colorScheme;


if (savedColorScheme) {
  document.documentElement.style.setProperty('color-scheme', savedColorScheme);
  select.value = savedColorScheme;  
} else {
 
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.style.setProperty('color-scheme', prefersDark ? 'dark' : 'light');
  select.value = prefersDark ? 'dark' : 'light';  
}

select.addEventListener('input', function (event) {
  const scheme = event.target.value;
  document.documentElement.style.setProperty('color-scheme', scheme);

  localStorage.colorScheme = scheme;
});

