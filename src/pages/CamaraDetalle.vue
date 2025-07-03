<template>
    <v-container>
        <v-card class="pa-5">
            <template v-slot:title>
                <span class="font-weight-black text-h4">Información de la Cámara</span>
            </template>

            <v-container class="pa-4">
                <v-row row-md-12>
                    <!-- <v-col cols-8>
                        <v-img
                            aspect-ratio="16/9"
                            src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
                        >
                        </v-img>
                    </v-col> -->

                    <v-col cols-12>
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
                        <v-card-text class="text-h5 pt-2 pb-2 pr-3 report-border" id="txtDefecto">
                            Defecto: {{ultimoReporte.defecto}}
                        </v-card-text>
                        <v-card-text class="text-h5 pt-2 pb-2 pr-3 mb-3 report-border">
                            Fecha y Hora: {{ultimoReporte.fecha}}
                        </v-card-text>

                        <v-spacer></v-spacer>
                        <v-card-actions class="justify-content-end pa-0">
                            <v-btn size="large" variant="outlined" color="black" class="text-none" to="/camara">Regresar</v-btn>
                            <v-btn size="large" variant="flat" color="black" class="text-none" to="/reporte">Ver Reporte</v-btn>
                        </v-card-actions>
                    </v-col>
                </v-row>       
            </v-container>
        </v-card>

        <div class="d-none">
            <img v-for="img in imageList" :key="img" :src="`public/images/input/${img}`" :alt="img" />
        </div>
    </v-container>
</template>

<style scoped>
.report-border {
    border-style: solid;
    border-width: 2px;
    border-color: black;
}

#txtDefecto {
    border-bottom: 0px;
}
</style>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRoute } from 'vue-router';
    import camaraService from '../services/service.camara.js'
    import reporteService from '../services/service.reporte.js'
    import * as aux from '@/common/general.js'

    const route = useRoute();
    const camaraId = route.params.camaraId;
    const loading = ref(false);
    const datosCamara = ref({});
    const ultimoReporte = ref({});
    const imageList = ['frame_001.jpg', 'frame_002.jpg'];

    const loadItems = async () => {
        loading.value = true
        
        camaraService.getCamaraPorId(camaraId)
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
        
        reporteService.getReportePaginado()
            .then(response => {
                var ultimo = response[response.length - 1];
                ultimoReporte.value = {
                    defecto: ultimo.class,
                    fecha: aux.formatDateToPE(ultimo.created_at)
                };
            })
        
        enviarImagen()
    }

    onMounted(() => {
        loadItems()
    })

    async function enviarImagen() {
        var capturaInput = await fetch('/images/input/frame_001.jpg');
        var capturaBlob = await capturaInput.blob();

        const formData = new FormData();
        formData.append('file', capturaBlob, 'frame_001.jpg');

        reporteService.enviarCaptura(formData)
            .then(response => {
                console.log('recibio output', response);
            })
            .catch(error => {
                console.log('enviarCaptura', error);
            });
    }
</script>