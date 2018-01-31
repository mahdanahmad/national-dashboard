moment.locale('id');

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
	getProvinces(( data ) => {
		$( '#dropdown-region > ul' ).append(data.map((o) => ("<li value='" + o.id + "'>" + o.name + "</li>")).join(''));
		$( 'div#dropdown-region > ul > li' ).click(function(e) {
			$( '#region > input' ).val($( this ).text());
			$( '#dropdown-region' ).jqDropdown('hide');

			zoomProv($( this ).val());
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
	createCategories();

	// Create Map (default)
	createMap();
});
