<template>
  <div class="container mt-4">
    <h2 class="mb-3">Explore & Route (E.2)</h2>


    <form class="row g-2 align-items-end mb-3" @submit.prevent="buildRoute">
      <div class="col-12 col-md-4">
        <label for="originBox" class="form-label">Origin</label>
        <div id="originBox" class="geocoder-container"></div>
        <div class="form-text">Pick a place or use "Use my location".</div>
      </div>

      <div class="col-12 col-md-4">
        <label for="destBox" class="form-label">Destination</label>
        <div id="destBox" class="geocoder-container"></div>
      </div>

      <div class="col-6 col-md-2">
        <label class="form-label" for="profile">Mode</label>
        <select id="profile" class="form-select" v-model="profile" aria-label="Routing mode">
          <option value="driving">Driving</option>
          <option value="walking">Walking</option>
          <option value="cycling">Cycling</option>
        </select>
      </div>

      <div class="col-6 col-md-2 d-flex gap-2">
        <button type="submit" class="btn btn-primary flex-fill" :disabled="!origin || !destination">
          Route
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="useMyLocation" title="Use my current location">
          📍
        </button>
      </div>
    </form>


    <div id="map" class="rounded shadow-sm" role="region" aria-label="Interactive map showing route and search results"></div>


    <div v-if="summary" class="alert alert-info mt-3" role="status">
      <strong>Trip:</strong> {{ summary.distance }} • {{ summary.duration }}
    </div>

    <details v-if="steps.length" class="mt-2">
      <summary class="mb-2">Turn-by-turn steps</summary>
      <ol class="mb-0">
        <li v-for="(s, i) in steps" :key="i">{{ s }}</li>
      </ol>
    </details>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
mapboxgl.accessToken = MAPBOX_TOKEN

const map = ref(null)
const origin = ref(null)       // [lng, lat]
const destination = ref(null)  // [lng, lat]
const originMarker = ref(null)
const destMarker = ref(null)
const routeId = 'route-line'
const profile = ref('driving')

const summary = ref(null) // { distance, duration }
const steps = ref([])     // turn-by-turn text

function addOrMoveMarker(markerRef, lngLat, color = '#0d6efd') {
  if (!markerRef.value) {
    markerRef.value = new mapboxgl.Marker({ color })
      .setLngLat(lngLat)
      .addTo(map.value)
  } else {
    markerRef.value.setLngLat(lngLat)
  }
}

function fitToBounds() {
  if (!origin.value || !destination.value) return
  const b = new mapboxgl.LngLatBounds()
    .extend(origin.value)
    .extend(destination.value)
  map.value.fitBounds(b, { padding: 60, duration: 500 })
}

async function geocodeToLngLat(place) {

  if (place && place.center) return place.center
  return null
}

async function buildRoute() {
  if (!origin.value || !destination.value) return
  const [oLng, oLat] = origin.value
  const [dLng, dLat] = destination.value

  // Directions API
  const resp = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile.value}/` +
    `${oLng},${oLat};${dLng},${dLat}` +
    `?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`
  )
  const data = await resp.json()
  if (!data.routes?.length) return

  const route = data.routes[0]
  const line = route.geometry


  if (map.value.getSource('route')) {
    map.value.getSource('route').setData({ type: 'Feature', geometry: line })
  } else {
    map.value.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: line } })
    map.value.addLayer({
      id: routeId,
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#0d6efd',
        'line-width': 5,
        'line-opacity': 0.8
      }
    })
  }


  const km = (route.distance / 1000).toFixed(2) + ' km'
  const mins = Math.round(route.duration / 60) + ' min'
  summary.value = { distance: km, duration: mins }


  steps.value = []
  route.legs?.[0]?.steps?.forEach(s => {
    steps.value.push(s.maneuver.instruction)
  })

  fitToBounds()
}

function useMyLocation() {
  if (!navigator.geolocation) return alert('Geolocation not supported.')
  navigator.geolocation.getCurrentPosition(pos => {
    const lngLat = [pos.coords.longitude, pos.coords.latitude]
    origin.value = lngLat
    addOrMoveMarker(originMarker, lngLat, '#198754')
    map.value.flyTo({ center: lngLat, zoom: 13 })
  }, () => alert('Failed to get your location.'))
}

onMounted(() => {

  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136],
    zoom: 11
  })


  map.value.addControl(new mapboxgl.NavigationControl(), 'top-right')
  map.value.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }))


  const common = {
    accessToken: MAPBOX_TOKEN,
    mapboxgl,
    marker: false,
    placeholder: 'Search a place',
    proximity: { longitude: 144.9631, latitude: -37.8136 }
  }

  const originGc = new MapboxGeocoder({ ...common })
  const destGc   = new MapboxGeocoder({ ...common })

  originGc.addTo('#originBox')
  destGc.addTo('#destBox')

  originGc.on('result', async e => {
    origin.value = await geocodeToLngLat(e.result)
    addOrMoveMarker(originMarker, origin.value, '#198754')
    fitToBounds()
  })
  destGc.on('result', async e => {
    destination.value = await geocodeToLngLat(e.result)
    addOrMoveMarker(destMarker, destination.value, '#dc3545')
    fitToBounds()
  })
})

onBeforeUnmount(() => {
  if (map.value) map.value.remove()
})
</script>

<style scoped>
#map {
  height: 70vh;
  min-height: 420px;
}
.geocoder-container :deep(.mapboxgl-ctrl-geocoder) {
  width: 100%;
}
</style>
