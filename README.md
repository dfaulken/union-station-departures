# union-station-departures

Prototype of a simple bus departures display, showing departures at Union Station, Springfield.

## Parameters

+ `?order=SORT_ORDER`: The order (`SORT_ORDER`) in which departures will be sorted.
   Accepted values are:
   1. `bayNumber`: Order departures by what bay number they happen in. *Default*
   1. `routeName`: Not recommended. Sorts routes alphabetically.
   1. `routeNumber`: Recommended method of sorting by route. Sorts routes according to their number.
   1. `headsign`: Order alphabetically by headsign.
   1. `edt`: Earliest departures come first.
