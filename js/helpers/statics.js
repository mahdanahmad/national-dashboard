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

const defColor		= '#5a6569';

const cate_dest		= '#cate-container';
const cate_id		= 'cate-viz';

const awaitTime		= 800;
let activeCate		= null;

let monitor_id		= 1;
