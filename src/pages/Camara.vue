<template>
    <v-container>
        <v-card class="pa-5">
            <template v-slot:title>
                <span class="font-weight-black text-h4">Listado de Camaras</span>
            </template>

            <v-container class="pa-5">
                <v-data-table :headers="headers" :items="dataList" :loading="loading" @update:options="loadItems">
                     <template v-slot:item.detalle="{ item }">
                        <div class="d-flex justify-start">
                            <v-btn variant="text" :to="`/camara-detalle/${item.camaraId}`">
                                <v-icon color="medium-emphasis" icon="mdi-text-box-outline" 
                                size="small"></v-icon>   
                            </v-btn> 
                        </div>
                    </template>
                </v-data-table>
            </v-container>
        </v-card>
    </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import camaraService from '../services/service.camara.js'

    // Data Table Headers
    const headers = [
        { title: 'N°', value: "registro" },
        { title: 'Código Cámara', value: "camara" },
        { title: 'Área', value: "area" },
        { title: 'Estado', value: "estado" },
        { title: 'Detalle', value: "detalle" },
    ];

    const dataList = ref([])
    const loading = ref(false)
    const loadItems = async () => {
        loading.value = true
        try {
            const response = await camaraService.getCamaraPaginado();

            dataList.value = response.map((item, index) => ({
                registro: index + 1,
                camaraId: item.camaraId,
                camara: item.camara,
                area: item.area,
                estado: item.estado,
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

</script>