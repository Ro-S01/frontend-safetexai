<template>
  <v-container>
    <v-card class="pa-5">
      <template #title>
        <span class="font-weight-black text-h4">Listado de Reportes</span>
      </template>

      <!-- Dropdown filter -->
      <v-select v-model="selectedPartida" :items="partidas" label="Filtrar por Partida" class="mb-4" clearable />

      <v-container class="pa-5">
        <v-data-table v-model:expanded="expanded" :headers="headers" :items="dataList" :loading="loading"
          :item-value="item => `${item.partida_id}_${item.nro_rollo}`" show-expand>
          <!-- Expanded row -->
          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="pa-0">
                <v-card flat class="pa-4 bg-grey-lighten-5">
                  <div v-if="!item.framesLoaded" class="text-center py-8">
                    <v-progress-circular indeterminate color="primary" />
                    <p class="mt-2 text-grey">Cargando detecciones...</p>
                  </div>

                  <div v-else-if="item.frames.length === 0" class="text-center py-8">
                    <v-icon size="48" color="grey">mdi-image-off</v-icon>
                    <p class="mt-2 text-grey">No hay detecciones para mostrar</p>
                  </div>

                  <div v-else>
                    <v-row dense>
                      <v-col v-for="(frame, i) in getPaginatedFrames(item)"
                        :key="`${item.partida_id}_${item.nro_rollo}_${i}`" cols="12" sm="6" md="4" lg="3"
                        class="d-flex justify-center">
                        <div class="relative w-100">
                          <div class="relative w-100" style="position: relative;">
                            <img :src="frame.url" class="rounded-lg w-100"
                              style="display:block; width:100%; height:auto;" @load="() => nextTick(() => {
                                const cRef = $refs[`canvas_${item.partida_id}_${item.nro_rollo}_${i}`];
                                const canvas = Array.isArray(cRef) ? cRef[0] : cRef;
                                drawFrame(canvas, frame);
                              })" />
                            <canvas :ref="`canvas_${item.partida_id}_${item.nro_rollo}_${i}`"
                              style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></canvas>
                          </div>
                          <div class="text-center text-caption mt-2">
                            <div v-for="(det, j) in frame.detections" :key="j">
                              <span class="font-weight-medium">{{ det.clase }}</span>
                              <span class="text-grey">— {{ formatTime(det.hora) }}</span>
                            </div>
                          </div>
                        </div>
                      </v-col>

                    </v-row>

                    <!-- Pagination -->
                    <v-pagination v-model="item.currentPage" :length="getTotalPages(item)" size="small"
                      class="mt-4 justify-center" />
                  </div>

                </v-card>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { supabase } from "../lib/supabaseClient";
import { nextTick } from "vue";

const headers = [
  { title: "# Partida", value: "partida_id" },
  { title: "# Rollo", value: "nro_rollo" },
  { title: "Huecos", value: "huecos" },
  { title: "Líneas", value: "lineas" },
  { title: "Manchas", value: "manchas" },
  { title: "Total Detecciones", value: "detecciones" },
  { title: "Inicio", value: "hora_inicio" },
  { title: "Fin", value: "hora_fin" },
  { title: "Duración", value: "duracion" },
];

const dataList = ref([]);
const partidas = ref([]);
const selectedPartida = ref(null);
const expanded = ref([]);
const loading = ref(false);
const ITEMS_PER_PAGE = 8;

const classColors = { hueco: 'red', linea: 'orange', mancha: 'purple' };
const getClassColor = (c) => classColors[c?.toLowerCase()] || 'blue';

const getUniqueClases = (frames) => {
  const set = new Set();
  frames.forEach(f => f.detections.forEach(d => set.add(d.clase)));
  return ['Todos', ...[...set].sort()];
};

const getFilteredFrames = (item) => {
  let frames = [...item.frames];
  if (item.selectedClase && item.selectedClase !== 'Todos')
    frames = frames.filter(f => f.detections.some(d => d.clase === item.selectedClase));
  if (item.searchTerm) {
    const term = item.searchTerm.toLowerCase();
    frames = frames.filter(f =>
      f.frame.toLowerCase().includes(term) ||
      f.detections.some(d => d.clase.toLowerCase().includes(term))
    );
  }
  return frames;
};
function formatTime(hora) {
  if (!hora) return "";
  const date = new Date(hora);
  return isNaN(date) ? hora : date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const getPaginatedFrames = (item) => {
  const f = getFilteredFrames(item);
  const start = ((item.currentPage || 1) - 1) * ITEMS_PER_PAGE;
  return f.slice(start, start + ITEMS_PER_PAGE);
};

const getTotalPages = (item) => Math.ceil(getFilteredFrames(item).length / ITEMS_PER_PAGE);

const loadPartidas = async () => {
  const { data, error } = await supabase
    .from("vw_reporte_detecciones")
    .select("partida_id")
    .order("partida_id", { ascending: true });
  if (!error) partidas.value = [...new Set(data.map(d => d.partida_id))];
};

const loadReports = async () => {
  loading.value = true;
  try {
    let query = supabase.from("vw_reporte_detecciones").select("*");
    if (selectedPartida.value) query = query.eq("partida_id", selectedPartida.value);
    const { data, error } = await query;
    if (error) throw error;

    dataList.value = data.map(item => ({
      ...item,

      frames: [],
      framesLoaded: false,
      searchTerm: '',
      selectedClase: 'Todos',
      currentPage: 1
    }));
    console.log("Reports loaded:", dataList.value.length);
    console.log(data);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadFrames = async (report) => {
  console.log("Loading frames for", report.partida_id, report.nro_rollo);
  loading.value = true;

  try {
    // 1️⃣ Fetch detections for the selected partida + rollo
    const { data, error } = await supabase
      .from("detecciones")
      .select("id, frame, clase, coordenadas, hora")
      .eq("partida_id", report.partida_id)
      .eq("nro_rollo", report.nro_rollo)
      .not("clase", "in", '("inicio","fin")')
      .order("hora", { ascending: true });


    if (error) throw error;
    if (!data || data.length === 0) {
      console.warn("No detections for", report.partida_id, report.nro_rollo);
      report.frames = [];
      report.framesLoaded = true;
      return;
    }

    console.log("Detections fetched:", data.length);

    const framesMap = {};
    for (const det of data) {
      if (!framesMap[det.frame]) framesMap[det.frame] = [];
      framesMap[det.frame].push(det);
    }

    const frames = [];
    for (const frameName of Object.keys(framesMap)) {
      let publicUrl;

      if (frameName.startsWith("http")) {
        publicUrl = frameName;
      } else {
        const { data: urlData, error: urlError } = supabase.storage
          .from("frames")
          .getPublicUrl(frameName);
        if (urlError) {
          console.error("URL error for frame", frameName, urlError);
          continue;
        }
        publicUrl = urlData?.publicUrl;
      }

      if (!publicUrl) {
        console.warn("No public URL for", frameName);
        continue;
      }

      frames.push({
        frame: frameName,
        url: publicUrl,
        detections: framesMap[frameName],
      });
    }

    report.frames = frames;
    report.framesLoaded = true;
    console.log("Frames ready:", frames.length);
  } catch (err) {
    console.error("Error loading frames:", err);
  } finally {
    loading.value = false;
  }
};

function colorToRgba(color, alpha = 0.3) {
  const map = {
    red: "rgba(255,0,0," + alpha + ")",
    orange: "rgba(255,165,0," + alpha + ")",
    purple: "rgba(128,0,128," + alpha + ")",
    blue: "rgba(0,0,255," + alpha + ")",
  };
  return map[color] || `rgba(0,0,0,${alpha})`;
}

function drawFrame(canvas, frameData) {
  if (!canvas || !frameData.url) return;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = frameData.url;

  img.onload = () => {
    setTimeout(() => {
      const vImg = canvas.parentElement.querySelector("img");
      if (!vImg) return;
      const rect = vImg.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameData.detections.forEach(det => {
        const coords = det.coordenadas;
        if (!coords?.length) return;
        ctx.beginPath();
        ctx.moveTo(coords[0][0] * scaleX, coords[0][1] * scaleY);
        for (let i = 1; i < coords.length; i++)
          ctx.lineTo(coords[i][0] * scaleX, coords[i][1] * scaleY);
        ctx.closePath();
        const color = getClassColor(det.clase);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        const rgba = colorToRgba(color, 0.25);
        ctx.fillStyle = rgba;
        ctx.fill();

        ctx.fillStyle = color;
        ctx.font = "12px Arial";
        ctx.fillText(det.clase, coords[0][0] * scaleX, coords[0][1] * scaleY - 5);
      });
    }, 100);
  };
}

watch(expanded, (newExpanded) => {
  console.log("Expanded changed:", newExpanded);
  newExpanded.forEach(key => {
    const report = dataList.value.find(
      r => `${r.partida_id}_${r.nro_rollo}` === key
    );
    if (report && !report.framesLoaded) loadFrames(report);
  });
});

watch(selectedPartida, () => loadReports());

onMounted(() => {
  loadPartidas();
  loadReports();
});
</script>