<template>
  <v-container>
    <v-card class="pa-5">
      <template #title>
        <span class="font-weight-black text-h4">Información de la Cámara</span>
      </template>

      <v-container class="pa-4">
        <v-row>
          <v-col cols="7">
            <v-img
              aspect-ratio="16/9"
              :src="latestImageUrl"
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
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import camaraService from "../services/service.camara.js";
import reporteService from "../services/service.reporte.js";
import * as aux from "@/common/general.js";
import { supabase } from "../lib/supabaseClient";

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

const imageWidth = 640;
const imageHeight = 640;

const boundingBoxStyle = computed(() => {
  const { boxx1, boxx2, boxy1, boxy2 } = ultimoReporte.value;
  if (
    boxx1 === undefined ||
    boxx2 === undefined ||
    boxy1 === undefined ||
    boxy2 === undefined
  )
    return {};
  return {
    left: `${(boxx1 / imageWidth) * 100}%`,
    top: `${(boxy1 / imageHeight) * 100}%`,
    width: `${((boxx2 - boxx1) / imageWidth) * 100}%`,
    height: `${((boxy2 - boxy1) / imageHeight) * 100}%`,
  };
});

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
    console.log("Latest detection data:", data.clase, error);
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

    // Load from Supabase instead of service
    await loadLatestDetection();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const apiBase = "http://192.168.100.131:8000";

async function startProcess() {
  // Validate before starting
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

    formData.append("file", selectedImage.value[0]);

    // TODO: Replace with your actual API endpoint

    const res = await fetch(`${apiBase}/upload`, {
      method: "POST",

      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    statusMessage.value = "Imagen subida exitosamente";

    statusColor.value = "success";

    selectedImage.value = null;
  } catch (err) {
    console.error("Error uploading image:", err);

    statusMessage.value = `Error al subir la imagen: ${err.message}`;

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
