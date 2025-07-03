<template>
    <v-container class="fill-height login-bg" fluid>
        <v-row>
            <v-col class="d-flex justify-center">
                <div class="text-center text-h3" color="white">
                    SafeTexAI
                </div>
                <v-card class="pa-5 w-33 align-center">
                    <v-card-title class="font-weight-light text-center text-h3 pb-0 pt-5">
                        Iniciar Sesión
                    </v-card-title>

                    <v-container class="pl-8 pr-8">
                        <v-form class="mb-16">
                            <v-card-text class="text-h6 pl-0 pb-1">Nombre de usuario</v-card-text>
                            <v-text-field v-model="nombreUsuario">
                            </v-text-field>

                            <v-card-text class="text-h6 pl-0 pb-1 pt-2">Contraseña</v-card-text>
                            <v-text-field v-model="contrasena">
                            </v-text-field>

                            <v-btn class="mt-2 text-none" size="large" variant="flat" color="black" type="submit">Ingresar</v-btn>
                         </v-form>

                        <a class="text-h7" href="https://www.google.com">Olvido su contraseña?</a>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.login-bg {
  background-color: #153E89;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
</style>

<script setup>
    import { ref } from 'vue'


    const nombreUsuario = ref('');
    const contrasena = ref('');
</script>