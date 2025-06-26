<template>
    <v-container>
        <v-card class="pa-5">
            <template v-slot:title>
                <span class="font-weight-black text-h4">Información de la Cámara</span>
            </template>

            <v-container class="pa-4">
                <v-row row-md-12>
                    <v-col cols-8>
                        <v-img
                            aspect-ratio="16/9"
                            src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
                        >
                        </v-img>
                    </v-col>

                    <v-col cols-4>
                        <v-card-text class="text-h5 font-weight-black pa-0">
                            Cámara
                        </v-card-text>
                        <v-card-text class="text-h5 pa-0 mb-3">
                            {{datosCamara.camara}}
                        </v-card-text>

                        <v-card-text class="text-h5 font-weight-black pa-0 ">
                            Área
                        </v-card-text>
                        <v-card-text class="text-h5 pa-0 mb-3">
                            {{datosCamara.area}}
                        </v-card-text>

                        <v-card-text class="text-h5 font-weight-black pa-0">
                            Cinta 
                        </v-card-text>
                        <v-card-text class="text-h5 pa-0 mb-3">
                            {{datosCamara.cinta}}
                        </v-card-text>

                        <v-card-text class="text-h5 font-weight-black pa-0">
                            Último reporte
                        </v-card-text>

                        <v-spacer></v-spacer>
                        <v-card-actions>
                             <v-btn variant="flat" color="secondary" class="text-none" to="/reporte">Ver Reporte</v-btn>
                            <v-btn variant="flat" color="black" class="text-none" to="/camara">Cerrar</v-btn>
                        </v-card-actions>
                    </v-col>
                </v-row>       
            </v-container>
        </v-card>
    </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRoute } from 'vue-router';
    import camaraService from '../services/service.camara.js'

    const route = useRoute();
    const camaraId = route.params.camaraId;
    const loading = ref(false);
    const datosCamara = ref({});

    const loadItems = async () => {
        loading.value = true
        
        const response = await camaraService.getCamaraPorId(camaraId)
        .then(response => {
            datosCamara.value = {
                camara: response.at(0).camara,
                area: response.at(0).area,
                cinta: response.at(0).cinta
            }
            loading.value = false;
        })
        .catch(err => {
            console.log(err);
        });
    }

    onMounted(() => {
        loadItems()
    })
</script>