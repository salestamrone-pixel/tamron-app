export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  color: string;
}

export interface MapData {
  markers: MapMarker[];
  route?: { lat: number; lng: number }[];
}

// Self-contained Leaflet page (OpenStreetMap tiles) rendered inside a WebView/iframe.
export function mapHtml(data: MapData) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#m{margin:0;height:100%;width:100%}.pin{width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)}</style>
</head><body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var d=${json};var map=L.map('m',{zoomControl:true}).setView([24.7136,46.6753],11);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
var b=[];
if(d.route&&d.route.length){var pts=d.route.map(function(p){return[p.lat,p.lng]});L.polyline(pts,{color:'#C9A24B',weight:4}).addTo(map);pts.forEach(function(p){b.push(p)});}
d.markers.forEach(function(m){var i=L.divIcon({className:'',html:'<div class="pin" style="background:'+m.color+'"></div>',iconSize:[16,16],iconAnchor:[8,8]});
L.marker([m.lat,m.lng],{icon:i}).addTo(map).bindPopup(m.label);b.push([m.lat,m.lng]);});
if(b.length>1)map.fitBounds(b,{padding:[30,30]});else if(b.length===1)map.setView(b[0],16);
</script></body></html>`;
}
