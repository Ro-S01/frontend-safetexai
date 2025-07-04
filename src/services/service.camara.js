const camaraRoute = 'camaras';

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
    }
}

export default camaraService;