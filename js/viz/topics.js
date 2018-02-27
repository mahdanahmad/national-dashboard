function createTopics() {
	d3.select(content_dest).selectAll("svg").remove();

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let svg = d3.select(content_dest).append("svg")
		.attr("id", topics_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	createSunburst();
	createbiPartite();

	function createSunburst() {
		let bread_hgt	= 25;
		let radius		= Math.min(width / 2, height) / 2;

		let sunburst_cvs	= svg.append('g')
			.attr('id', 'sunburst-wrapper')
			.attr('transform', 'translate(' + width / 4 + ',' + (height / 2) + ')');

		let partition	= d3.partition()
	        .size([2 * Math.PI, radius * radius]);
			// .value((o) => (1));

		let arc = d3.arc()
	        .startAngle((o) => (o.x0))
	        .endAngle((o) => (o.x1))
	        .innerRadius((o) => (Math.sqrt(o.y0)))
	        .outerRadius((o) => (Math.sqrt(o.y1)));

		getVizTreemap((data) => {
			let root	= d3.hierarchy(data)
				.sum((o) => (o.size));
			partition(root);

			let total			= root.value;
			let percent_font	= height / 15;
			let label_font		= percent_font / 3.5;

			let percent	= sunburst_cvs.append('text')
				.attr('transform', 'translate(0,-' + (percent_font * 4 / 6) + ')')
				.attr("alignment-baseline", "central")
				.attr('text-anchor', 'middle')
				.attr('font-size', percent_font);

			let label	= sunburst_cvs.append('text')
				.attr('transform', 'translate(0,-' + (percent_font * 1 / 6) + ')')
				.attr("alignment-baseline", "hanging")
				.attr('text-anchor', 'middle')
				.attr('font-size', label_font);

			let node1	= sunburst_cvs.append('text')
				.attr('transform', 'translate(0,' + (percent_font * 2 / 6) + ')')
				.attr("alignment-baseline", "hanging")
				.attr('text-anchor', 'middle')
				.attr('font-size', label_font * 5 / 4);

			let node2	= sunburst_cvs.append('text')
				.attr('transform', 'translate(0,' + ((percent_font * 2 / 6) + (label_font * 5 / 4)) + ')')
				.attr("alignment-baseline", "hanging")
				.attr('text-anchor', 'middle')
				.attr('font-size', label_font);


			sunburst_cvs.selectAll('path')
				.data(root.descendants())
				.enter().append('path')
					.attr("d", arc)
					.attr('class', (o) => ('sliced' + (o.depth ? ' cursor-pointer' : '')))
					.style('fill', (o) => ( o.parent ? ( o.data.color || o.parent.data.color ) : 'transparent' ))
					.style("fill-rule", "evenodd")
					.on('mouseover', function(o) {
						if (o.depth) {
							percent.text(_.round(o.value / total * 100, 2) + '%');
							label.text(o.value + ' / ' + total);

							if (o.height) {
								node1.text(o.data.name);
							} else {
								node1.text(o.parent.data.name);
								node2.text(o.data.name).call(wrap, width / 6);
							}

							sunburst_cvs.selectAll('path.sliced').style("opacity", 0.2);
							sunburst_cvs.selectAll('path.sliced').filter((d) => (_.includes(o.ancestors(), d))).style('opacity', 1);
						}
					})
					.on('mouseout', function(o) { sunburst_cvs.selectAll('text').text(''); sunburst_cvs.selectAll('path').style("opacity", 1); });
		});
	}

	function createbiPartite() {
		let bipartite_cvs	= svg.append('g')
			.attr('id', 'bipartite-wrapper')
			.attr('transform', 'translate(' + width * 5 / 8 + ',' + (height / 64) + ')');

		let barSize		= 35;
		let label_size	= height / 52.5;
		getVizBipartite((data) => {
			let bipartite_func	= viz.biPartite()
				.edgeOpacity(.9)
				.height(height * 31 / 32)
				.width(width / 4)
				.data(data.data)
				.fill((o) => (data.color[o.primary]))
				.barSize(barSize)
				.min(label_size * 1.5);

			bipartite_cvs.call(bipartite_func);

			bipartite_cvs.selectAll('.viz-biPartite-mainBar').append('text')
				.attr("x", (o) => ((o.part == 'primary'? -1 : 1) * barSize))
				.attr('class', 'label percent cursor-default')
				.attr("alignment-baseline", "central")
				.attr('text-anchor', (o) => (o.part == 'primary' ? 'end' : 'start'))
				.attr('font-size', label_size)
				.text((o) => (d3.format(".1%")(o.percent)));

			bipartite_cvs.selectAll('.viz-biPartite-mainBar').append('text')
				.attr("x", (o) => ((o.part == 'primary'? -1 : 1) * (barSize + 30)))
				.attr('class', 'label name cursor-default')
				.attr("alignment-baseline", "central")
				.attr('text-anchor', (o) => (o.part == 'primary' ? 'end' : 'start'))
				.attr('font-size', label_size)
				.text((o) => (o.key)).call(wrapEllipsis, width / 14);

			bipartite_cvs.selectAll('.viz-biPartite-mainBar').append('rect')
				.attr('class', 'overlay')
				.attr('x', (o) => (o.part == 'primary' ? -(width / 8) : 0 ))
				.attr('y', (o) => -(o.height))
				.attr('height', (o) => (o.height * 2))
				.attr('width', width / 8)
				.attr('fill', 'transparent');

			bipartite_cvs.selectAll('.viz-biPartite-mainBar')
				.on('mouseover', function(d) {
					bipartite_func.mouseover(d);
					bipartite_cvs.selectAll(".viz-biPartite-mainBar").select(".percent").text((o) => (d3.format(".1%")(o.percent)));
					bipartite_cvs.selectAll(".viz-biPartite-mainBar").select(".overlay")
						.attr('y', (o) => -(o.height))
						.attr('height', (o) => (o.height * 2));
				})
				.on('mouseout', function(d) {
					bipartite_func.mouseout(d);
					bipartite_cvs.selectAll(".viz-biPartite-mainBar").select(".percent").text((o) => (d3.format(".1%")(o.percent)));
					bipartite_cvs.selectAll(".viz-biPartite-mainBar").select(".overlay")
						.attr('y', (o) => -(o.height))
						.attr('height', (o) => (o.height * 2));
				});


		});
	}

}
