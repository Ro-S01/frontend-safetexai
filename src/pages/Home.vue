<template>
    <v-container>
        <v-row>
            <v-col cols-md-12>
                <v-card
                    class="mx-auto"
                    prepend-avatar="https://cdn.vuetifyjs.com/images/john.jpg"
                    subtitle="Jefe de Control de Calidad"
                    title="Robert Speedwagon">
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols-md-4>
                <v-card
                    class="mx-auto"
                    max-width="100%"
                    v-if="informeData"
                >
                    <v-card-item>
                        <v-card-title class="font-weight-bold">
                            N° Reportes
                        </v-card-title>
                        <v-card-text class="text-h4 text-black-2 pa-0">
                            <v-icon icon="mdi-clipboard-text-outline" size="tiny" class="pb-1"></v-icon>
                            {{informeData.totalReportes}}
                        </v-card-text>          
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols-md-4>
                <v-card
                    class="mx-auto"
                    max-width="100%"
                    v-if="informeData"        
                >                 
                    <v-card-item>
                        <v-card-title class="font-weight-bold">
                            N° Cámaras Activas
                        </v-card-title>
                        <v-card-text class="text-h4 text-black-2 pa-0">
                            <v-icon icon="mdi-camera-outline" size="tiny" class="pb-1"></v-icon>
                            {{informeData.totalCamActivas}}
                        </v-card-text>          
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols-md-4>
                <v-card
                    class="mx-auto"
                    max-width="100%"
                    v-if="informeData"
                >
                    <v-card-item>
                        <v-card-title class="font-weight-bold">
                            N° Advertencias
                        </v-card-title>
                        <v-card-text class="text-h4 text-black-2 pa-0">
                            <v-icon icon="mdi-alert-outline" size="tiny" class="pb-2"></v-icon>
                            {{informeData.totalAdvertencias}}
                        </v-card-text>          
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols-md-12>
                <v-card class="pa-5">
                    <template v-slot:title>
                        <span class="font-weight-black text-h4">Listado de Camaras</span>
                    </template>

                    <v-container class="pa-5">
                        <v-data-table 
                        :headers="headers" 
                        :items="dataList" 
                        :loading="loading" 
                        @update:options="loadItems"
                        >
                            <template v-slot:item.detalle="{ item }">
                            </template>
                        </v-data-table>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import homeService from '@/services/service.home';

    // Data Table Headers
    const headers = [
        { title: 'N°', value: "registro" },
        { title: 'Código Cámara', value: "camara" },
        { title: 'Condición', value: "condicion" },
        { title: 'Estado', value: "estado" }
    ];
    const loadItems = (options) => {
        //console.log("Table options changed:", options);
        // You can add pagination, sorting logic here
    };

    const dataList = ref([]);
    const informeData = ref(null);
    const loading = ref(false);

    const loadEstados = async () => {
        loading.value = true
        try {
            const response = await homeService.getEstados();
            dataList.value = response.map((item, index) => ({
                registro: index + 1,
                camara: item.camara,
                condicion: item.condicion,
                estado: item.estado
            }));
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            loading.value = false
        }
    }

    const loadCards = async () => {
        loading.value = true;
        try {
            const response = await homeService.getInformes();
            informeData.value = response;
            //console.log(response);
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            loading.value = false
        }
    }

    // Load once component is mounted
    onMounted(() => {
        loadEstados();
        loadCards();
    })
</script>