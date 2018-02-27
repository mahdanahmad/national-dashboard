let mappedGeoProv	= {};
let path;

let bar_canvas		= 'bar-wrapper';
let maps_canvas		= 'maps-wrapper';
let maps_ratio		= .75;
let bar_height		= 12.5;
let bar_width;

function createMap() {
	d3.select(content_dest).selectAll("svg").remove();

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let maps_width		= width * maps_ratio;
	bar_width			= width * (1 - maps_ratio);

	let projection		= d3.geoEquirectangular()
		.scale(maps_width + 175)
		.rotate([-120, 1])
		.translate([(maps_width / 2) + 35, (height / 2) - 50]);
	path	= d3.geoPath().projection(projection);

	let svg = d3.select(content_dest).append("svg")
		.attr("id", maps_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	let maps	= svg.append('g')
		.attr("id", maps_canvas)
		.attr("transform", "translate(" + bar_width + ",0)");

	maps.append('rect')
		.attr('id', 'background')
		.attr('width', maps_width)
		.attr('height', height)
		.on('click', () => { zoomProv(null) });

	let bar		= svg.append('g')
		.attr("id", bar_canvas)
		.attr("transform", "translate(0,0)");

	bar.append('rect')
		.attr('id', 'bar-background')
		.attr('width', bar_width)
		.attr('height', height);

	d3.queue()
		.defer(getVizMaps, null)
		.defer(d3.json, 'json/indonesia.json')
		.defer(d3.json, 'json/kabupaten.geojson')
		.await((err, data, prov, kabs) => {
			if (err) return console.error(err);

			let mappedColor	= _.chain(data).keyBy('id').mapValues('color').value();

			let states		= topojson.feature(prov, prov.objects.map);
			mappedGeoProv	= _.chain(states).get('features', []).keyBy('properties.id_provinsi').value();

			maps.selectAll('path.kabupaten')
				.data(kabs.features)
					.enter().append('path')
					.attr("id", (o) => ('kab-' + (o.properties.id_kabkota)))
					.attr('d', path)
					.attr('class', (o) => ('hidden kabupaten prov-' + o.properties.id_provinsi))
					.attr('vector-effect', 'non-scaling-stroke')
					.on('click', (o) => { zoomProv(parseInt(o.properties.id_provinsi)); })
					.on('mouseover', onMouseover)
					.on('mouseout', onMouseout)
					.on('mousemove', (o) => { hoverHandler(o.properties.id_kabkota, o.properties.nm_kabkota) });

			maps.selectAll("path.province")
			    .data(states.features)
			        .enter().append("path")
			        .attr("id", (o) => ('prov-' + (o.properties.id_provinsi)))
			        .attr("class", (o) => ("province cursor-pointer"))
			        .attr("d", path)
					.attr('vector-effect', 'non-scaling-stroke')
					.style("fill", (o) => (mappedColor[o.properties.id_provinsi] || defColor))
					.on("click", (o) => { zoomProv(o.properties.id_provinsi); })
					.on('mouseover', onMouseover)
					.on('mouseout', onMouseout)
					.on('mousemove', (o) => { hoverHandler(o.properties.id_provinsi, o.properties.nm_provinsi) });

			if (centered) { zoomProv(centered, true); }

			createBar(data);
		});
}

function onMouseover(o) { d3.select('#maps-tooltips').classed('hidden', false); }
function onMouseout(o) { d3.select('#maps-tooltips').classed('hidden', true); }
function hoverHandler(id, name) {
	let currentPos	= d3.mouse(d3.select("svg#" + maps_id + ' > g').node());
	let tooltips	= $( '#maps-tooltips' );

	tooltips.text(_.chain(name).lowerCase().startCase().value() + ': ' + (countessa[('' + id).length == 2 ? 'provinces' : 'regencies'][id] || 0));
	tooltips.css({ top: currentPos[1] - tooltips.outerHeight(true) - 13, left: currentPos[0] - (tooltips.outerWidth(true) / 2) });
}

function createBar(data) {
	let transition	= d3.transition()
        .duration(750)
        .ease(d3.easeLinear);

	let margin	= { top: 0, right: 25, bottom: 0, left: 125 };
	let svg		= d3.select("svg#" + maps_id + " g#" + bar_canvas);

	let height	= data.length * bar_height;
	let maxVal	= d3.max(data, (o) => (o.total));

	let x		= d3.scaleLinear().rangeRound([0, (bar_width - margin.left - margin.right)]).domain([0, maxVal]);

	svg.selectAll('g').remove();
	let groupBar	= svg.append('g')
		.attr('id', 'bar-container')
		.attr('transform', 'translate(' + margin.left + ',0)')
		.selectAll('.group-bar')
		.data(data).enter().append('g')
			.attr('id', (o) => ('bar-' + o.id))
			.attr('class', (o) => ('group-bar' + (o.id.length == 2 ? ' cursor-pointer' : '')))
			.attr('transform', (o, i) => ('translate(0,' + (i * bar_height) + ')'));

	groupBar.append('text')
		.attr('transform', 'translate(-5,' + (bar_height / 2) + ')')
		.attr('alignment-baseline', 'middle')
		.attr('text-anchor', 'end')
		.text((o) => (o.name));

	groupBar.append('rect')
		.attr('class', 'bar')
		.attr('x', 0)
		.attr('y', bar_height * .1)
		.attr('width', 0)
		.attr('height', bar_height * .9);

	groupBar.append('rect')
		.attr('class', 'overlay')
		.attr('x', -margin.left)
		.attr('y', 0)
		.attr('width', bar_width - margin.right)
		.attr('height', bar_height);

	groupBar
		.on('mouseover', function(o, i) {
			d3.select('#maps-tooltips').classed('hidden', false);

			let tooltips	= $( '#maps-tooltips' );
			tooltips.text(o.total);
			tooltips.css({ top: (i * bar_height) - tooltips.outerHeight(true) - 8, left: (margin.left + x(o.total)) - (tooltips.outerWidth(true) / 2) });
		})
		.on('mouseout', onMouseout)
		.on('click', (o) => { zoomProv(o.id.length == 2 ? o.id : null); })

	let avg_value	= _.chain(data).meanBy('total').round(2).value();
	let avg_wrapper	= svg.append('g')
		.attr('id', 'avg-wrapper')
		.attr('transform', 'translate(' + (margin.left) + ',0)');

	avg_wrapper.append('line')
		.attr('x1', x(avg_value))
		.attr('y1', -5)
		.attr('x2', x(avg_value))
		.attr('y2', 0);

	// avg_wrapper.append('text')
	// 	.attr('text-anchor', 'middle')
	// 	.attr('x', 0)
	// 	.attr('y', height + 17)
	// 	.text(avg_value);

	avg_wrapper.select('line').transition(transition)
		.attr('y2', height);

	avg_wrapper.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x).tickValues(_.chain(3).times((i) => (i / 2 * maxVal)).concat(avg_value).value()).tickFormat((o) => (nFormatter(o))));

	svg.selectAll('rect.bar').transition(transition)
		.attr('width', (o) => (x(o.total)));
}

function zoomProv(prov_id, intoodeep) {
	let svg	= d3.select("svg#" + maps_id + " g#" + maps_canvas);

	if (path && svg.node()) {
		let x, y, k;
		let node	= svg.node().getBBox();

		// Compute centroid of the selected path
		if (mappedGeoProv[prov_id] && (centered !== prov_id || intoodeep)) {
			let centroid 	= path.centroid(mappedGeoProv[prov_id]);
			let bounds		= path.bounds(mappedGeoProv[prov_id]);

			x = centroid[0];
			y = centroid[1];
			k = node.height * .7 / (bounds[1][1] - bounds[0][1]);

			d3.select('.province#prov-' + centered).classed('hidden', false);
			d3.selectAll('.kabupaten.prov-' + centered).classed('hidden', true);

			centered = prov_id;

			d3.select('.province#prov-' + prov_id).classed('hidden', true);
			d3.selectAll('.kabupaten.prov-' + prov_id).classed('hidden', false);

			d3.selectAll('.province:not(.prov-' + prov_id + ')').classed('unintended', true);

			getVizMaps(prov_id, (err, data) => {
				createBar(data);
				data.forEach((o) => {
					if (o.id) { d3.select('#kab-' + o.id).style('fill', (o.color || defColor)); }
				});
			});
		} else {
			x = node.width / 2;
			y = node.height / 2;
			k = 1;

			d3.select('.province#prov-' + (prov_id || centered)).classed('hidden', false);
			d3.selectAll('.kabupaten.prov-' + (prov_id || centered)).classed('hidden', true);

			if (centered) { getVizMaps(null, (err, data) => { createBar(data); }); }
			centered = null;

			d3.selectAll('.province').classed('unintended', false);
		}

		$( '#region > input' ).val($( '#region-' + (prov_id || 'def') ).text());
		getVizCategories((data) => { changeCateHeight(data); });

		createDropdownKab();

		svg.transition()
			.duration(750)
			.attr('transform', 'translate(' + bar_width + ',0)translate(' + node.width / 2 + ',' + node.height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
	}
}
