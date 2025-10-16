import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'datatables.net-bs5/css/dataTables.bootstrap5.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'


createApp(App).use(router).mount('#app')
