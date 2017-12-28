let mappedGeoProv	= {};
let centered, path;

const defMapColor	= '#5a6569';

function createMap(monitor_id) {
	d3.select("#content-wrapper").selectAll("svg").remove();

	let canvasWidth		= $('#content-wrapper').outerWidth(true);
	let canvasHeight	= $('#content-wrapper').outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let projection		= d3.geoEquirectangular()
		.scale(width + 225)
		.rotate([-120, 1])
		.translate([(width / 2) + 55, (height / 2) - 50]);
	path	= d3.geoPath().projection(projection);

	let svg = d3.select("#cate-container").append("svg")
		.attr("id", "maps-viz")
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append('rect')
		.attr('id', 'background')
		.attr('width', width)
		.attr('height', height)
		.on('click', () => { zoomProv(null, monitor_id) });

	d3.queue()
		.defer(d3.json, 'api/map/' + monitor_id)
		.defer(d3.json, 'json/indonesia.json')
		.defer(d3.json, 'json/kabupaten.geojson')
		.await((err, data, prov, kabs) => {
			if (err) return console.error(err);

			let mappedColor	= _.chain(data.result).keyBy('province_id').mapValues('color').value();

			let states		= topojson.feature(prov, prov.objects.map);
			mappedGeoProv	= _.chain(states).get('features', []).keyBy('properties.id_provinsi').value();

			svg.selectAll('path.kabupaten')
				.data(kabs.features)
					.enter().append('path')
					.attr("id", (o) => ('kab-' + (o.properties.id_kabkota)))
					.attr('d', path)
					.attr('class', (o) => ('hidden kabupaten cursor-pointer prov-' + o.properties.id_provinsi))
					.attr('vector-effect', 'non-scaling-stroke')
					.on('click', (o) => { zoomProv(parseInt(o.properties.id_provinsi, monitor_id)); });

			svg.selectAll("path.province")
			    .data(states.features)
			        .enter().append("path")
			        .attr("id", (o) => ('prov-' + (o.properties.id_provinsi)))
			        .attr("class", (o) => ("province cursor-pointer"))
			        .attr("d", path)
					.attr('vector-effect', 'non-scaling-stroke')
					.style("fill", (o) => (mappedColor[o.properties.id_provinsi] || defMapColor))
					.on("click", (o) => { zoomProv(o.properties.id_provinsi, monitor_id); });
		});
}

function zoomProv(prov_id, monitor_id) {
	let svg	= d3.select("svg#maps-viz > g");

	if (path && svg.node()) {
		let x, y, k;
		let node	= svg.node().getBBox();

		// Compute centroid of the selected path
		if (mappedGeoProv[prov_id] && centered !== prov_id) {
			let centroid = path.centroid(mappedGeoProv[prov_id]);
			x = centroid[0];
			y = centroid[1];
			k = 4;

			d3.select('.province#prov-' + centered).classed('hidden', false);
			d3.selectAll('.kabupaten.prov-' + centered).classed('hidden', true);

			centered = prov_id;

			d3.select('.province#prov-' + prov_id).classed('hidden', true);
			d3.selectAll('.kabupaten.prov-' + prov_id).classed('hidden', false);

			d3.selectAll('.province:not(.prov-' + prov_id + ')').classed('unintended', true);

			$.get( "api/map/" + monitor_id + '/' + prov_id, ( data ) => {
				console.log(data);
				data.result.forEach((o) => {
					if (o.city_id) { d3.select('#kab-' + o.city_id).style('fill', (o.color || defMapColor)); }
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
