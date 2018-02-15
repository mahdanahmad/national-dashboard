const limit	= 10;
const vals	= ['keywords', 'topics'];

function createKeywords() {
	d3.select(content_dest).selectAll("svg").remove();

	let opened			= false;

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: 50, right: 50, bottom: 25, left: 50 };
	let width			= (canvasWidth / 2) - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let svg = d3.select(content_dest).append("svg")
		.attr("id", keywords_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g');

	let time		= 750;
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
			let y			= d3.scaleBand().range([height, 0]).domain(_.chain(data).map((o) => (o.key)).concat(_.times(limit - data.length, String)).reverse().value()).padding(0);

			canvas.append('text')
				.attr('class', 'keywords-title')
				.attr("alignment-baseline", "central")
				.attr('font-size', 20)
				.attr('x', 10)
				.attr('y', -(margin.top / 2))
				.text('Top ' + _.capitalize(key));

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
				.attr("y", y.bandwidth() * .05)
				.attr("height", y.bandwidth() * .9)
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

			groupBar
				.on('mouseover', (o) => {
					d3.select('#keywords-tooltips').classed('hidden', false);
					let tooltips	= $( '#keywords-tooltips' );

					tooltips.text(nFormatter(o.count));
					tooltips.css({
						top: margin.top + y(o.key) - tooltips.outerHeight(true) - 10,
						left: (opened ? 0 : _.indexOf(vals, key) * (canvasWidth / 2)) + margin.left + x(o.count) - (tooltips.outerWidth(true) / 2)
					});
				})
				.on('mouseout', () => { d3.select('#keywords-tooltips').classed('hidden', true); })
				.on('click', (o) => {
					opened		= true;
					let dest	= d3.select('svg#' + keywords_id);
					if (dest.node().getBoundingClientRect().width !== (canvasWidth / 2)) {
						if (_.indexOf(vals, key)) { dest.select('g').transition(transition).attr('transform', 'translate(-' + (canvasWidth / 2) + ',0)') }
						dest.transition(transition)
							.attr('width', width);

					}
				});

			canvas.selectAll('.group-bar > rect.bar').transition(transition)
		        .attr('width', (o) => (x(o.count)));

			eachCallback();
		}, (err) => {});
	});


}
