function refreshContent() {
	let activeContent	= $('#navigation li.active').text();
	switch (activeContent) {
		case navigation[0]:
			getVizMaps(null, (err, data) => {
				if (!centered) { createBar(data); }
				data.forEach((o) => { if (o.id) { d3.select('#prov-' + o.id).style('fill', (o.color || defColor)); } });
			});
			if (centered) {
				getVizMaps(centered, (err, data) => {
					createBar(data);
					data.forEach((o) => { if (o.id) { d3.select('#kab-' + o.id).style('fill', (o.color || defColor)); } });
				});
			}
			break;
			case navigation[1]: createVolume(); break;
			case navigation[2]: createTopics(); break;
			case navigation[3]: createKeywords(); break;
			case navigation[4]: createTreemap(); break;
		default:
			console.log('undefined');
	}
}

function changeContent(val) {
	let activeContent	= $('#navigation li.active').text();
	if (activeContent !== val) {
		if (activeContent == navigation[3]) { d3.select('#' + message_id).remove(); }
		$( '#navigation li.active' ).removeClass('active');
		$( '#navigation li#' + _.kebabCase(val) ).addClass('active');
		switch (val) {
			case navigation[0]: createMap(); break;
			case navigation[1]: createVolume(); break;
			case navigation[2]: createTopics(); break;
			case navigation[3]: createKeywords(); break;
			case navigation[4]: createTreemap(); break;
			default: d3.select(content_dest).selectAll("svg").remove();
		}
	}
}

function changeFromRegion(prov_id) {
	let activeContent	= $('#navigation li.active').text();
	if (activeContent !== navigation[0]) { centered = prov_id; createDropdownKab(); }
	switch (activeContent) {
		case navigation[0]: zoomProv(prov_id, true); break;
		case navigation[1]: createVolume(); break;
		case navigation[2]: createTopics(); break;
		case navigation[3]: createKeywords(); break;
		case navigation[4]: createTreemap(); break;
		default:
			console.log('undefined');
	}

	getVizCategories((data) => { changeCateHeight(data); });
}

function changeFromRegency(regency_id) {
	let activeContent	= $('#navigation li.active').text();

	regency	= regency_id;

	switch (activeContent) {
		case navigation[0]: break;
		case navigation[1]: createVolume(); break;
		case navigation[2]: createTopics(); break;
		case navigation[3]: createKeywords(); break;
		case navigation[4]: createTreemap(); break;
		default:
			console.log('undefined');
	}

	if (activeContent !== navigation[0]) { getVizCategories((data) => { changeCateHeight(data); }); }
}

function createDropdownKab() {
	if (centered) {
		getProvinces(centered, (data) => {
			$( '#dropdown-regency > ul' ).html('<li id="regency-def">Seluruh Kabupaten</li>' + (data.cities || []).map((o) => ("<li id='regency-" + o.id + "' value='" + o.id + "'>" + o.name + "</li>")).join(''));

			$( '#dropdown-regency > ul > li' ).click(function(e) {
				$( '#regency > input' ).val($( this ).text());
				$( '#dropdown-regency' ).jqDropdown('hide');

				changeFromRegency($( this ).val() || null);
			});

			switchDropdown('regency');
			d3.select('.chevron-wrapper').classed('hidden', false);
		});
	} else {
		switchDropdown('province');
		d3.select('#header-province .chevron-wrapper').classed('hidden', true);

		$( '#regency > input' ).val();
	}

	regency	= null;
}

function switchDropdown(state) {
	if (state) {
		d3.select('#header-regency').classed('hidden', state !== 'regency');
		d3.select('#header-province').classed('hidden', state !== 'province');
	} else {
		d3.select('#header-regency').classed('hidden', !d3.select('#header-regency').classed('hidden'));
		d3.select('#header-province').classed('hidden', !d3.select('#header-province').classed('hidden'));
	}
}
