moment.locale('id');

const monitor_id	= 1;
const datasource	= ["KPK", "Ombudsman"];
const periode		= ['Day', 'Week', 'Month', 'Year'];

const dateOpts		= {
	format: 'DD MMM YYYY',
	language: 'id',
	startOfWeek: 'monday',
	customArrowPrevSymbol: '<i class="fa fa-arrow-circle-left"></i>',
	customArrowNextSymbol: '<i class="fa fa-arrow-circle-right"></i>'
};
const defaultDate	= { start: moment().subtract(1, 'months').format(dateOpts.format), end: moment().format(dateOpts.format) };

let opts	= {
	datasource: _.clone(datasource),
}

$( document ).ready(function() {
	$( '#datasource' ).html(datasource.map((o) => ("<div class='datasource-opt selections active cursor-pointer'>" + o + "</div>")));

	// Get Area Options
	$.get( "api/provinces", ( data ) => {
		$( '#area-opts' ).append(data.result.map((o) => ("<option value='" + o.id + "'>" + o.name + "</option>")).join(''));
	});

	// Get Categories
	$.get( "api/categories/" + monitor_id + '?selected=name,color', ( data ) => {
		$( '#categories' ).html(data.result.map((o) => ("<div class='categories-opt selections active cursor-pointer'>" + o.name + "</div>")));
	});

	// Create dateRangePicker
	$('#datepicker-input').dateRangePicker(dateOpts);
	$('#datepicker-input').data('dateRangePicker').setStart(defaultDate.start).setEnd(defaultDate.end);
	$( '#periodepicker' ).html(periode.map((o) => ("<div class='periode-opt selections " + (o == 'Month' ? 'active ' : '') + "cursor-pointer'>" + o + "</div>")));
});
