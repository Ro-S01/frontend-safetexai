const camaraRoute = 'camaras';
const API_URL = import.meta.env.VITE_API_URL;

var camaraService = {
    async getCamaraPaginado() {
        const data = await fetch('http://localhost:3030/camaras')
            .then(res => res.json())
            .then(res => res)
            .catch(err => err);
        
        if (data.messages !== undefined) return Promise.reject(data);
        else return Promise.resolve(data);
    },

    async getCamaraPorId(camaraId) {
        const data = await fetch(`http://localhost:3030/camaras?camaraId=${camaraId}`)
            .then(res => res.json())
            .then(res => res)
            .catch(err => err);

        if (data.messages !== undefined) return Promise.reject(data);
        else return Promise.resolve(data);
    },

    async startProcess(request){
        const data = await fetch(`${API_URL}/start?${request.toString()}`, { method: "POST" })
            .then(res => res.json())
            .then(res => res)
            .catch(err => err);
        
        if (data.messages !== undefined) return Promise.reject(data);
        else return Promise.resolve(data);
    },

    async checkStatus() {
        const data = await fetch(`${API_URL}/status`)
            .then(res => res.json())
            .then(res => res)
            .catch(err => err);
        
        if (data.messages !== undefined) return Promise.reject(data);
        else return Promise.resolve(data);
    },

    async stopProcess(){
        const data = await fetch(`${API_URL}/stop`, { method: "POST" })
            .then(res => res.json())
            .then(res => res)
            .catch(err => err);
        
        if (data.messages !== undefined) return Promise.reject(data);
        else return Promise.resolve(data);
    }
}

export default camaraService;