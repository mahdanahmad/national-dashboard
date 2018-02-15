let textMargin	= 7;

function createCategories() {
	let canvasWidth		= $(cate_dest).outerWidth(true);
	let canvasHeight	= $(cate_dest).outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: (canvasHeight / 4), left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let x				= d3.scaleBand().rangeRound([0, width]).padding(0);
    let y 				= d3.scaleLinear().rangeRound([height, 0]);

	let svg = d3.select(cate_dest).append("svg")
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr('id', cate_id)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	getVizCategories((data) => {
		x.domain(data.map((d) => (d.name)));
		y.domain([0, _.chain(data).maxBy('count').get('count', 0).multiply(1).value()]);

		let nameToId	= _.chain(data).map((o) => ([o.name, o.id])).fromPairs().value();

		svg.append("g")
			.attr("class", "axis axis--x cursor-pointer")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x).tickSize(0))
			.selectAll(".tick text")
				.attr("id", (o) => ( 'text-' + nameToId[o] ))
				.attr("class", "text-on-category")
				.on('click', (o) => { onClickHandler(nameToId[o]); })
				.call(wrap, x.bandwidth());

		svg.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));

		svg.append("g")
			.attr("class", "grid")
			.attr("transform", "translate(" + (x.bandwidth() / 2) + ",0)")
			.call(d3.axisTop(x).tickSize(-height).tickFormat(""));

		let groupBar	= svg.append("g").attr("id", "categories").selectAll('group-bar')
			.data(data).enter().append('g')
				.attr('id', (o) => ('bar-' + o.id))
				.attr("class", "group-bar cursor-pointer");

		groupBar.append("rect")
			.attr("class", "bar fill")
			.attr("fill", (o) => (o.color || defColor))
			.attr("x", (o) => (x(o.name)))
			.attr("y", height)
			.attr("width", x.bandwidth())
			.attr("height", (o) => (0));

		groupBar.append("rect")
			.attr("class", "bar cream")
			.attr("fill", (o) => (o.color || defColor))
			.attr("x", (o) => (x(o.name)))
			.attr("y", height - 2)
			.attr("width", x.bandwidth())
			.attr("height", 2);

		groupBar.append('text')
	  		.attr('class', 'count-cate')
			.attr('text-anchor', 'middle')
			.attr("fill", "white")
	  		.attr('y', (height - textMargin))
	  		.attr('x', (o) => (x(o.name) + (x.bandwidth() / 2)))
	  		.text(0);

		groupBar.append("rect")
			.attr("class", "overlay")
			.attr("fill", "transparent")
			.attr("x", (o) => (x(o.name)))
			.attr("y", 0)
			.attr("width", x.bandwidth())
			.attr("height", height);

		groupBar.on('click', (o) => { onClickHandler(o.id); });

		changeCateHeight(data);
	});
}

function changeCateHeight(data) {
	let time		= 500;
	let transition	= d3.transition()
        .duration(time)
        .ease(d3.easeLinear);

	let canvas		= d3.select('g#' + cate_id + ' #categories');
	let height		= canvas.node().getBBox().height;

	let y			= d3.scaleLinear().rangeRound([height, 0]).domain([0, _.chain(data).maxBy('count').get('count', 0).multiply(1.25).value()]);
	let mapped		= _.chain(data).keyBy('id').mapValues((o) => ({ height: y(o.count) > height ? height : y(o.count), text: nFormatter(o.count) })).value();

	canvas.selectAll('.bar.fill').transition(transition)
        .attr('y', (o) => (mapped[o.id].height))
        .attr('height', (o) => (height - mapped[o.id].height));

	canvas.selectAll('.bar.cream').transition(transition)
        .attr('y', (o) => (mapped[o.id].height - 2));

	canvas.selectAll('.count-cate').transition(transition)
		.text((o) => (mapped[o.id].text))
		.attr('y', (o) => (mapped[o.id].height - textMargin));
}

let categoryTimeout	= null;
function onClickHandler(o) {
	let canvas		= d3.select('g#' + cate_id );
	let node		= canvas.select('g.group-bar#bar-' + o);

	node.classed('unintended', !node.classed('unintended'));
	canvas.select('text#text-' + o).classed('unintended', node.classed('unintended'));

	clearTimeout(categoryTimeout);
	categoryTimeout	= setTimeout(() => {
		activeCate	= canvas.selectAll('g.group-bar:not(.unintended)').nodes().map(function(o) { return parseInt(d3.select(o).attr('id').replace('bar-', '')); });

		refreshContent();
	}, awaitTime);
}
