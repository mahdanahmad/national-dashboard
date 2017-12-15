const datasource	= ["KPK", "Ombudsman"];

let opts	= {
	datasource: _.clone(datasource),
}

$( document ).ready(function() {
	$( '#datasource' ).html(datasource.map((o) => ("<div class='datasource-opt selections active cursor-pointer'>" + o + "</div>")));

	$.get( "api/provinces", ( data ) => {
		$( '#area-opts' ).append(data.result.map((o) => ("<option value='" + o.id + "'>" + o.name + "</option>")).join(''));
	});
});
