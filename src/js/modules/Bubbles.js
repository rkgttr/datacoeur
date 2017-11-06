const Bubbles = (data, color = '#FF5C6A') => {
  d3.select('.cloud').select('svg').remove();
  let svg = d3.select('.cloud').append('svg').attr('viewBox', '0 0 300 300'),
    width = 300,
    height = 300,
    bubbles = d3.pack().size([width, height]).padding(1.5),
    root = d3
      .hierarchy({ children: data })
      .sum(d => d.weight)
      .sort((a, b) => b.weight - a.weight);
  bubbles(root);

  let node = svg
    .selectAll('.node')
    .data(root.children)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  node.append('title').text(d => d.data.syntagme);

  node.append('circle').attr('r', d => d.r).style('fill', color);
  if (document.body.style.msTouchAction !== undefined) {
    node
      .append('text')
      .attr('dy', '.3em')
      .style('text-anchor', 'middle')
      .style('fill', color === '#FF5C6A' ? '#faf9f9' : '#C52C3E')
      .style('text-transform', 'uppercase')
      .style('font-size', '.5em')
      .text(d => d.data.syntagme.substring(0, d.r / 3));
  } else {
    node
      .append('foreignObject')
      .attr(
        'transform',
        d =>
          `translate(${-(2 * d.r * Math.cos(Math.PI * 0.25) * 0.5)},${-(
            2 *
            d.r *
            Math.cos(Math.PI * 0.25) *
            0.5
          )})`
      )
      .attr('width', d => 2 * d.r * Math.cos(Math.PI * 0.25))
      .attr('height', d => 2 * d.r * Math.cos(Math.PI * 0.25))
      .attr('color', color === '#FF5C6A' ? '#faf9f9' : '#C52C3E')
      .append('xhtml:p')
      .text(d => d.data.syntagme)
      .attr('class', 'bubble-label')
      .attr('style', d => `font-size: ${Math.max(0.3, 0.5 * (d.r / 60))}em`); // magic number
  }
};
export { Bubbles as default };
