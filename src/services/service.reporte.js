import { supabase } from '../lib/supabaseClient.js'

const filePath = {
    route: ""
}

var reporteService = {
    async getReportePaginado() {
        const { data: dataDetections, error } = await supabase.from('detections').select('*');
        
        if (error) return Promise.reject(dataDetections);
        else return Promise.resolve(dataDetections);
    }
}

export default reporteService;