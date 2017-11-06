import Publisher from 'rkgttr-publisher';

const RadarChart = (id, data, options = {}) => {
  let cfg = Object.assign(
      {},
      {
        w: 600,
        h: 600,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        levels: 3,
        maxValue: 0,
        labelFactor: 1.25,
        wrapWidth: 60,
        opacityArea: 1,
        dotRadius: 12,
        opacityCircles: 0.05,
        strokeWidth: 2,
        roundStrokes: false,
        legend: [],
        color: d3.scaleOrdinal().range(['#FF5C6A', '#F1FE8B', '#79efdc'])
      },
      options
    ),
    maxValue = Math.max(
      cfg.maxValue,
      d3.max(data, i => d3.max(i.map(o => o.value)))
    ),
    allAxis = data[0].map((i, j) => i.axis),
    total = allAxis.length,
    radius = Math.min(cfg.w / 2, cfg.h / 2),
    Format = d3.format('.0%'),
    angleSlice = Math.PI * 2 / total,
    rScale = d3.scaleLinear().range([30, radius]).domain([0, maxValue]);

  /////////////////////////////////////////////////////////
  //////////// Create the container SVG and g /////////////
  /////////////////////////////////////////////////////////

  //Remove whatever chart with the same id/class was present before
  d3.select(id).select('svg').remove();

  //Initiate the radar chart SVG
  let svg = d3
    .select(id)
    .append('svg')
    .attr(
      'viewBox',
      `0 0 ${cfg.w + cfg.margin.left + cfg.margin.right} ${cfg.h +
        cfg.margin.top +
        cfg.margin.bottom}`
    )
    .attr('class', 'radar' + id);
  //Append a g element
  let g = svg
    .append('g')
    .attr(
      'transform',
      'translate(' +
        (cfg.w / 2 + cfg.margin.left) +
        ',' +
        (cfg.h / 2 + cfg.margin.top) +
        ')'
    );

  /////////////////////////////////////////////////////////
  ////////// Glow filter for some extra pizzazz ///////////
  /////////////////////////////////////////////////////////

  //Filter for the outside glow
  let filter = g.append('defs').append('filter').attr('id', 'glow'),
    feGaussianBlur = filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur'),
    feMerge = filter.append('feMerge'),
    feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
    feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  /////////////////////////////////////////////////////////
  /////////////// Draw the Circular grid //////////////////
  /////////////////////////////////////////////////////////

  //Wrapper for the grid & axes
  let axisGrid = g.append('g').attr('class', 'axisWrapper');

  //Draw the background circles
  axisGrid
    .selectAll('.levels')
    .data(d3.range(1, cfg.levels + 1).reverse())
    .enter()
    .append('circle')
    .attr('class', 'gridCircle')
    .attr('r', function(d, i) {
      return radius / cfg.levels * d;
    })
    .style('fill', '#faf9f9')
    .style('stroke', '#faf9f9')
    .style('fill-opacity', cfg.opacityCircles)
    .style('stroke-opacity', '0.6')
    .style('filter', 'url(#glow)');

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////

  //Create the straight lines radiating outward from the center
  let axis = axisGrid
    .selectAll('.axis')
    .data(allAxis)
    .enter()
    .append('g')
    .attr('class', 'axis');
  //Append the lines
  axis
    .append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr(
      'x2',
      (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      'y2',
      (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2)
    )
    .attr('class', 'line')
    .style('stroke', 'white');

  //Append the labels at each axis
  axis
    .append('text')
    .attr('class', 'legend')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr(
      'x',
      (d, i) =>
        rScale(maxValue * cfg.labelFactor) *
        Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      'y',
      (d, i) =>
        rScale(maxValue * cfg.labelFactor) *
        Math.sin(angleSlice * i - Math.PI / 2)
    )
    .text(d => d)
    .call(wrap, cfg.wrapWidth);

  /////////////////////////////////////////////////////////
  ///////////// Draw the radar chart blobs ////////////////
  /////////////////////////////////////////////////////////

  //The radial line function
  let radarLine = d3
    .lineRadial()
    .curve(d3.curveLinearClosed)
    .radius(d => rScale(d.value))
    .angle((d, i) => i * angleSlice);

  if (cfg.roundStrokes) {
    radarLine.curve(d3.curveCatmullRomClosed);
  }

  //Create a wrapper for the blobs
  let blobWrapper = g
    .selectAll('.radarWrapper')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'radarWrapper')
    .style('fill', (d, i) => cfg.color(i));

  //Append the backgrounds
  blobWrapper
    .append('path')
    .attr('class', 'radarArea')
    .attr('d', (d, i) => radarLine(d))
    .style('fill', (d, i) => cfg.color(i))
    .style('fill-opacity', cfg.opacityArea)
    .style('stroke', (d, i) => cfg.color(i))
    .style('filter', 'url(#glow)');

  //Append the circles
  blobWrapper
    .selectAll('.radarCircle')
    .data((d, i) => d)
    .enter()
    .append('circle')
    .attr('class', 'radarCircle')
    .attr('r', cfg.dotRadius)
    .attr(
      'cx',
      (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      'cy',
      (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
    )
    .style(cfg.legend.length ? 'color':'fill', (d, i, j) => cfg.color(j));

  /////////////////////////////////////////////////////////
  //////// Append invisible circles for tooltip ///////////
  /////////////////////////////////////////////////////////

  //Wrapper for the invisible circles on top
  let blobCircleWrapper = g
    .selectAll('.radarCircleWrapper')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'radarCircleWrapper')
    .attr('data-brand', (d, i) => i);

  //Append a set of invisible circles on top for the mouseover pop-up
  blobCircleWrapper
    .selectAll('.radarInvisibleCircle')
    .data((d, i) => d)
    .enter()
    .append('circle')
    .attr('class', 'radarInvisibleCircle')
    .attr('r', cfg.dotRadius)
    .attr(
      'cx',
      (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      'cy',
      (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
    )
    .style(cfg.legend.length ? 'color':'fill', (d, i, j) => cfg.color(j))
    .style('fill-opacity', 0)
    .style('pointer-events', 'all')
    .on('click', function(d, i) {
      let brand, color;
      if(cfg.legend.length) {
        brand = cfg.legend[this.parentNode.getAttribute('data-brand')]+' : ';
        color = cfg.color(this.parentNode.getAttribute('data-brand'))
      }
      Publisher.trigger('show-details', d, brand, color);
      // let newX = parseFloat(select(this).attr('cx')) - 10,
      //   newY = parseFloat(select(this).attr('cy')) - 10;
      //
      // tooltip
      //   .attr('x', newX)
      //   .attr('y', newY)
      //   .text(Format(d.value))
      //   .transition()
      //   .duration(200)
      //   .style('opacity', 1);
    })
    .on('mouseout', function() {
      // tooltip.transition().duration(200).style('opacity', 0);
    });
  if (cfg.legend.length > 0) {
    let legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('height', 100)
      .attr('width', 200)
      .attr('transform', 'translate(90,20)');
    //Create colour squares
    legend
      .selectAll('rect')
      .data(cfg.legend)
      .enter()
      .append('rect')
      .attr('x', cfg.w - 65)
      .attr('y', (d, i) => i * 20)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => cfg.color(i));
    //Create text next to squares
    legend
      .selectAll('text')
      .data(cfg.legend)
      .enter()
      .append('text')
      .attr('x', cfg.w - 52)
      .attr('y', (d, i) => i * 20 + 9)
      .attr('font-size', '1em')
      .attr('fill', '#faf9f9')
      .text(d => d);
  }

  /////////////////////////////////////////////////////////
  /////////////////// Helper Function /////////////////////
  /////////////////////////////////////////////////////////

  //Taken from http://bl.ocks.org/mbostock/7555321
  //Wraps SVG text
  function wrap(text, width) {
    text.each(function() {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4, // ems
        y = text.attr('y'),
        x = text.attr('x'),
        dy = parseFloat(text.attr('dy')),
        tspan = text
          .text(null)
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', dy + 'em');

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    });
  } //wrap
}; //RadarChart

export { RadarChart as default };
