import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonToolbar } from "@ionic/react";
import Firmas from "./Firma";
import { close } from "ionicons/icons";
import { useEffect } from "react";

interface ModalCanjeProps {
    showModalFir: any;
    setModalFir: React.Dispatch<React.SetStateAction<boolean>>;
    datosScn: any; // Ajusta el tipo según corresponda
    guardarDatosScann: any; // Ajusta el tipo según corresponda
}
export const Modalcanje: React.FC<ModalCanjeProps> = ({ ...props }) => {
    let { showModalFir, setModalFir, datosScn, guardarDatosScann } = props

    useEffect(() => {
        console.log(showModalFir)
    }, [showModalFir])
    return (

        <IonModal isOpen={showModalFir}
            onDidDismiss={() => setModalFir(false)}
        >
            <IonHeader className=" bg-welcome">
                <IonToolbar className=""
                    style={{
                        color: "#ffffs"
                    }}
                >


                    <IonButtons slot="end"  >
                        <IonButton
                            onClick={() => setModalFir(false)}>
                            <IonIcon className=" fw-bold" size="large" icon={close} ></IonIcon>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Firmas modal={datosScn}
                    canjear={guardarDatosScann}
                    setModalFir={setModalFir}
                />
            </IonContent>
        </IonModal>
    )
}