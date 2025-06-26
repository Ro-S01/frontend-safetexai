var homeService = {
    async getInformes() {
        const data = await fetch('http://localhost:3030/cardData')
            .then(res => res.json())
            .then(res => res)
            .catch(err => err);

        if (data.messages !== undefined) return Promise.reject(data);
        else return Promise.resolve(data);
    },

    async getEstados() {
        const data = await fetch('http://localhost:3030/alertas')
            .then(res => res.json())
            .then(res => res)
            .catch(err => err);

        if (data.messages !== undefined) return Promise.reject(data);
        else return Promise.resolve(data);
    }
}

export default homeService;