function addDepartureRow(departureData){
  var tr = "<tr>";
  for(var i = 0; i < departureData.length; i++){
    var dataPoint = departureData[i];
    tr += "<td>";
    tr += dataPoint;
    tr += "</td>";
  }
  tr += "</tr>";
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
    routes[departure.route],
    departure.headsign,
    departure.edt.format('h:mm a'),
    timeInterval(departure.edt)
  ];
}


$(document).ready(function(){
  setTimeout(function(){ window.location.reload(); }, 30000);

  var routes = {};

  $.ajax({
    url: 'https://bustracker.pvta.com/InfoPoint/rest/routes/getvisibleroutes',
    async: false,
    success: function(response){
      for(var i = 0; i < response.length; i++){
        var route = response[i];
        routes[route.RouteId] = route.RouteAbbreviation;
      }
    }
  });

  var loadingRowDeleted = false;
  var stopIDs = ['5101', '5102', '5103', '5104', '5105', '5106', '5107', '5108',
    '5109', '5110', '5111', '5112', '5113', '5114', '5115', '5116'];

  for(var h = 0; h < stopIDs.length; h++){
    var url = 'https://bustracker.pvta.com/InfoPoint/rest/stopdepartures/get/' + stopIDs[h];
    $.ajax({
      url: url,
      async: false,
      success: function(response){
        var stopID = response[0].StopId.toString();
        var bayNumber = $.inArray(stopID, stopIDs) + 1;
        var directions = response[0].RouteDirections;
        for(var i = 0; i < directions.length; i++){
          var direction = directions[i];
          var departures = direction.Departures.sort(function(a, b){
            return moment(a.EDT) < moment(b.EDT) ? -1 : 1;
          });
          for(var j = 0; j < departures.length; j++){
            var departure = departures[j];
            var departureData = {
              bayNumber: bayNumber,
              route: direction.RouteId,
              headsign: departure.Trip.InternetServiceDesc,
              edt: moment(departure.EDT),
            };
            if(departureApplies(departureData)){
              departureDisplayData = convertToDisplayFormat(departureData, routes);
              addDepartureRow(departureDisplayData);
              if(!loadingRowDeleted){
                $('table#departures tr#loading').remove();
                loadingRowDeleted = true;
              }
              break; // only render the first departure per stop/route/direction
            }
          }
        }
      }
    });
  }
});
