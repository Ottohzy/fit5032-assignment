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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

