import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { onAuthStateChanged } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'


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
      meta: {requiresAuth: true}
      
    },

    {
      path: '/mantenciones',
      name: 'mantenciones',
      component: ()=> import('../views/MantecionesView.vue'),
      meta: {requiresAuth: true}
    },
   
    {
      path: '/mantenciones/:id',
      name: 'mantencion',
      component: ()=> import('../views/MantencionPorClienteView.vue'),
      meta: {requiresAuth: true}
    },
    // {
    //   path: '/agregar-mantencion',
    //   name: 'agregar-mantencion',
    //   component: ()=> import('../views/AddMaintenance.vue'),
    //   meta: {requiresAuth: true}
    // },
    {
      path: '/mantenciones/editar_mantencion/:id',
      name: 'nueva-mantencion',
      component: () => import('../views/NewMaintenance.vue'),
      meta: {requiresAuth: true}
    },
   
    {
      path: '/mantenciones/editar_mantencion/:id',
      name: 'editar-mantencion',
      component: () => import('../views/EditMaintenanceView.vue'),
      meta: {requiresAuth: true}
    },
    
    // enfoque nuevo
    {
      path: '/calendario-general',
      name: 'calendario-general',
      component: () => import('../views/CalendarioGeneralView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/listado-clientes',
      name: 'listado-clientes',
      component: () => import('../views/ListClientesView.vue'),
      meta: {requiresAuth: true}
    },
    
    {
      path: '/mantenciones/crear_costos_mantencion/:idCliente/:idMantencion',
      name: 'crear-costo',
      component: () => import('../views/GuardarCostoMantencion.vue'),
      meta: {requiresAuth: true}
    },
    
    {
      path: '/crear-cliente',
      name: 'crear-cliente',
      component: () => import('../views/CreateClientView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/cliente/:id',
      name: 'cliente',
      component: () => import('../views/ClientView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/crear-mantencion/:id',
      name: 'crear-mantencion',
      component: () => import('../views/CreateMaintenanceView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/mantencion/:idCliente/:id',
      name: 'mantencion-cliente',
      component: () => import('../views/MantencionView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/costo-mantencion/:idCliente/:idMantencion/:idCosto',
      name: 'costo-mantencion',
      component: () => import('../views/CostoView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/cobros-pendientes',
      name: 'cobros-pendientes',
      component: () => import('../views/CobrosPendientesView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/contabilidad-finanzas',
      name: 'contabilidad-finanzas',
      component: () => import('../views/ContabilidadFinanzasView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/contabilidad-finanzas/:id',
      name: 'item-contabilidad-finanza',
      component: () => import('../views/ItemContabilidadFinanzaView.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/detalles-mantenciones-mes/:mes',
      name: 'detalles-mantenciones-mes',
      component: () => import('../views/DetalleMantencionesPorMesView.vue'),
      meta: {requiresAuth: true}
    },


   
  ]
})


router.beforeEach(async (to, from, next)=>{
  const requiresAuth = to.matched.some(url => url.meta.requiresAuth)
  if(requiresAuth){
    try {
      await authenticateUser()
      next()
    } catch (error) {
      console.log(error)
     next({name: 'login'})
      
    }
  } else {
    next()
  }
})


function authenticateUser(){
 
  const auth = useFirebaseAuth();

  return new Promise((resolve, reject)=> {

    const unsuscribe = onAuthStateChanged(auth,(user)=>{
      // console.log('user desde el archivo de rutas', user)
      unsuscribe()
     
      if(user){
        resolve(user)
      } else {
        reject()
      }
    })
  })
}


export default router
