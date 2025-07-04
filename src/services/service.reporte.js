import { supabase } from '../lib/supabaseClient.js'
import * as aux from '@/common/general.js'

var reporteService = {
    async getReportePaginado() {
        const { data: dataDetections, error } = await supabase.from('detections').select('*');

        if (error) return Promise.reject(dataDetections);
        else return Promise.resolve(dataDetections);
    },

    async fileToBase64(imagen) {
        const reader = new FileReader();
        reader.readAsDataURL(imagen);

        return new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result)
            reader.onerror = error => reject(error)
        })
    },

    async enviarCaptura(request) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }

        // var requestOptions = {
        //     method: 'POST',
        //     headers: corsHeaders,
        //     body: request
        // }

        // var data = await fetch('https://modelo-api-advt.onrender.com/predicts', requestOptions);
        // return Promise.resolve(data);

        const { data, error } = await supabase.functions.invoke('predict-image', {
            headers: corsHeaders,
            body: {
                imageData: request,
                fileName: 'frame_002.jpg'
            }
        });

        if (error) return Promise.reject(data);
        else return Promise.resolve(data);
    }
}

export default reporteService;