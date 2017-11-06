const Bar = (data, color='#FF5C6A') => {
  d3.select('.graphs').append('div').attr('class', 'detail-graph');
  d3.select('.detail-graph:last-child').append('h4').text(data.title);
  d3.select('.detail-graph:last-child').append('div').attr('class', 'detail');
  let margins = { top: 20, right: 20, bottom: 90, left: 70 },
    width = 600 - margins.left - margins.right,
    height = 400 - margins.top - margins.bottom,
    x = d3.scaleBand().rangeRound([0, width], 0.05),
    y = d3.scaleLinear().range([height, 0]),
    xAxis = d3.axisBottom(x).tickFormat( d => d.length > 6 ? d.substring(0, 6) + '...' : d),
    yAxis = d3.axisLeft(y).ticks(4).tickFormat(d => d + '%'),
    svg = d3.select('.detail-graph:last-child .detail')
      .append('svg')
      .attr(
        'viewBox',
        `0 0 ${width + margins.left + margins.right} ${height +
          margins.top +
          margins.bottom}`
      )
      .append('g')
      .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  x.domain(data.values.map(d => d.label));
  y.domain([0, d3.max(data.values, d => d.value)]);

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '-.55em')
    .attr('transform', 'rotate(-90)');

  svg.append('g').attr('class', 'y axis').call(yAxis);

  // Add bar chart
  //

  svg
    .selectAll('.bars')
    .data(data.values)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .style('fill', color)
    .attr('x', d => x(d.label) + 2)
    .attr('width', x.bandwidth() - 4)
    .attr('y', d => y(d.value))
    .attr('height', d => height - y(d.value))
    .insert('title')
    .text(d => `${d.label} : ${d.value}%`);
};
export { Bar as default };
