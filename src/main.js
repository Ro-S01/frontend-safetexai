/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import Vue3Toastify from 'vue3-toastify';

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'
import './styles/styles.css'
import 'vue3-toastify/dist/index.css';

const app = createApp(App)

app.use(Vue3Toastify, {
    position: "top-right",
    autoClose: 3500,
    theme: "light",
});

registerPlugins(app)

app.mount('#app')
