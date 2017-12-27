moment.locale('id');

const monitor_id	= 1;
const datasource	= ["KPK", "Ombudsman"];
const periode		= ['Day', 'Week', 'Month', 'Year'];
const navigation	= ['Map', 'Daily Volume', 'Treemap', 'Keyword', 'Topic Breakdown', 'Spike Alert']

const dateFormat	= 'DD MMM YYYY';
const defaultDate	= { start: moment().subtract(1, 'months').format(dateFormat), end: moment().format(dateFormat) };
const dateOpts		= {
	format: dateFormat,
	endDate: defaultDate.end,
	language: 'id',
	startOfWeek: 'monday',
	customArrowPrevSymbol: '<i class="fa fa-arrow-circle-left"></i>',
	customArrowNextSymbol: '<i class="fa fa-arrow-circle-right"></i>',
};

const waitPeriod	= 1500;

let opts			= {
	datasource: _.clone(datasource),
}

$( document ).ready(function() {
	$( '#dropdown-datasource > div' ).html(datasource.map((o) => ("<div class='datasource-opt active cursor-pointer'>" + o + "</div>")));
	$( '#datasource > input' ).val(datasource.join(', '));
	$( 'div.datasource-opt' ).click(function(e) {
		if ($( this ).hasClass('active')) {
			if ($( '.datasource-opt.active' ).length > 1) { $( this ).removeClass('active'); }
		} else {
			$( this ).addClass('active');
		}
		$( '#datasource > input' ).val( $( '.datasource-opt.active' ).map(function() { return $( this ).text(); }).get().join(', ') );
	});

	// Get Area Options
	$.get( "api/provinces", ( data ) => {
		$( '#dropdown-region > ul' ).append(data.result.map((o) => ("<li value='" + o.id + "'>" + o.name + "</li>")).join(''));
		$( 'div#dropdown-region > ul > li' ).click(function(e) {
			// console.log($( this ).val());
			$( '#region > input' ).val($( this ).text());
			$( '#dropdown-region' ).jqDropdown('hide');
		});
	});

	// Create dateRangePicker
	$('#timeline > input').dateRangePicker(dateOpts);
	$('#timeline > input').data('dateRangePicker').setStart(defaultDate.start).setEnd(defaultDate.end);
	$('#timeline > div').click((e) => {
		e.stopPropagation();
		$('#timeline > input').data('dateRangePicker').open();
	});

	// Create navigation on footer
	$('#navigation > ul').html(navigation.map((o, i) => ("<li class='" + (i ? '' : 'active') + "'>" + o + "</li>")));

	// Create category chart
	createCategories(monitor_id);

	// Create Map (default)
	createMap(monitor_id);
});
