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
    {
      path: '/agregar-mantencion',
      name: 'agregar-mantencion',
      component: ()=> import('../views/AddMaintenance.vue'),
      meta: {requiresAuth: true}
    },
    {
      path: '/mantenciones/editar_mantencion/:id',
      name: 'editar-mantencion',
      component: () => import('../views/EditarMaintenance.vue'),
      meta: {requiresAuth: true}
    },
   
    {
      path: '/mantenciones/crear_costos_mantencion/:id',
      name: 'crear-costo',
      component: () => import('../views/GuardarCostoMantencion.vue'),
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
