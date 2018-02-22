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

function wrapEllipsis(text, width) {
	text.each(function() {
		let text		= d3.select(this);
		let words		= text.text();
		let currWidth	= text.node().getComputedTextLength();

		if (currWidth > width) {
			text.text(words.substring(0, Math.floor(width * words.length / currWidth)) + '...');
		}
	})
}

function nFormatter(num) {
	let digits	= 2;
	let standar = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "ribu" },
		{ value: 1E6, symbol: "juta" },
		{ value: 1E9, symbol: "milyar" },
		{ value: 1E12, symbol: "triliun" },
		{ value: 1E15, symbol: "kuadriliun" },
		{ value: 1E18, symbol: "kuantiliun" }
	];
	let re = /\.0+$|(\.[0-9]*[1-9])0+$/;
	let i;
	for (i = standar.length - 1; i > 0; i--) { if (num >= standar[i].value) { break; } }
	return (num / standar[i].value).toFixed(digits).replace(re, "$1") + ' ' + standar[i].symbol;
}

String.prototype.titlecase	= function() { return this.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()); }
