<template>
    <v-container>
        <v-card class="pa-5">
            <template v-slot:title>
                <span class="font-weight-black text-h4">Información de la Cámara</span>
            </template>

            <v-container class="pa-4">
                <v-row row-md-12>
                    <v-col cols-7>
                        <v-img
                            aspect-ratio="16/9"
                            src="/images/input/frame_001.jpg"
                            id="telaCaptura"
                            class="bounding-box-img"
                        >
                            <template #default>
                                <div class="bounding-box-container">
                                    <div
                                        v-if="ultimoReporte.boxx1 !== undefined"
                                        class="bounding-box"
                                        :style="boundingBoxStyle"
                                    ></div>
                                </div>
                            </template>
                        </v-img>
                    </v-col>

                    <v-col cols-12>
                        <v-card-text class="text-h5 font-weight-black pa-0">
                            Cámara
                        </v-card-text>
                        <v-card-text class="text-h5 pa-0 mb-3">
                            <!-- {{datosCamara.camara}} -->
                             CAM001
                        </v-card-text>

                        <v-card-text class="text-h5 font-weight-black pa-0 ">
                            Área
                        </v-card-text>
                        <v-card-text class="text-h5 pa-0 mb-3">
                            <!-- {{datosCamara.area}} -->
                             A1
                        </v-card-text>

                        <v-card-text class="text-h5 font-weight-black pa-0">
                            Cinta 
                        </v-card-text>
                        <v-card-text class="text-h5 pa-0 mb-3">
                            <!-- {{datosCamara.cinta}} -->
                            CNT01
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

.bounding-box-img {
  position: relative;
  width: 100%;
  height: auto;
}

.bounding-box-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.bounding-box {
  position: absolute;
  border: 2px solid red;
  background-color: rgba(255, 0, 0, 0.2);
}
</style>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useRoute } from 'vue-router';
    import { computed } from 'vue';
    import camaraService from '../services/service.camara.js'
    import reporteService from '../services/service.reporte.js'
    import * as aux from '@/common/general.js'

    const route = useRoute();
    const camaraId = route.params.camaraId;
    const loading = ref(false);
    const datosCamara = ref({});
    const ultimoReporte = ref({});
    const imageList = ['frame_001.jpg', 'frame_002.jpg'];

    const imageWidth = 640;
    const imageHeight = 640;

    const boundingBoxStyle = computed(() => {
        const {
            boxx1, boxx2,
            boxy1, boxy2
        } = ultimoReporte.value;

        if (
            boxx1 === undefined || boxx2 === undefined ||
            boxy1 === undefined || boxy2 === undefined
        ) return {};

        return {
            left: `${(boxx1 / imageWidth) * 100}%`,
            top: `${(boxy1 / imageHeight) * 100}%`,
            width: `${((boxx2 - boxx1) / imageWidth) * 100}%`,
            height: `${((boxy2 - boxy1) / imageHeight) * 100}%`
        };
    });

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
                    defecto: aux.damagesToES(ultimo.class),
                    fecha: aux.formatDateToPE(ultimo.created_at),
                    boxy1: ultimo.bbox_y1,
                    boxy2: ultimo.bbox_y2,
                    boxx1: ultimo.bbox_x1,
                    boxx2: ultimo.bbox_x2
                };
            })
        
        //enviarImagen()
    }

    onMounted(() => {
        loadItems()
    })
</script>