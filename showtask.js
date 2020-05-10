function ParseDMS(input) {
    var parts = input.match(/(\d+)\.(\d+)\.(\d+)([NESW])/);
    return ConvertDMSToDD(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), parts[4]);
}

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes/60 + seconds/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}

var pageText = document.body.innerHTML;
var tpText = pageText.match(/<i><bdo dir="ltr">.*?Coords.*?<br>/gs);
var turnpoints = [];

for (var i in tpText) {
		text = tpText[i];
		matches = text.match(/\">(.*?)<\/bdo>.*?Coords:<\/u>\s+(.*?)<br>/s);
    var name = matches[1];
    var coords = matches[2];
		var latlon = matches[2].split('/');
		var lat = ParseDMS(latlon[0]);
		var lon = ParseDMS(latlon[1]);
    console.log(name, lat, lon);
		turnpoints.push({name : name, lat : lat, lon : lon});
}

function initMap() {
		var map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: turnpoints[0].lat, lng: turnpoints[0].lon},
						mapTypeId: 'terrain',
						zoom: 8
        });

		var bounds = new google.maps.LatLngBounds();
		for (var i in turnpoints) {
				tp = turnpoints[i];
				position = new google.maps.LatLng(tp.lat, tp.lon)

				var marker = new google.maps.Marker({
								position: position,
								map: map,
								label: parseInt(i) + 1 + "",
						});
				bounds.extend(position);
		}
		map.fitBounds(bounds);
}

function run() {
		console.log("run");
}

document.body.innerHTML = '<div id="map" style="height: 100%">';
console.log(coords);

maps = document.createElement('script');
maps.type = 'text/javascript';
maps.onload = run;
maps.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBw-XCEMWfJ5nWMmCGS7YHYfpahHl8RXVU&callback=initMap';
document.body.appendChild(maps);