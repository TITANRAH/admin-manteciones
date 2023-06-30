import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'





const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      
    },

    {
      path: '/mantenciones',
      name: 'mantenciones',
      component: ()=> import('../views/MantecionesView.vue')
    },
   
    {
      path: '/mantenciones/:id',
      name: 'mantencion',
      component: ()=> import('../views/MantencionPorClienteView.vue')
    },
    {
      path: '/agregar-mantencion',
      name: 'agregar-mantencion',
      component: ()=> import('../views/AddMaintenance.vue')
    },
   
  ]
})

export default router
