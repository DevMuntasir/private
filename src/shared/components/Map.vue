<template>
  <div class="dashboard bg-white overflow-hidden">
    <div class="map-wrapper max-w-[400px] max-h-[370px] ">
      <!-- এখানে :options যোগ হয়েছে -->
      <l-map
        ref="mapRef"
        :zoom="7"
        :center="[23.7, 90.4]"
        :options="mapOptions"
        style="height:400px; width:300px; padding: 0; margin: 0; background: transparent;"
      >
        <l-tile-layer :url="tileUrl" :attribution="attribution" />

        <l-geo-json
          v-if="bdGeojson"
          :geojson="bdGeojson"
          :options-style="styleFeature"
          style="background: transparent;"
        />

        <l-marker
          v-for="(loc, index) in locations"
          :key="index"
          :lat-lng="[loc.lat, loc.lng]"
          :icon="loc.icon"
        >
          <l-tooltip :content="`${loc.name}: ${loc.count}`" />
        </l-marker>
      </l-map>

      <div class="legend">
        <div v-for="legendItem in legend" :key="legendItem.label" class="legend-item">
          <div class="legend-color" :style="{backgroundColor: legendItem.color}"></div>
          <span>{{ legendItem.label }}</span>
        </div>
      </div>
    </div>
    <div class="stats">
      <h3 class=" font-primary">Online Screen</h3>
      <h1 class=" font-primary">{{ totalOnline }}</h1>
      <h3 class=" font-primary">Offline Screen</h3>
      <h1 class=" font-primary">{{ totalOffline }}</h1>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import L from 'leaflet';
import {
  LMap, LTileLayer, LMarker, LGeoJson, LTooltip
} from '@vue-leaflet/vue-leaflet';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

const mapRef = ref(null);
const bdGeojson = ref(null);

// নতুন: mapOptions -> maxBounds/viscosity সেট করবো
const mapOptions = ref({
  zoomControl: false ,
   scrollWheelZoom: false,
  doubleClickZoom: false,
  touchZoom: false,
  boxZoom: false,
  attributionControl: false

});

const totalOnline = ref(895);
const totalOffline = ref(105);

const legend = ref([
  { label: 'Dhaka', color: '#d32f2f' },
  { label: 'Chittagong', color: '#fbc02d' },
  { label: 'Khulna', color: '#ff7043' }
]);

const locations = ref([
  { name:'Dhaka', lat: 23.8103, lng: 90.4125, count: 240, color: '#d32f2f' },
  { name:'Chittagong', lat: 24.3636, lng: 88.6241, count: 255, color: '#fbc02d' },
  { name:'Khulna', lat: 22.3569, lng: 91.7832, count: 400, color: '#ff7043' }
]);

function makeDivIcon({ count, color }) {
  const html = `
    <div style="
      width:56px; height:56px; border-radius:50%;
      background:${color}; color:#fff; font-weight:600;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 3px 6px rgba(0,0,0,0.3);
    ">
      ${count}
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [56, 56], iconAnchor: [28, 28] });
}

function styleFeature() {
  return { fillColor: '#fcb040', weight: 0.5, color: '#fcb040', fillOpacity: 1 };
}

/* বাংলাদেশের বাইরে “সাদা মাস্ক” বসানো */
function addOutsideMask(map, geojson) {
  // বিশ্বজুড়ে বড় রিং (lng,lat -> lat,lng)
  const worldRingLngLat = [[-180,-90],[-180,90],[180,90],[180,-90]];
  const worldRing = worldRingLngLat.map(([lng,lat]) => [lat,lng]);

  // বাংলাদেশের সবচেয়ে বড় পলিগন রিং বের করি
  const geom = geojson.features ? geojson.features[0].geometry : geojson.geometry;
  let outerRingLngLat = [];
  if (geom.type === 'Polygon') {
    outerRingLngLat = geom.coordinates[0];
  } else if (geom.type === 'MultiPolygon') {
    // বড় যেটা, সেটি নিন
    let max = geom.coordinates[0][0];
    for (const poly of geom.coordinates) {
      if (poly[0].length > max.length) max = poly[0];
    }
    outerRingLngLat = max;
  }
  const bdRing = outerRingLngLat.map(([lng,lat]) => [lat,lng]);

  // মাস্ক পেন (টাইলের ওপর, ওভারলের নিচে)
  map.createPane('mask');
  map.getPane('mask').style.zIndex = 300;

  // worldRing (বাইরের অংশ) + bdRing (হোল)
  L.polygon([worldRing, bdRing], {
    pane: 'mask',
    stroke: false,
    fillColor: '#ffffff',
    fillOpacity: 1,
    interactive: false
  }).addTo(map);
}

onMounted(async () => {
  // GeoJSON লোড (public/data/bangladesh.geojson)
  const res = await fetch('/bangladesh.geojson');
  bdGeojson.value = await res.json();

  // বাউন্ডস ফিট + বাউন্ডস লক
  const gj = L.geoJSON(bdGeojson.value);
  const bounds = gj.getBounds();
  const map = mapRef.value?.leafletObject;

  if (map && bounds.isValid()) {
    map.fitBounds(bounds.pad(0.1));
    mapOptions.value.maxBounds = bounds.pad(1); // বাংলাদেশের বাইরে প্যান আটকানো
    // বাংলাদেশের বাইরে সাদা মাস্ক বসাই
    addOutsideMask(map, bdGeojson.value);
  }

  // কাস্টম আইকন সেট
  locations.value = locations.value.map(loc => ({
    ...loc, icon: makeDivIcon({ count: loc.count, color: loc.color })
  }));
});
</script>

<style scoped>
.dashboard { display:flex;width: fit-content; background: white; border:1px solid #eee; border-radius:4px; padding:15px; gap:20px }
.map-wrapper { position:relative; }
.stats { flex:1; padding-right: 20px; display:flex; flex-direction:column; justify-content:center; font-family:sans-serif; }
.stats h1 { margin:0 0 20px; color:#fcb040; font-size:48px; line-height:1; }
.stats h3 { margin:0; color:#666; font-weight:500; }
.legend { display:flex; margin-top:10px; gap:20px; }
.legend-item { display:flex; align-items:center; gap:6px; }
.legend-color { width:14px; height:14px; border-radius:50%; }
.leaflet-bottom.leaflet-right{
    display: none!important;
}
</style>
