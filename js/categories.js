function createCategories(monitor_id) {
	let canvasWidth		= $('#cate-container').outerWidth(true);
	let canvasHeight	= $('#cate-container').outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: (canvasHeight / 4), left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let x				= d3.scaleBand().rangeRound([0, width]).padding(0);
    let y 				= d3.scaleLinear().rangeRound([height, 0]);

	let svg = d3.select("#cate-container").append("svg")
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	$.get( "api/cat/" + monitor_id, ( data ) => {
		x.domain(data.result.map((d) => (d.name)));
		y.domain([0, _.chain(data.result).maxBy('count').get('count', 0).multiply(1.1).value()]);

		svg.append("g")
			.attr("class", "axis axis--x cursor-pointer")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x).tickSize(0))
			.selectAll(".tick text").call(wrap, x.bandwidth());

		svg.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));

		svg.append("g")
			.attr("class", "grid")
			.attr("transform", "translate(" + (x.bandwidth() / 2) + ",0)")
			.call(d3.axisTop(x).tickSize(-height).tickFormat(""));

		let groupBar	= svg.selectAll('group-bar').data(data.result).enter().append('g');

		groupBar.append("rect")
		      .attr("class", "bar fill cursor-pointer")
			  .attr("fill", (o) => (o.color || '#5a6569'))
		      .attr("x", (o) => (x(o.name)))
		      .attr("y", (o) => (y(o.count)))
		      .attr("width", x.bandwidth())
		      .attr("height", (o) => (height - y(o.count)));

		groupBar.append("rect")
		      .attr("class", "bar cream cursor-pointer")
			  .attr("fill", (o) => (o.color || '#5a6569'))
		      .attr("x", (o) => (x(o.name)))
		      .attr("y", (o) => (y(o.count)))
		      .attr("width", x.bandwidth())
		      .attr("height", 2);
	});
}

function wrap(text, width) {
	text.each(function() {
		let text	= d3.select(this);
		let words 	= text.text().split(/\s+/).reverse();
		let word;
		let line = [];
		let lineNumber = 0;
		let lineHeight = 1.1; // ems
		let y = "" + lineHeight;
		let dy = parseFloat(y);
		let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
}
