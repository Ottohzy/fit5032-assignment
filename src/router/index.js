import { createRouter, createWebHistory } from 'vue-router'


import HomePage from '../pages/HomePage.vue'
import SignUpPage from '../pages/SignUpPage.vue'
import AboutUsPage from '../pages/AboutUsPage.vue'
import BasketballProgramPage from '../pages/BasketballProgramPage.vue'
import CoachDashboardPage from '../pages/CoachDashboardPage.vue'
import CommunityPage from '../pages/CommunityPage.vue'
import ContactUsPage from '../pages/ContactUsPage.vue'
import HealthResourcesPage from '../pages/HealthResourcesPage.vue'
import ParticipantZonePage from '../pages/ParticipantZonePage.vue'
import SignInPage from '../pages/SignInPage.vue'
import DataTablesPage from '../pages/DataTablesPage.vue'
import MapPage from '../pages/MapPage.vue'
import AdminDashboardPage from '../pages/AdminDashboardPage.vue'




const routes = [
  { path: '/', component: HomePage },
  { path: '/signup', component: SignUpPage },
  { path: '/about', component: AboutUsPage },
  { path: '/basketball', component: BasketballProgramPage },
  { path: '/coach', component: CoachDashboardPage },
  { path: '/community', component: CommunityPage },
  { path: '/contact', component: ContactUsPage },
  { path: '/health', component: HealthResourcesPage },
  { path: '/participant', component: ParticipantZonePage },
  { path: '/signin', name: 'SignIn', component: SignInPage },
  { path: '/tables', component: DataTablesPage },
  { path: '/map', component: MapPage },
  { path: '/admin', component: AdminDashboardPage }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

