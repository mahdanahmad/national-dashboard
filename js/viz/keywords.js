const limit	= 10;
const vals	= ['keywords', 'topics'];

function createKeywords() {
	d3.select(content_dest).selectAll("svg").remove();

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: 75, right: 50, bottom: 25, left: 50 };
	let width			= (canvasWidth / 2) - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let svg = d3.select("#content-wrapper").append("svg")
		.attr("id", keywords_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g');

	let time		= 500;
	let transition	= d3.transition()
        .duration(time)
        .ease(d3.easeLinear);

	getVizKeywords(limit, (raw) => {
		async.forEachOf(raw, (data, key, eachCallback) => {
			let maxCount	= d3.max(data, (o) => (o.count)) * 1.15;
			let maxStop		= Math.floor(maxCount / 100) * 100;
			let tickArray	= d3.range(0, maxStop + 1, (maxStop / 5));

			let canvas		= svg.append('g').attr('id', key + '-wrapper').attr("transform", "translate(" + ((_.indexOf(vals, key) * (canvasWidth / 2)) + margin.left) + "," + margin.top + ")");
			let x			= d3.scaleLinear().range([0, width]).domain([0, maxCount]);
			let y			= d3.scaleBand().range([height, 0]).domain(data.map((o) => (o.key)).reverse()).padding(0.1);

			canvas.append('g').attr('class', 'grid-wrapper').selectAll('.grid')
				.data(tickArray).enter()
				.append('line')
					.attr('class', 'grid')
					.attr('x1', (o) => (x(o)))
					.attr('x2', (o) => (x(o)))
					.attr('y1', 0)
					.attr('y2', height)

			canvas.append('g')
				.attr('class', 'x-axis axis ' + key + '-axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(d3.axisBottom(x).tickValues(tickArray).tickFormat((o) => (nFormatter(o))));

			let groupBar	= canvas.append('g').attr('class', 'bar-wrapper').selectAll('.group-bar')
				.data(data).enter()
				.append('g')
					.attr('transform', (o) => ('translate(0,' + y(o.key) + ')'))
					.attr('class', 'group-bar cursor-pointer');

			groupBar.append('rect')
				.attr('class', 'bar')
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", y.bandwidth())
				.attr("width", 0);

			groupBar.append('rect')
				.attr('class', 'overlay')
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", y.bandwidth())
				.attr("width", width);

			groupBar.append('text')
				.attr("alignment-baseline", "central")
				.attr("x", 10)
				.attr("y", y.bandwidth() / 2)
				.text((o) => (o.key));

			canvas.selectAll('.group-bar > rect.bar').transition(transition)
		        .attr('width', (o) => (x(o.count)));

			eachCallback();
		}, (err) => {});
	});


}
