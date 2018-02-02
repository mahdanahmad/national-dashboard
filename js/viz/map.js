let mappedGeoProv	= {};
let centered, path;

function createMap() {
	d3.select(content_dest).selectAll("svg").remove();

	let canvasWidth		= $(content_dest).outerWidth(true);
	let canvasHeight	= $(content_dest).outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let projection		= d3.geoEquirectangular()
		.scale(width + 225)
		.rotate([-120, 1])
		.translate([(width / 2) + 55, (height / 2) - 50]);
	path	= d3.geoPath().projection(projection);

	let svg = d3.select("#content-wrapper").append("svg")
		.attr("id", maps_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append('rect')
		.attr('id', 'background')
		.attr('width', width)
		.attr('height', height)
		.on('click', () => { zoomProv(null) });

	d3.queue()
		.defer(getVizMaps, null)
		.defer(d3.json, 'json/indonesia.json')
		.defer(d3.json, 'json/kabupaten.geojson')
		.await((err, data, prov, kabs) => {
			if (err) return console.error(err);

			let mappedColor	= _.chain(data).keyBy('id').mapValues('color').value();

			let states		= topojson.feature(prov, prov.objects.map);
			mappedGeoProv	= _.chain(states).get('features', []).keyBy('properties.id_provinsi').value();

			svg.selectAll('path.kabupaten')
				.data(kabs.features)
					.enter().append('path')
					.attr("id", (o) => ('kab-' + (o.properties.id_kabkota)))
					.attr('d', path)
					.attr('class', (o) => ('hidden kabupaten cursor-pointer prov-' + o.properties.id_provinsi))
					.attr('vector-effect', 'non-scaling-stroke')
					.on('click', (o) => { zoomProv(parseInt(o.properties.id_provinsi)); });

			svg.selectAll("path.province")
			    .data(states.features)
			        .enter().append("path")
			        .attr("id", (o) => ('prov-' + (o.properties.id_provinsi)))
			        .attr("class", (o) => ("province cursor-pointer"))
			        .attr("d", path)
					.attr('vector-effect', 'non-scaling-stroke')
					.style("fill", (o) => (mappedColor[o.properties.id_provinsi] || defColor))
					.on("click", (o) => { zoomProv(o.properties.id_provinsi); });
		});
}

function zoomProv(prov_id) {
	let svg	= d3.select("svg#maps-viz > g");

	if (path && svg.node()) {
		let x, y, k;
		let node	= svg.node().getBBox();

		// Compute centroid of the selected path
		if (mappedGeoProv[prov_id] && centered !== prov_id) {
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

			centered = null;

			d3.selectAll('.province').classed('unintended', false);
		}

		svg.transition()
			.duration(750)
			.attr('transform', 'translate(' + node.width / 2 + ',' + node.height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
	}
}
