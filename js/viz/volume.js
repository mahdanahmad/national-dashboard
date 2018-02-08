const times			= ['daily', 'weekly', 'monthly'];
const timewdt		= 50;
const timehgt		= 20;
const axishgt		= 30;

const focus_id		= 'focus-wrapper';
const context_id	= 'context-wrapper';

let activeTime		= _.first(times);
// let focus_hgt		= 0;
// let context_hgt		= 0;

function createVolume() {
	d3.select(content_dest).selectAll("svg").remove();

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: timehgt, right: 50, bottom: 0, left: 50 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let focus_hgt		= (height * .85) - axishgt;
	let context_hgt		= (height * .15) - axishgt;

	let x				= {
		focus: d3.scaleTime().range([0, width]),
		context: d3.scaleTime().range([0, width]),
	};
	let y				= {
		focus: d3.scaleLinear().range([focus_hgt, 0]),
		context: d3.scaleLinear().range([context_hgt, 0]),
	};

	let parseDate 		= d3.timeParse("%Y-%m-%d");
	let areaFunc		= {
		focus: d3.area().curve(d3.curveMonotoneX).x((o) => (x.focus(o.data.date))).y0((o) => (y.focus(o[0]))).y1((o) => (y.focus(o[1]))),
		context: d3.area().curve(d3.curveMonotoneX).x((o) => (x.context(o.date))).y0(context_hgt).y1((o) => (y.context(o.val))),
	};

	// _.chain(['focus', 'context']).map((o) => ([o, d3.area().x((d, i) => (x[o](d.data.date))).y0((d) => (y[o](d[0]))).y1((d) => (y[o](d[1])))])).fromPairs().value();

	let svg = d3.select(content_dest).append("svg")
		.attr("id", volume_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	let timeGroup = svg.append('g').attr('id', 'times-wrapper')
		.attr('transform', 'translate(' + (width - (timewdt * times.length) - (timewdt / 2)) + ',' + (-timehgt) + ')')
		.selectAll('group-time')
		.data(times).enter().append('g')
			.attr('transform', (o, i) => ('translate(' + (i * timewdt) + ',0)'))
			.attr("class", (o, i) => ("group-time cursor-pointer" + (!i ? ' active' : '')));

	let brush = d3.brushX()
	    .extent([[0, 0], [width, context_hgt]])
	    .on("brush end", brushed);

	let zoom = d3.zoom()
	    .scaleExtent([1, 20])
	    .translateExtent([[0, 0], [width, focus_hgt]])
	    .extent([[0, 0], [width, height]])
	    .on("zoom", zoomed);

	svg.append("defs").append("clipPath")
		.attr("id", "clip")
	.append("rect")
		.attr("width", width)
		.attr("height", focus_hgt);

	timeGroup.append('rect')
		.attr('width', timewdt)
		.attr('height', timehgt)
		.attr('rx', 5)
		.attr('ry', 5);

	timeGroup.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', timewdt / 2)
		.attr('y', (timehgt + 6) / 2)
		.text((o) => (o));

	timeGroup.on('click', function(o) {
		if (activeTime !== o) {
			activeTime = o;

			svg.select('.group-time.active').classed('active', false);
			d3.select( this ).classed('active', true);
		}
	});

	let focus	= svg.append('g').attr('id', 'focus-wrapper')
		.attr('transform', 'translate(0,0)');

	let context	= svg.append('g').attr('id', 'context-wrapper')
		.attr('transform', 'translate(0,' + (focus_hgt + axishgt) + ')');

	getVizVolume(activeTime, (raw) => {
		let data	= raw.data.map((o) => (_.assign(o, { date: parseDate(o.date) })));
		let keys	= _.chain(data).first().pickBy(_.isInteger).keys().value();

		let maxVal	= _.chain(data).map((o) => (_.chain(o).filter(_.isInteger).sum().value())).max().multiply(1.1).value();

		x.focus.domain(d3.extent(data, (o) => (o.date)));
		y.focus.domain([0, maxVal]);
		x.context.domain(x.focus.domain());
		y.context.domain(y.focus.domain())

		focus.selectAll('.focus-area')
			.data(d3.stack().keys(keys)(data)).enter()
			.append('path')
				.attr('id', (o) => ('area-' + o.key))
				.attr('class', 'focus-area')
				.attr('d', areaFunc.focus)
				.style('fill', (o) => (raw.color[o.key]));

		focus.append("g")
			.attr("id", "focus-axis")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + focus_hgt + ")")
			.call(d3.axisBottom(x.focus));

		context.append('path')
			.datum(data.map((o) => ({ date: o.date , val: _.chain(o).filter(_.isInteger).sum().value()})))
			.attr('id', 'context-area')
			.attr('d', areaFunc.context)

		context.append("g")
			.attr("id", "context-axis")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + context_hgt + ")")
			.call(d3.axisBottom(x.context));

		context.append("g")
			.attr("class", "brush")
			.call(brush)
			.call(brush.move, x.focus.range());

		svg.append("rect")
			.attr("class", "zoom")
			.attr("width", width)
			.attr("height", focus_hgt)
			.attr("transform", "translate(0,0)")
			.call(zoom);
	});

	function brushed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		let s = d3.event.selection || x.context.range();
		x.focus.domain(s.map(x.context.invert, x.context));
		focus.selectAll(".focus-area").attr("d", areaFunc.focus);
		focus.select(".axis--x").call(d3.axisBottom(x.focus));
		svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
			.scale(width / (s[1] - s[0]))
			.translate(-s[0], 0));
		}

	function zoomed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		let t = d3.event.transform;
		x.focus.domain(t.rescaleX(x.context).domain());
		focus.selectAll(".focus-area").attr("d", areaFunc.focus);
		focus.select(".axis--x").call(d3.axisBottom(x.focus));
		context.select(".brush").call(brush.move, x.focus.range().map(t.invertX, t));
	}
}

// function createVolume() {
// 	let svg	= d3.select('svg#' + volume_id + ' > g');
//
// 	svg.selectAll('g#' + focus_id + ', g#' + context_id).remove();
//
// 	getVizVolume(activeTime, (data) => {
// 		console.log(data);
//
// 		svg.append('g').attr('id', 'focus-wrapper')
// 		.attr('transform', 'translate(0,0)');
// 	})
// }
