function addDepartureRow(departureData){
  var tr = "<tr>";
  _.each(departureData, function(dataPoint){
    tr += "<td>";
    tr += dataPoint;
    tr += "</td>";
  });
  $('table#departures tbody').append(tr);
}

function departureApplies(departure){
  return departure.edt.isAfter(Date.now());
}

// copied wholesale from https://github.com/umts/BusInfoBoard
function timeInterval(edt){
  now = moment();
  edt = moment(edt);
  nowInMinutes = now.hour() * 60 + now.minute();
  edtInMinutes = edt.hour() * 60 + edt.minute();
  // Since EDT is always after now, the only reason the days will be different
  // is if the EDT is on the next day.
  if(edt.day() != now.day())
    edtInMinutes += 60 * 24;
  interval = edtInMinutes - nowInMinutes;
  if (interval == 0)
    return 'Now';
  else if (interval < 60)
    return interval + ' min';
  else {
    hours = Math.floor(interval / 60);
    minutes = interval % 60;
    return hours + ' hr ' + minutes + ' min';
  }
}

function convertToDisplayFormat(departure, routes){
  return [
    departure.bayNumber.toString(),
    departure.routeName,
    departure.headsign,
    departure.edt.format('h:mm a'),
    timeInterval(departure.edt)
  ];
}


$(document).ready(function(){
  var allDepartures = [];

  var options = URI(window.location.href).search(true);
  var departureOrder = options.order;

  var validOrders = ['bayNumber', 'routeName', 'routeNumber', 'headsign', 'edt'];
  if(!_.contains(validOrders, options.order)){
    departureOrder = 'bayNumber'
  }
  var departureOrder = options.order;

  setTimeout(function(){ window.location.reload(); }, 30000);

  var routes = {};

  $.ajax({
    url: 'https://bustracker.pvta.com/InfoPoint/rest/routes/getvisibleroutes',
    async: false,
    success: function(response){
      _.each(response, function(route){
        routes[route.RouteId] = route.RouteAbbreviation;
      });
    }
  });

  var loadingRowDeleted = false;
  var stopIDs = ['5101', '5102', '5103', '5104', '5105', '5106', '5107', '5108',
    '5109', '5110', '5111', '5112', '5113', '5114', '5115', '5116'];

  _.each(stopIDs, function(stopId){
    var url = 'https://bustracker.pvta.com/InfoPoint/rest/stopdepartures/get/' + stopId;
    $.ajax({
      url: url,
      async: false,
      success: function(response){
        var stopID = response[0].StopId.toString();
        var bayNumber = $.inArray(stopID, stopIDs) + 1;
        var directions = response[0].RouteDirections;
        _.each(directions, function(direction){
          var departures = direction.Departures;
          _.each(departures, function(departure){
            var routeName = routes[direction.RouteId];
            var departureData = {
              bayNumber: bayNumber,
              routeName: routeName,
              routeNumber: parseInt(routeName.replace(/\D+/, '')),
              headsign: departure.Trip.InternetServiceDesc,
              edt: moment(departure.EDT),
            };
            if(departureApplies(departureData)){
              allDepartures.push(departureData);
            }
          });
        });
      }
    });
  });
  groupedDepartures = _.groupBy(allDepartures, function(departure){
    return [departure.route, departure.headsign];
  });
  var displayDepartures = _.map(groupedDepartures, function(departures){
    return _.first(_.sortBy(departures, 'edt'));
  });
  displayDepartures = _.sortBy(displayDepartures, departureOrder);
  _.each(_.map(displayDepartures, convertToDisplayFormat), addDepartureRow);
  if(!loadingRowDeleted){
    $('table#departures tr#loading').remove();
    loadingRowDeleted = true;
  }
});
