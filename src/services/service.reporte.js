import { supabase } from '../lib/supabaseClient.js'
import * as aux from '@/common/general.js'

var reporteService = {
    async getReportePaginado() {
        const { data: dataDetections, error } = await supabase.from('detections').select('*');

        if (error) return Promise.reject(dataDetections);
        else return Promise.resolve(dataDetections);
    },

    async enviarCaptura(request) {
        var requestOptions = {
            method: 'POST',
            body: request
        }

        var data = await fetch('https://modelo-api-advt.onrender.com/predict', requestOptions);
        return Promise.resolve(data);
    }
}

export default reporteService;