// CHART
function getVizCategories(callback) { $.get( "api/cat/" + monitor_id, constructParams(), ( data ) => { callback(data.result); }); }
function getVizMaps(prov_id, callback) { $.get( "api/map/" + monitor_id + (prov_id ? '/' + prov_id : ''), constructParams(), ( data ) => { callback(null, data.result); }); }
function getVizTreemap(callback) { $.get( "api/treemap/" + monitor_id, constructParams(), ( data ) => { callback(data.result); }); }


// COMPONENT
function getProvinces(callback) { $.get( "api/provinces", (data) => { callback(data.result) }); }

function constructParams() { return _.omitBy({ categories: JSON.stringify(activeCate), startDate: activeDate.start, endDate: activeDate.end, datasource: $('#datasource > input').val() }, _.isNil); }
