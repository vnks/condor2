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

function distance(lat1,lon1,lat2,lon2) {
    var um = "ft"; // km | ft (change the constant)
    var R = 6371;
    if (um=="ft") { R = 20924640; /* ft constant */ }
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180; 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    if(um=="km") {
        if (d>1) return Math.round(d)+"km";
        else if (d<=1) return Math.round(d*1000)+"m";
    }
    if(um=="ft"){
        if ((d/6076.12)>=1) return Math.round((d/6076.12))+"nm";
        else if ((d/6076.12)<1) return Math.round(d)+"ft";
    }
    return d;
}

// Define the overlay, derived from google.maps.OverlayView
function Label(opt_options) {
    // Initialization
    this.setValues(opt_options);

    // Label specific
    var span = this.span_ = document.createElement('span');
    span.style.cssText = 'position: relative; left: 0%; top: -8px; ' +
              'white-space: nowrap; border: 0px; font-family:arial; font-weight:bold;' +
              'padding: 2px; background-color: #ddd; '+
                'opacity: .75; '+
                'filter: alpha(opacity=75); '+
                '-ms-filter: "alpha(opacity=75)"; '+
                '-khtml-opacity: .75; '+
				'-moz-opacity: .75;';

    var div = this.div_ = document.createElement('div');
    div.appendChild(span);
    div.style.cssText = 'position: absolute; display: none; z-index:100';
};

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
		turnpoints.push({name : name, lat : lat, lon : lon});
}

function initMap() {
		Label.prototype = new google.maps.OverlayView;

		// Implement onAdd
		Label.prototype.onAdd = function() {
				var pane = this.getPanes().overlayLayer;
				pane.appendChild(this.div_);

    
				// Ensures the label is redrawn if the text or position is changed.
				var me = this;
    this.listeners_ = [
											 google.maps.event.addListener(this, 'position_changed',
																										 function() { me.draw(); }),
											 google.maps.event.addListener(this, 'text_changed',
																										 function() { me.draw(); })
											 ];
    
		};

		// Implement onRemove
		Label.prototype.onRemove = function() { this.div_.parentNode.removeChild(this.div_ );
																						// Label is removed from the map, stop updating its position/text.
																						for (var i = 0, I = this.listeners_.length; i < I; ++i) {
																								google.maps.event.removeListener(this.listeners_[i]);
																						}
		};

		// Implement draw
		Label.prototype.draw = function() {
				var projection = this.getProjection();
				var position = projection.fromLatLngToDivPixel(this.get('position'));
				var div = this.div_;
				div.style.left = position.x + 'px';
				div.style.top = position.y + 'px';
				div.style.display = 'block';

				this.span_.innerHTML = this.get('text').toString();
		};

		var map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: turnpoints[0].lat, lng: turnpoints[0].lon},
						mapTypeId: 'terrain',
						zoom: 8
        });

		var bounds = new google.maps.LatLngBounds();
		for (var i in turnpoints) {
				tp = turnpoints[i];
				position = new google.maps.LatLng(tp.lat, tp.lon)
				bounds.extend(position);
				continue;

				var marker = new google.maps.Marker({
								position: position,
								map: map,
								label: parseInt(i) + 1 + "",
						});

				if (i > 0) {
						tp1 = turnpoints[parseInt(i) - 1];
						position1 = new google.maps.LatLng(tp1.lat, tp1.lon)
						rulerpoly = new google.maps.Polyline({
										path: [position, position1],
										strokeColor: "#ffff00",
										strokeOpacity: .7,
										strokeWeight: 4
								});
						var label = new Label({ map: map });
						label.set('text', distance( tp.lat, tp.lon, tp1.lat, tp1.lon));
						label.bindTo('position', marker, 'position');
						rulerpoly.setMap(map);
				}
		}
		map.fitBounds(bounds);
}

function run() {
}

if (turnpoints.length == 0) {
		alert('No turnpoints found.');
} else {
		document.body.innerHTML = '<div id="map" style="height: 100%">';

		maps = document.createElement('script');
		maps.type = 'text/javascript';
		maps.onload = run;
		maps.src = 'https://maps.googleapis.com/maps/api/js?key=' + document.__cc_showtask_api_key__ + '&callback=initMap';
		document.body.appendChild(maps);
}