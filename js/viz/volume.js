const times		= ['daily', 'weekly', 'monthly'];
const timewdt	= 50;
const timehgt	= 20;

function createVolume() {
	d3.select(content_dest).selectAll("svg").remove();

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: timehgt, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

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
}
