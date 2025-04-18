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

  // Apply the BASE_PATH logic only for relative URLs
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;  // Prepend BASE_PATH to relative URLs
  }

  // Log the final URL to the console for debugging
  console.log('Final URL:', url);
  
  let title = p.title;
  
  // Insert the anchor link into the nav
  nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}

