function getVizCategories(callback) {
	$.get( "api/cat/" + monitor_id, ( data ) => { callback(data.result); });
}

function getVizMaps(prov_id, callback) {
	$.get( "api/map/" + monitor_id + (prov_id ? '/' + prov_id : ''), _.omitBy({ categories: JSON.stringify(activeCate) }, _.isNil), ( data ) => { callback(null, data.result); });
}

function getProvinces(callback) {
	$.get( "api/provinces", (data) => { callback(data.result) });
}
