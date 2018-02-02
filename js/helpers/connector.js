function refreshContent() {
	switch (d3.select('#navigation li.active').text()) {
		case 'Map':
			getVizMaps(null, (err, data) => {
				data.forEach((o) => { if (o.id) { d3.select('#prov-' + o.id).style('fill', (o.color || defColor)); } });
			});
			if (centered) {
				getVizMaps(centered, (err, data) => {
					data.forEach((o) => { if (o.id) { d3.select('#kab-' + o.id).style('fill', (o.color || defColor)); } });
				});
			}
			break;
		case 'Treemap': createTreemap(); break;
		default:
			console.log('undefined');
	}
}

function changeContent(val) {
	let activeContent	= $('#navigation li.active').text();
	if (activeContent !== val) {
		$( '#navigation li.active' ).removeClass('active');
		$( '#navigation li#' + _.kebabCase(val) ).addClass('active');
		switch (val) {
			case 'Map': createMap(); break;
			case 'Treemap': createTreemap(); break;
			default: d3.select(content_dest).selectAll("svg").remove();
		}
	}
}
