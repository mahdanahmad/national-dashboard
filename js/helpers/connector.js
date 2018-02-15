function refreshContent() {
	switch ($('#navigation li.active').text()) {
		case navigation[0]:
			getVizMaps(null, (err, data) => {
				data.forEach((o) => { if (o.id) { d3.select('#prov-' + o.id).style('fill', (o.color || defColor)); } });
			});
			if (centered) {
				getVizMaps(centered, (err, data) => {
					data.forEach((o) => { if (o.id) { d3.select('#kab-' + o.id).style('fill', (o.color || defColor)); } });
				});
			}
			break;
			case navigation[1]: createVolume(); break;
			case navigation[3]: createTreemap(); break;
			case navigation[4]: createKeywords(); break;
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
			case navigation[0]: createMap(); break;
			case navigation[1]: createVolume(); break;
			case navigation[3]: createTreemap(); break;
			case navigation[4]: createKeywords(); break;
			default: d3.select(content_dest).selectAll("svg").remove();
		}
	}
}

function changeFromRegion(prov_id) {
	let activeContent	= $('#navigation li.active').text();
	if (activeContent !== navigation[0]) { centered	= prov_id; }
	switch (activeContent) {
		case navigation[0]: zoomProv(prov_id, true); break;
		case navigation[1]: createVolume(); break;
		case navigation[3]: createTreemap(); break;
		case navigation[4]: createKeywords(); break;
		default:
			console.log('undefined');
	}

	getVizCategories((data) => { changeCateHeight(data); });
}
