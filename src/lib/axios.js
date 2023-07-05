import axios from 'axios'

const api = axios.create({
    baseURL: 'https://servernodemailer-production.up.railway.app'
})

export default api;