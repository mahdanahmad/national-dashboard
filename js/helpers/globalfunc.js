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

		let cliff	= (width || (text.attr('width') > 0 ? text.attr('width') : 0));
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > cliff) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
			}
		}
	});
}
