<template>
    <v-app>
        <NavBar v-if="$route.name !== 'Login'"/>
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script setup>
</script>
