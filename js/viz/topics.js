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

	function createSunburst() {
		let bread_hgt	= 25;
		let radius		= Math.min(width / 2, height - (bread_hgt * 2)) / 2;

		let sunburst_cvs	= svg.append('g')
			.attr('id', 'sunburst-wrapper')
			.attr('transform', 'translate(' + width / 4 + ',' + ((height - (bread_hgt * 2)) / 2 + (bread_hgt * 2)) + ')');

		let partition	= d3.partition()
	        .size([2 * Math.PI, radius]);

		let arc = d3.arc()
	        .startAngle(function (d) { return d.x0 })
	        .endAngle(function (d) { return d.x1 })
	        .innerRadius(function (d) { return d.y0 })
	        .outerRadius(function (d) { return d.y1 });

		getVizTreemap((data) => {
			let root	= d3.hierarchy(data)
				.sum((o) => (o.size));
			partition(root);

			sunburst_cvs.selectAll('path')
				.data(root.descendants())
				.enter().append('path')
					// .attr("display", function (d) { return d.depth ? null : "none"; })
					.attr("d", arc)
					.attr('class', 'sliced')
					.style('fill', (o) => ( o.parent ? ( o.data.color || o.parent.data.color ) : 'transparent' ))
					.style("fill-rule", "evenodd");
		});
	}
}
