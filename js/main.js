const datasource	= ["KPK", "Ombudsman"];
const provs			= ["Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta", "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara"];

let opts	= {
	datasource: _.clone(datasource),
}

$( document ).ready(function() {
	$( '#datasource' ).html(datasource.map((o) => ("<div class='datasource-opt selections active cursor-pointer'>" + o + "</div>")));

	$( '#area-opts' ).html(['Nasional'].concat(provs).map((o) => ("<option>" + o + "</option>")));
});
