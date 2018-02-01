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
		default:
			console.log('undefined');
	}
}
