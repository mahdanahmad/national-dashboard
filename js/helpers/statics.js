const datasource	= ["KPK", "Ombudsman"];
const periode		= ['Day', 'Week', 'Month', 'Year'];
const navigation	= ['Map', 'Daily Volume', 'Topic Breakdown', 'Keyword', 'Treemap']

const dateFormat	= 'DD MMM YYYY';
const dateServer	= 'YYYY-MM-DD';
const defaultDate	= { start: moment([2014]).startOf('year').format(dateFormat), end: moment([2014]).endOf('year').format(dateFormat) };
const dateOpts		= {
	format: dateFormat,
	startDate: defaultDate.start,
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

const content_dest	= '#content-wrapper';
const maps_id		= 'maps-viz';
const treemap_id	= 'treemap-viz';
const volume_id		= 'volume-viz';
const keywords_id	= 'keywords-viz';
const topics_id		= 'topics-viz';

const awaitTime		= 800;

let monitor_id		= 1;

let activeCate		= null;
let activeDate		= _.chain(defaultDate).clone().mapValues((o) => (moment(o, dateFormat).format(dateServer))).value();
let cateValue		= {};

let countessa		= { provinces: {}, regencies: {} };
let centered		= null;
