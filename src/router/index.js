import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import Reporte from '@/pages/Reporte.vue'
import Camara from '@/pages/Camara.vue'
import CamaraDetalle from '@/pages/CamaraDetalle.vue'

const routes = [
  { 
    path: '/',
    redirect: '/home'
  },
  { 
    path: '/home',
    name: 'home',
    component: Home 
  },
  { 
    path: '/login',
    name: 'login',
    component: Login 
  },
  { 
    path: '/camara',
    name: 'camara',
    component: Camara 
  },
  { 
    path: '/camara-detalle/:camaraId',
    name: 'camaraDetalle',
    component: CamaraDetalle,
    props: true
  },
  { 
    path: '/reporte',
    name: 'reporte',
    component: Reporte
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
