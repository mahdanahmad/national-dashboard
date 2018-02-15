function createTreemap() {
	d3.select(content_dest).selectAll("svg").remove();

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: 0, right: 50, bottom: 0, left: 50 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let svg = d3.select(content_dest).append("svg")
		.attr("id", treemap_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	let treemap = d3.treemap()
		.tile(d3.treemapResquarify)
		.size([width, height])
		.round(true)
		.paddingInner(1);

	getVizTreemap((data) => {
		if (!_.isEmpty(data.children)) {
			let root	= d3.hierarchy(data)
				.eachBefore((o) => { o.data.id = _.kebabCase((o.parent ? o.parent.data.name + " " : "") + o.data.name); })
				.sum((o) => (o.size))
				.sort((a, b) => (b.height - a.height || b.value - a.value));

			treemap(root);

			let cell = svg.selectAll("g")
				.data(root.leaves())
				.enter().append("g")
					.attr("transform", (o) => ("translate(" + o.x0 + "," + o.y0 + ")"));

			cell.append("rect")
		        // .attr("id", (o) => (o.data.id))
		        .attr("width", (o) => (o.x1 - o.x0))
		        .attr("height", (o) => (o.y1 - o.y0))
		        .attr("fill", (o) => (o.parent.data.color));

			cell.append("rect")
				.attr("id", (o) => (o.data.id))
				.attr("class", "text-wrapper")
				.attr("width", (o) => (o.x1 - o.x0 - 10 > 0 ? o.x1 - o.x0 - 10 : 0))
				.attr("height", (o) => (o.y1 - o.y0 - 10 > 0 ? o.y1 - o.y0 - 10 : 0))
				// .attr('transform', 'translate(5,5)')
				.attr("fill", 'transparent');

			cell.append("clipPath")
				.attr("id", (o) => ("clip-" + o.data.id))
				.append("use")
					.attr("xlink:href", (o) => ("#" + o.data.id));

			cell.append("text")
				.attr("clip-path", (o) => ("url(#clip-" + o.data.id + ")"))
				.attr('transform', 'translate(5,5)')
				.attr('class', 'cursor-default')
				.attr('width', (o) => (o.x1 - o.x0 - 10))
				.text((o) => (o.data.name))
				.call(wrap);

			cell.append("title")
		        .text((o) => (o.data.name + ' - ' + o.parent.data.name + "\n" + o.value));
		}
	})
}
