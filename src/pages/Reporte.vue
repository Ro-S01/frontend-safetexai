<template>
    <v-container>
        <v-card class="pa-5">
            <template v-slot:title>
                <span class="font-weight-black text-h4">Listado de Reportes</span>
            </template>

            <v-container class="pa-5">
                <span class="mb-3">Cámara</span>
                <v-row>
                    <v-col sm="5" md="4">
                        <v-select :items="items" label="Seleccionar">
                        </v-select>
                    </v-col>
                </v-row>

                <v-data-table :headers="headers" :items="dataList" :loading="loading" @update:options="loadItems">
                     <template v-slot:item.detalle="{ item }">
                        <div class="d-flex justify-start">
                            <v-btn variant="text" @click="view(item)">
                                <v-icon color="medium-emphasis" icon="mdi-text-box-outline" 
                                size="small"></v-icon>
                            </v-btn>
                        </div>
                    </template>
                </v-data-table>
            </v-container>
        </v-card>
    </v-container>

    <!-- Modal Detalle del Reporte -->
    <v-dialog v-model="dialog" :activator="activator" max-width="400">
        <v-card class="pa-2">
            <v-card-title class="font-weight-black text-h5">
                Información del Reporte
            </v-card-title>
            <v-card-text class="pb-0 pt-0">
                Fecha y hora: {{detalleReporteModal.fecha}}
            </v-card-text>
            <v-card-text class="pb-0 pt-1">
                N° Reporte: {{detalleReporteModal.reporte}}
            </v-card-text>
            <v-card-text class="pb-0 pt-1">
                Defecto: {{detalleReporteModal.defecto}}
            </v-card-text>
            <v-card-text class="pb-0 pt-1">
                Cámara: {{detalleReporteModal.camara}}
            </v-card-text>
            <v-card-text class="pb-0 pt-1">
                Indice de confidencia: {{detalleReporteModal.confidencia}}
            </v-card-text>
            <template v-slot:actions>
                <v-spacer></v-spacer>
                <v-btn variant="flat" color="black" class="text-none" text @click="dialog = false">Cerrar</v-btn>
            </template>
        </v-card>
    </v-dialog>
</template>

<script setup>
    import { ref, shallowRef, onMounted } from 'vue'
    import reporteService from '../services/service.reporte.js'
    import * as aux from '@/common/general.js'

    // Combo Box
    const items = ['TODOS', 'CAM01']
    // Data Table Headers
    const headers = [
        { title: 'N°', value: "registro" },
        { title: 'ID Reporte', value: "reporteId" },
        { title: 'Tipo Defecto', value: "defecto" },
        { title: 'Camara', value: "camara" },
        { title: 'Fecha y Hora', value: "fecha" },
        { title: 'Detalle', value: "detalle" },
    ];

    const detalleReporteModal = ref({
        fecha: '',
        reporte: '',
        defecto: '',
        camara: '',
        confidencia: ''
    });

    const dataList = ref([]);
    const loading = ref(false);

    const dialog = ref(false);
    const activator = ref(null);
    const selected = ref()

    const loadItems = async () => {
        loading.value = true
        try {
            const response = await reporteService.getReportePaginado();
            
            dataList.value = response.map((item, index) => ({
                id: item.id,
                registro: index + 1,
                reporteId: item.detection_id,
                defecto: aux.damagesToES(item.class),
                camara: aux.mainCamera,
                confidencia: item.confidence,
                fecha: aux.formatDateToPE(item.created_at)
            }))
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            loading.value = false
        }
    }

    onMounted(() => {
        loadItems()
    })

    function view(item) {
        selected.value = item.id;
        dialog.value = true;
        detalleReporteModal.value = {
            fecha: item.fecha,
            reporte: item.reporteId,
            defecto: item.defecto,
            camara: aux.mainCamera,
            confidencia: item.confidencia
        };
    }

</script>