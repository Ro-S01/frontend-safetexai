<template>
  <v-app-bar color="#153E89">
    <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-toolbar-title>SafeTexAI</v-toolbar-title>
  </v-app-bar>

  <v-navigation-drawer
      v-model="drawer"
      :location="$vuetify.display.mobile ? 'bottom' : undefined"
      temporary
    >
    <v-list>
      <v-list-item link prepend-icon="mdi-home-outline" title="Home" to="/home"></v-list-item>
      <v-list-item link prepend-icon="mdi-camera-outline" title="Camaras" to="/camara"></v-list-item>
      <v-list-item link prepend-icon="mdi-clipboard-text-outline" title="Reportes" to="/reporte"></v-list-item>
    </v-list>

    <template v-slot:append>
      <v-list-item class="mb-5">
        <div class="mt-auto font-italic">
          <v-btn prepend-icon="mdi-exit-to-app" class="text-red-lighten-1 text-none" variant="text" @click="logout">Cerrar Sesión</v-btn>
        </div>
      </v-list-item>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
  import { supabase } from '@/lib/supabaseClient';
import { ref, watch } from 'vue'
  import { useRouter } from "vue-router";
  import { toast } from "vue3-toastify";

  const drawer = ref(false);
  const router = useRouter();

  async function logout() {
    try {
      await supabase.auth.signOut();     
      toast.info("Logged out");
      router.push("/Login");
    } catch (err) {
      toast.error(err.message);
    }
}
</script>

<styles lang="css">
    
</styles>