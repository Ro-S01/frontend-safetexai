<template>
  <v-container>
    <v-card class="pa-5">
      <template #title>
        <span class="font-weight-black text-h4">Información de la Cámara</span>
      </template>

      <v-container class="pa-4">
        <v-row>
          <v-col cols="12">
            <div class="image-container">
              <v-img
                aspect-ratio="16/9"
                :src="latestImageUrl"
                id="telaCaptura"
                class="bounding-box-img"
                @load="onImageLoad"
              >
              </v-img>
              <!-- Move SVG outside v-img -->
              <svg
                v-if="detectedPolygons.length > 0"
                class="polygon-overlay"
                :viewBox="`0 0 ${imageWidth} ${imageHeight}`"
                preserveAspectRatio="none"
              >
                <!-- Draw all detected polygons -->
                <polygon
                  v-for="(detection, index) in detectedPolygons"
                  :key="index"
                  :points="formatPolygonPoints(detection.polygon)"
                  :class="`polygon-${detection.class}`"
                  class="detection-polygon"
                />
                
                <!-- Draw rotation indicator line from center -->
                <line
                  v-for="(detection, index) in detectedPolygons"
                  :key="`angle-${index}`"
                  :x1="getPolygonCenter(detection.polygon).x"
                  :y1="getPolygonCenter(detection.polygon).y"
                  :x2="getAngleEndPoint(detection.polygon).x"
                  :y2="getAngleEndPoint(detection.polygon).y"
                  class="angle-indicator"
                  :class="`polygon-${detection.class}`"
                />
                
                <!-- Draw center point -->
                <circle
                  v-for="(detection, index) in detectedPolygons"
                  :key="`center-${index}`"
                  :cx="getPolygonCenter(detection.polygon).x"
                  :cy="getPolygonCenter(detection.polygon).y"
                  r="5"
                  class="center-point"
                  :class="`polygon-${detection.class}`"
                />
                
                <!-- Draw labels with angle -->
                <text
                  v-for="(detection, index) in detectedPolygons"
                  :key="`label-${index}`"
                  :x="detection.polygon[0][0]"
                  :y="detection.polygon[0][1] - 10"
                  class="detection-label"
                >
                  {{ detection.class }} ({{ (detection.score * 100).toFixed(0) }}%) - {{ getRotationAngle(detection.polygon).toFixed(1) }}°
                </text>
              </svg>
            </div>
          </v-col>

          <v-col cols="12" md="5">
            <v-card-text class="text-h5 font-weight-black pa-0"
              >Cámara</v-card-text
            >
            <v-card-text class="text-h5 pa-0 mb-3">CAM001</v-card-text>

            <v-card-text class="text-h5 font-weight-black pa-0"
              >Área</v-card-text
            >
            <v-card-text class="text-h5 pa-0 mb-3">A1</v-card-text>

            <v-card-text class="text-h5 font-weight-black pa-0"
              >Cinta</v-card-text
            >
            <v-card-text class="text-h5 pa-0 mb-3">CNT01</v-card-text>

            <v-card-text class="text-h5 font-weight-black pa-0"
              >Último reporte</v-card-text
            >
            <v-card-text
              class="text-h5 pt-2 pb-2 pr-3 report-border"
              id="txtDefecto"
            >
              Defecto: {{ ultimoReporte.defecto }}
            </v-card-text>
            <v-card-text class="text-h5 pt-2 pb-2 pr-3 mb-3 report-border">
              Fecha y Hora: {{ ultimoReporte.fecha }}
            </v-card-text>

            <v-divider class="my-3"></v-divider>
            <v-card-text class="text-h5 font-weight-black pa-0 mb-2">
              Control del Sistema
            </v-card-text>

            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="params.partida"
                  :items="partidasDisponibles"
                  label="Partida"
                  :loading="loadingPartidas"
                  @update:model-value="onPartidaChange"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="params.roll"
                  :items="rollosDisponibles"
                  label="Rollo"
                  :disabled="!params.partida"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="params.interval"
                  label="Intervalo (s)"
                  type="number"
                  step="0.1"
                  min="0.1"
                  :rules="intervalRules"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="params.threshold"
                  label="Umbral"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1"
                  :rules="thresholdRules"
                />
              </v-col>

              <!-- Resolution Controls with Aspect Ratio Lock -->
              <v-col cols="12">
                <v-checkbox
                  v-model="lockAspectRatio"
                  label="Mantener proporción (16:9)"
                  density="compact"
                ></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="params.width"
                  label="Ancho (px)"
                  type="number"
                  min="320"
                  step="16"
                  :rules="widthRules"
                  @input="onWidthChange"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="params.height"
                  label="Alto (px)"
                  type="number"
                  min="180"
                  step="9"
                  :rules="heightRules"
                  @input="onHeightChange"
                />
              </v-col>
            </v-row>

            <v-row class="mt-1">
              <v-col cols="12" class="d-flex justify-space-between">
                <v-btn
                  color="green"
                  @click="startProcess"
                  :loading="loadingStart"
                  >Iniciar</v-btn
                >
                <v-btn color="red" @click="stopProcess" :loading="loadingStop"
                  >Detener</v-btn
                >
                <v-btn
                  color="blue"
                  @click="checkStatus"
                  :loading="loadingStatus"
                  >Estado</v-btn
                >
              </v-col>
            </v-row>

            <v-row class="mt-3">
              <v-col cols="12">
                <v-file-input
                  v-model="selectedImage"
                  label="Subir imagen"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  show-size
                  clearable
                ></v-file-input>
              </v-col>

              <v-col cols="12">
                <v-btn
                  color="primary"
                  block
                  @click="uploadImage"
                  :loading="loadingUpload"
                  :disabled="!selectedImage"
                >
                  Enviar Imagen
                </v-btn>
              </v-col>
            </v-row>
            <v-alert
              v-if="statusMessage"
              class="mt-3"
              :type="statusColor"
              variant="tonal"
            >
              {{ statusMessage }}
            </v-alert>

            <!-- Debug info -->
            <v-card v-if="detectedPolygons.length > 0" class="mt-3 pa-2" variant="outlined">
              <small>Detecciones: {{ detectedPolygons.length }}</small>
              <br>
              <small>Dimensiones imagen: {{ imageWidth }}x{{ imageHeight }}</small>
            </v-card>

            <v-card-actions class="justify-content-end pa-0 mt-4">
              <v-btn
                size="large"
                variant="outlined"
                color="black"
                class="text-none"
                to="/camara"
                >Regresar</v-btn
              >
              <v-btn
                size="large"
                variant="flat"
                color="black"
                class="text-none"
                to="/reporte"
                >Ver Reporte</v-btn
              >
            </v-card-actions>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
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

/* Image container for positioning */
.image-container {
  position: relative;
  width: 100%;
}

.bounding-box-img {
  position: relative;
  width: 100%;
  height: auto;
  display: block;
}

/* Polygon overlay */
.polygon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.detection-polygon {
  fill: rgba(255, 0, 0, 0.25);
  stroke: red;
  stroke-width: 5;
  transition: all 0.3s ease;
}

.detection-polygon:hover {
  fill: rgba(255, 0, 0, 0.4);
  stroke-width: 7;
}

/* Different colors for different classes */
.polygon-line {
  fill: rgba(255, 0, 0, 0.25);
  stroke: #ff0000;
  stroke-width: 5;
}

.polygon-hole {
  fill: rgba(255, 165, 0, 0.25);
  stroke: #ffa500;
  stroke-width: 5;
}

.polygon-stain {
  fill: rgba(139, 69, 19, 0.25);
  stroke: #8b4513;
  stroke-width: 5;
}

/* Angle indicator line */
.angle-indicator {
  stroke-width: 4;
  stroke-linecap: round;
  pointer-events: none;
}

.angle-indicator.polygon-line {
  stroke: #ff0000;
}

.angle-indicator.polygon-hole {
  stroke: #ffa500;
}

.angle-indicator.polygon-stain {
  stroke: #8b4513;
}

/* Center point */
.center-point {
  pointer-events: none;
}

.center-point.polygon-line {
  fill: #ff0000;
  stroke: white;
  stroke-width: 2;
}

.center-point.polygon-hole {
  fill: #ffa500;
  stroke: white;
  stroke-width: 2;
}

.center-point.polygon-stain {
  fill: #8b4513;
  stroke: white;
  stroke-width: 2;
}

.detection-label {
  fill: white;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 1), -1px -1px 2px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}
</style>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import camaraService from "../services/service.camara.js";
import reporteService from "../services/service.reporte.js";
import * as aux from "@/common/general.js";
import { supabase } from "../lib/supabaseClient";

const detectedPolygons = ref([]);
const imageWidth = ref(640);
const imageHeight = ref(640);

// Helper functions for polygon rendering
function formatPolygonPoints(polygon) {
  if (!polygon || !Array.isArray(polygon)) {
    console.warn("Invalid polygon data:", polygon);
    return "";
  }
  return polygon.map((point) => `${point[0]},${point[1]}`).join(" ");
}

function getPolygonCenter(polygon) {
  if (!polygon || polygon.length === 0) return { x: 0, y: 0 };
  const sumX = polygon.reduce((sum, point) => sum + point[0], 0);
  const sumY = polygon.reduce((sum, point) => sum + point[1], 0);
  return {
    x: sumX / polygon.length,
    y: sumY / polygon.length
  };
}

function getRotationAngle(polygon) {
  if (!polygon || polygon.length < 2) return 0;
  
  // Calculate angle from first edge (point 0 to point 1)
  const dx = polygon[1][0] - polygon[0][0];
  const dy = polygon[1][1] - polygon[0][1];
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  // Normalize to 0-180 range
  if (angle < 0) angle += 180;
  
  return angle;
}

function getAngleEndPoint(polygon) {
  const center = getPolygonCenter(polygon);
  const angle = getRotationAngle(polygon);
  
  // Calculate a line extending from center in the direction of rotation
  const length = 40; // Length of the angle indicator line
  const radians = angle * (Math.PI / 180);
  
  return {
    x: center.x + length * Math.cos(radians),
    y: center.y + length * Math.sin(radians)
  };
}

// Add image load handler to get actual dimensions
const onImageLoad = (event) => {
  const img = event.target;
  if (img) {
    imageWidth.value = img.naturalWidth || 640;
    imageHeight.value = img.naturalHeight || 640;
    console.log("Image dimensions:", imageWidth.value, imageHeight.value);
  }
};

const route = useRoute();
const camaraId = route.params.camaraId;
const loading = ref(false);
const datosCamara = ref({});
const ultimoReporte = ref({});
const latestImageUrl = ref("/images/input/frame_001.jpg");

// Supabase data
const partidasDisponibles = ref([]);
const rollosDisponibles = ref([]);
const loadingPartidas = ref(false);
const lockAspectRatio = ref(true);
const aspectRatio = 16 / 9;
const updatingResolution = ref(false);

// API parameters
const params = ref({
  partida: null,
  roll: null,
  interval: 1.0,
  threshold: 0.5,
  width: 1920,
  height: 1080,
});

// UI state
const loadingStart = ref(false);
const loadingStop = ref(false);
const loadingStatus = ref(false);
const loadingUpload = ref(false);
const selectedImage = ref(null);
const statusMessage = ref("");
const statusColor = ref("info");

// Validation rules
const intervalRules = [
  (v) => v > 0 || "El intervalo debe ser mayor a 0",
  (v) => v >= 0.1 || "El intervalo mínimo es 0.1 segundos",
];

const thresholdRules = [
  (v) => v >= 0.01 || "El umbral mínimo es 0.01",
  (v) => v <= 1 || "El umbral máximo es 1",
  (v) => (v >= 0.01 && v <= 1) || "El umbral debe estar entre 0.01 y 1",
];

const widthRules = [
  (v) => v > 0 || "El ancho debe ser mayor a 0",
  (v) => v >= 320 || "El ancho mínimo es 320px",
];

const heightRules = [
  (v) => v > 0 || "El alto debe ser mayor a 0",
  (v) => v >= 180 || "El alto mínimo es 180px",
];

// Maintain aspect ratio
function onWidthChange(event) {
  if (lockAspectRatio.value && !updatingResolution.value) {
    updatingResolution.value = true;
    const width = parseInt(event.target.value) || params.value.width;
    params.value.height = Math.round(width / aspectRatio);
    setTimeout(() => {
      updatingResolution.value = false;
    }, 0);
  }
}

function onHeightChange(event) {
  if (lockAspectRatio.value && !updatingResolution.value) {
    updatingResolution.value = true;
    const height = parseInt(event.target.value) || params.value.height;
    params.value.width = Math.round(height * aspectRatio);
    setTimeout(() => {
      updatingResolution.value = false;
    }, 0);
  }
}

// Load partidas from Supabase
async function loadPartidas() {
  loadingPartidas.value = true;
  try {
    const { data, error } = await supabase
      .from("partida")
      .select("id")
      .order("id", { ascending: true });

    if (error) throw error;

    partidasDisponibles.value = data.map((p) => p.id);
  } catch (err) {
    console.error("Error loading partidas:", err);
    statusMessage.value = "Error al cargar partidas";
    statusColor.value = "error";
  } finally {
    loadingPartidas.value = false;
  }
}

// Load rollos based on selected partida
async function onPartidaChange(partidaId) {
  console.log("Selected partida:", partidaId);
  if (!partidaId) {
    rollosDisponibles.value = [];
    return;
  }

  try {
    const { data, error } = await supabase
      .from("partida")
      .select("rollos")
      .eq("id", partidaId)
      .single();

    if (error) throw error;
    console.log("Rollos data:", data);
    const numRollos = data.rollos || 0;
    rollosDisponibles.value = Array.from(
      { length: numRollos },
      (_, i) => i + 1
    );
    params.value.roll =
      rollosDisponibles.value.length > 0 ? rollosDisponibles.value[0] : null;
  } catch (err) {
    console.error("Error loading rollos:", err);
    rollosDisponibles.value = [];
  }
}

// Load latest detection from Supabase
async function loadLatestDetection() {
  try {
    const { data, error } = await supabase
      .from("detecciones")
      .select("partida_id,nro_rollo,frame, clase, hora, coordenadas")
      .order("hora", { ascending: false })
      .not("clase", "eq", "fin")
      .not("clase", "eq", "inicio")
      .limit(1)
      .single();
    console.log("Latest detection data:", data, error);
    
    if (error) throw error;

    if (data) {
      latestImageUrl.value = data.frame || "/images/input/frame_001.jpg";
      ultimoReporte.value = {
        defecto: aux.damagesToES(data.clase),
        fecha: aux.formatDateToPE(data.hora),
        boxy1: data.coordenadas,
      };
    }
  } catch (err) {
    console.error("Error loading latest detection:", err);
  }
}

const loadItems = async () => {
  loading.value = true;
  try {
    const camara = await camaraService.getCamaraPorId(camaraId);
    datosCamara.value = camara?.[0] || {};

    await loadLatestDetection();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const apiBase = "http://192.168.100.131:8000";

async function startProcess() {
  if (params.value.threshold < 0.01 || params.value.threshold > 1) {
    statusMessage.value = "Umbral debe estar entre 0.01 y 1";
    statusColor.value = "error";
    return;
  }

  if (params.value.interval < 0.1) {
    statusMessage.value = "Intervalo debe ser al menos 0.1 segundos";
    statusColor.value = "error";
    return;
  }

  loadingStart.value = true;
  try {
    const query = new URLSearchParams({
      partida: params.value.partida,
      roll: params.value.roll,
      interval: params.value.interval,
      threshold: params.value.threshold,
      width: params.value.width,
      height: params.value.height,
    });
    const res = await fetch(`${apiBase}/start?${query.toString()}`, {
      method: "POST",
    });
    const data = await res.json();
    statusMessage.value = `Proceso iniciado: ${data.status}`;
    statusColor.value = "success";
  } catch {
    statusMessage.value = "Error al iniciar el proceso";
    statusColor.value = "error";
  } finally {
    loadingStart.value = false;
  }
}

async function stopProcess() {
  loadingStop.value = true;
  try {
    const res = await fetch(`${apiBase}/stop`, { method: "POST" });
    const data = await res.json();
    statusMessage.value = `Proceso detenido: ${data.status}`;
    statusColor.value = "warning";
  } catch {
    statusMessage.value = "Error al detener el proceso";
    statusColor.value = "error";
  } finally {
    loadingStop.value = false;
  }
}

async function checkStatus() {
  loadingStatus.value = true;
  try {
    const res = await fetch(`${apiBase}/status`);
    const data = await res.json();
    statusMessage.value =
      data.status === "running"
        ? `En ejecución (PID: ${data.pid})`
        : "Detenido";
    statusColor.value = data.status === "running" ? "info" : "grey";
  } catch {
    statusMessage.value = "No se pudo obtener el estado";
    statusColor.value = "error";
  } finally {
    loadingStatus.value = false;
  }
}

async function uploadImage() {
  if (!selectedImage.value || selectedImage.value.length === 0) {
    statusMessage.value = "Por favor seleccione una imagen";
    statusColor.value = "warning";
    return;
  }

  loadingUpload.value = true;

  try {
    const formData = new FormData();
    const file = Array.isArray(selectedImage.value)
      ? selectedImage.value[0]
      : selectedImage.value;

    formData.append("file", file);

    console.log("Uploading file:", file.name, file.type, file.size);

    const res = await fetch(
      "https://oops-pad-definitions-filtering.trycloudflare.com/infer",
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("Detecciones recibidas:", data);

    if (data.polygons && data.polygons.length > 0) {
      detectedPolygons.value = data.polygons;
      console.log("Polygons set:", detectedPolygons.value);

      const topDetection = data.polygons[0];

      ultimoReporte.value = {
        defecto: aux.damagesToES(topDetection.class),
        fecha: new Date().toLocaleString(),
      };

      statusMessage.value = `✓ ${data.count} defecto(s) detectado(s)`;
      statusColor.value = "success";

      const reader = new FileReader();
      reader.onload = (e) => {
        latestImageUrl.value = e.target.result;
        // Wait for image to load to get dimensions
        const img = new Image();
        img.onload = () => {
          imageWidth.value = img.naturalWidth;
          imageHeight.value = img.naturalHeight;
          console.log("Updated image dimensions:", imageWidth.value, imageHeight.value);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      detectedPolygons.value = [];
      statusMessage.value = "No se detectaron defectos";
      statusColor.value = "info";
    }

    selectedImage.value = null;
  } catch (err) {
    console.error("Error completo:", err);
    statusMessage.value = `Error: ${err.message}`;
    statusColor.value = "error";
  } finally {
    loadingUpload.value = false;
  }
}

onMounted(() => {
  loadItems();
  loadPartidas();
});
</script>