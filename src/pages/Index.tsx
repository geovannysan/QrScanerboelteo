import { IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonPage } from "@ionic/react";
import { UserPreferences } from "../Controller";
import { useEffect, useState } from "react";
import { LoginUser } from "../utils";
import { jwtDecode } from "jwt-decode";
import { useHistory } from "react-router";

export default function Login() {
    let historu = useHistory();

    const userPreferences = new UserPreferences();
    const [credenciales, setnombre] = useState({
        username: '',
        password: '',
    });

    const [loader, setloader] = useState(false);
    const handleChange = (target: any) => {
        setnombre({
            ...credenciales,
            [target.name]: target.value
        })
    }
    async function loadUser() {
        const user = await userPreferences.getUser();
        return user
    }
    const handleSubmit = async (event: any) => {
        setloader(true)
        event.preventDefault();
        const pass: any = document.getElementById("password")
        try {

            userPreferences.username = credenciales.username.trim()
            userPreferences.password = credenciales.password.trim()
            const data: any = await LoginUser({ username: credenciales.username.trim(), password: pass.value.trim() })
            if (data.success) {
                const user: any = jwtDecode(data.token)

                userPreferences.setUser({ ...user })
                historu.replace("/home")
                setloader(false)
                return
            } else {
                alert(data.message)
                setloader(false)
                return
            }
        } catch (err) {
            alert("Hubu un error inesperado")
            setloader(false)
        }
    };
    useEffect(() => {
        loadUser().then((user: any) => {
            if (user) {
                historu.push("/home")
            }
        })

    }, [])
    return (
        <IonPage>
            <IonContent fullscreen>

                <div className='container-fluid  h-100  d-flex justify-content-center align-items-center'
                >
                    <div className='container  d-flex justify-content-center '>
                        <div className=' col-12 col-md-4 justify-content-center'>
                            <div className='col-12'>

                            </div>
                            <div className="  col-sm-12">
                                <label className="form-label d-none"></label>
                                <input type="text"
                                    placeholder='Cédula' className="form-control d-none" name="cedula"


                                    required />
                                <IonItem className='iteminput  '>
                                    <IonLabel position="floating">Username</IonLabel>
                                    <IonInput type="text"
                                        placeholder='username' name="username"
                                        value={credenciales.username}
                                        onIonChange={e => handleChange(e.target)}

                                        required
                                    >
                                    </IonInput>
                                </IonItem>

                            </div>
                            <div className="col-sm-12  py-1">

                                <IonItem className='iteminput '
                                    style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "end" }}
                                >
                                    <IonLabel position="floating">Contraseña</IonLabel>
                                    <IonInput
                                        id='password'
                                        value={credenciales.password}
                                        onIonChange={(e) => handleChange(e.target)}
                                        type='password'
                                        placeholder='password' name="password"
                                    ></IonInput>
                                    <IonIcon
                                        className="ion-text-end"
                                        slot="end"
                                        color='white'

                                        style={{ paddigTop: '100px' }}

                                    />

                                </IonItem>
                            </div>
                            <div className='col-12 d-flex justify-content-center pt-3'>
                                <IonButton className='btn col-12  ' onClick={handleSubmit} disabled={loader}> Iniciar </IonButton >

                            </div>
                        </div>
                    </div>




                </div >
            </IonContent>
        </IonPage>
    )
}