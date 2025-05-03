import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

console.log(projects);

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let colors = d3.scaleOrdinal(d3.schemeTableau10);

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
  );
let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});
  


let sliceGenerator = d3.pie().value((d) => d.value);

let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));



arcs.forEach((arc, idx) => {
    // TODO, fill in step for appending path to svg using D3
    d3.select('svg').append('path').attr('d', arc).attr('fill', colors(idx));
  });


let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

let query = '';
let searchInput = document.querySelector('.searchBar');

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
    // re-calculate rolled data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
      return {value: count, label: year }; // TODO
    });
    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map(d => arcGenerator(d));
    // TODO: clear up paths and legends
    d3.select("svg").selectAll("path").remove();
    d3.select(".legend").selectAll("li").remove();
    // update paths and legends, refer to steps 1.4 and 2.2
    newArcs.forEach((newArc, idx) => {
        d3.select('svg')
        .append("path")
        .attr('d', newArc)
        .attr('fill', colors(idx));
    })
    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
    legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    });

  }
  
  // Call this function on page load
  renderPieChart(projects);
  
searchInput.addEventListener('change', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects)
});

let selectedIndex = -1;
let svg = d3.select('svg');
svg.selectAll('path').remove();

// Render pie slices with click behavior
arcs.forEach((arc, i) => {
  svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .on('click', () => {
      // Toggle selected index
      selectedIndex = selectedIndex === i ? -1 : i;

      // Update slice classes
      svg
        .selectAll('path')
        .attr('class', (_, idx) => {
            if (selectedIndex === -1) return '';       
            if (selectedIndex === idx) return 'selected'; 
            return 'unselected';        
          });
          

      // Update legend classes
      d3.select('.legend')
        .selectAll('li')
        .attr('class', (_, idx) => {
            if (selectedIndex === -1) return ''; 
            if (selectedIndex === idx) return 'selected';
            return 'unselected';
          });
          

      // Update project list
      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        let selectedYear = data[selectedIndex].label;
        let filtered = projects.filter((p) => String(p.year) === selectedYear);
        renderProjects(filtered, projectsContainer, 'h2');
      }
    });
});



  

  
  