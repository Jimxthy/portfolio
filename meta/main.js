import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    return data;
  }

  let data = await loadData();
  let commits = processCommits(data);
  
  function processCommits(data) {
    return d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
        });
  
        return ret;
      });
  }
  
  console.log(commits);

  function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const linesEdit = document.getElementById('commit-lines');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
    time.textContent = commit.datetime?.toLocaleTimeString('en', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    author.textContent = commit.author;
    linesEdit.textContent = commit.totalLines;
    
  }

  function renderCommitInfo(data, commits) {
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits').attr('class', 'stat-label');
    dl.append('dd').text(commits.length);
  
    // Add more stats as needed...
    const numberFiles = d3.group(data, d => d.file).size
    dl.append('dt').text('Number of Files').attr('class', 'stat-label');
    dl.append('dd').text(numberFiles);

    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file,
      );
    const averageFileLength = Math.round(d3.mean(fileLengths, (d) => d[1]));
    
    dl.append('dt').text('Average File Length');
    dl.append('dd').text(averageFileLength);

    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' }),
      );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    dl.append('dt').text('Most Activity');
    dl.append('dd').text(maxPeriod);

  }

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }
  

  function renderScatterPlot(data, commits) {
    // Put all the JS code of Steps inside this function
    const width = 900;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    let xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();
      
    let yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([3, 30]); // adjust these values based on your experimentation

    
    const dots = svg.append('g').attr('class', 'dots');

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);


    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .attr('r', (d) => rScale(d.totalLines))
        .style('fill-opacity', 0.7)
        .on('mouseenter', (event, commit) => {
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);

        })
        .on('mouseleave', () => {
            // TODO: Hide the tooltip
            updateTooltipVisibility(false);
        });

        
      
    
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
        };
          
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);
      
      // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

        // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

// Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

    
    function brushed(event) {
        const selection = event.selection;
        d3.selectAll('circle').classed('selected', (d) =>
          isCommitSelected(selection, d),
        );
        renderSelectionCount(selection);
        renderLanguageBreakdown(selection);

      }
      
    
      svg.call(d3.brush().on('start brush end', brushed));


      svg.selectAll('.dots, .overlay ~ *').raise();

      function renderSelectionCount(selection) {
        const selectedCommits = selection
          ? commits.filter((d) => isCommitSelected(selection, d))
          : [];
      
        const countElement = document.querySelector('#selection-count');
        countElement.textContent = `${
          selectedCommits.length || 'No'
        } commits selected`;
      
        return selectedCommits;
      }
      function renderLanguageBreakdown(selection) {
        const selectedCommits = selection
          ? commits.filter((d) => isCommitSelected(selection, d))
          : [];
        const container = document.getElementById('language-breakdown');
      
        if (selectedCommits.length === 0) {
          container.innerHTML = '';
          return;
        }
        const requiredCommits = selectedCommits.length ? selectedCommits : commits;
        const lines = requiredCommits.flatMap((d) => d.lines);
      
        // Use d3.rollup to count lines per language
        const breakdown = d3.rollup(
          lines,
          (v) => v.length,
          (d) => d.type,
        );
      
        // Update DOM with breakdown
        container.innerHTML = '';
      
        for (const [language, count] of breakdown) {
          const proportion = count / lines.length;
          const formatted = d3.format('.1~%')(proportion);
      
          container.innerHTML += `
                  <dt>${language}</dt>
                  <dd>${count} lines (${formatted})</dd>
              `;
        }
      }
      
      
      
      function isCommitSelected(selection, commit) {
        if (!selection) {
          return false;
        }
        // TODO: return true if commit is within brushSelection
        // and false if not
        const [x0, x1] = selection.map((d) => d[0]);
        const [y0, y1] = selection.map((d) => d[1]);
        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac); return x >= x0 && x <= x1 && y >= y0 && y <= y1;
      }


   }


  renderCommitInfo(data, commits);
  renderScatterPlot(data, commits);





  



  
  
  