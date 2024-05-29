import axios from "axios";

export const Boleto = async (id) => {
    try {
        let { data } = await axios.get("https://api.t-ickets.com/mikroti/Boleteria/Boletopdf/" + id);
        return data;
    } catch (error) {
        return error
    }
}
export const Canjear = async (id, parms) => {
    try {
        let { data } = await axios.post("https://api.t-ickets.com/mikroti/Boleteria/canjeticke/" + id, parms)
        console.log(data)
        return data
    } catch (error) {
        console.log(error)
        return error
    }
}
export const LoginUser = async (parms) => {
    try {
        const { data } = await axios.post("https://api.ticketsecuador.ec/ms_login/api/v1/auth_admin", parms, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic Ym9sZXRlcmlhOmJvbGV0ZXJpYQ=='
            }
        })
        console.log( data)

        return data
    }catch(error){
        return error
    }
}

export function getUsuario() {
    try {
        const data =  JSON.parse( localStorage.getItem("user"))
        //   console.log(data)
        if(! data) return null

        return  data;

    } catch (error) {
        console.log(error)
        return null
    }
}

export const boleteriaAxios = axios.create({
    baseURL: "https://api.t-ickets.com/mikroti/",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic Ym9sZXRlcmlhOmJvbGV0ZXJpYQ=='
    },
    maxBodyLength: Infinity,
})
export const Boleteria_voucher = async (params) => {
    let ids = getUsuario() != null ? getUsuario().id : 0

    let idop = 0
    let parmspro = {
        "id_usuario": parseInt(idop),
        "id_operador": parseInt(ids),
        ...params
    }
    console.log(params)
    try {
        let { data } = await boleteriaAxios.post("/Boleteria/voucher", parmspro)
        console.log(data)
        return data
    } catch (error) {
        return error
    }
}