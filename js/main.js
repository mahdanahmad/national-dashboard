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
		getVizCategories((data) => { changeCateHeight(data); refreshContent(); });
	});

	// Get Area Options
	getProvinces(null, ( data ) => {
		$( '#dropdown-region > ul' ).append(data.map((o) => ("<li id='region-" + o.id + "' value='" + o.id + "'>" + o.name + "</li>")).join(''));
		$( 'div#dropdown-region > ul > li' ).click(function(e) {
			$( '#region > input' ).val($( this ).text());
			$( '#regency > input' ).val();
			
			$( '#dropdown-region' ).jqDropdown('hide');

			changeFromRegion($( this ).val() || null);
		});
	});

	// Create dateRangePicker
	$( '#timeline > input' ).dateRangePicker(dateOpts).bind('datepicker-change',(e, obj) => {
		activeDate	= { start: moment(obj.date1).format(dateServer), end: moment(obj.date2).format(dateServer) };

		getVizCategories((data) => { changeCateHeight(data); refreshContent(); });
	});
	$( '#timeline > input' ).data('dateRangePicker').setStart(defaultDate.start).setEnd(defaultDate.end);
	$( '#timeline > div' ).click((e) => {
		e.stopPropagation();
		$( '#timeline > input' ).data('dateRangePicker').open();
	});

	// Create navigation on footer
	$( '#navigation > ul' ).html(navigation.map((o, i) => ("<li id='" + _.kebabCase(o) + "' class='" + (i ? '' : 'active') + "' onclick='changeContent(\"" + o + "\")'>" + o + "</li>")));

	// Create category chart
	createCategories();

	// Create Map (default)
	createMap();

	$( '#cate-preset' ).click((e) => {

	});

	$( '#cate-select' ).click((e) => {
		$( 'g.group-bar.unintended, text.text-on-category.unintended' ).removeClass('unintended');
		activeCate	= d3.selectAll('g.group-bar').nodes().map((o) => (parseInt(d3.select(o).attr('id').replace('bar-', ''))));
		refreshContent();
	});

	$( '#cate-unselect' ).click((e) => {
		$( 'g.group-bar:not(.unintended), text.text-on-category:not(.unintended)' ).addClass('unintended');
		activeCate	= [];
		refreshContent();
	});
});
