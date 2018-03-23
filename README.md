# union-station-departures

Prototype of a simple bus departures display, showing departures at Union Station, Springfield.

## Parameters

+ `?order=SORT_ORDER`: The order (`SORT_ORDER`) in which departures will be sorted.
   Accepted values are:
   + `bayNumber`: Order departures by what bay number they happen in. *Default*
   + `routeName`: Not recommended. Sorts routes alphabetically.
   + `routeNumber`: Recommended method of sorting by route. Sorts routes according to their number.
   + `headsign`: Order alphabetically by headsign.
   + `edt`: Earliest departures come first.
