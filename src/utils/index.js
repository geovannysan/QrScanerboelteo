import axios from "axios";

export const Boleto = async (id) => {
    try {
        let { data } = await axios.get("https://api.t-ickets.com/mikroti/Boleteria/Boletopdf/" + id);
        return data;
    } catch (error) {
        return error
    }
}