import React, { useEffect, useState } from 'react';
import './ExploreContainer.css';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { IonBadge, IonButton, IonButtons, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonSegment, IonSegmentButton, IonTitle, IonToolbar, useIonViewWillLeave } from '@ionic/react';
import { decode } from 'js-base64';
import { Boleto } from '../utils';
import { close, chevronForward, umbrella } from "ionicons/icons";
const ExploreContainer: React.FC = () => {
  const [barcodeData, setBarcodeData] = useState('');
  const [scanActivo, setScanActivo] = useState(false);
  const [datosScn, setScan] = useState<any>({ id: "" })
  const [showModal, setModal] = useState(false);
  const [tabs, setTabs] = useState('all')
  const checkPermisos = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        return true;
      } else if (status.denied) {
        BarcodeScanner.openAppSettings();
        return false;
      }
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  };

  const guardarDatosScann = async (e: any) => {
    const ides: any = document.getElementById('barcode')
    if (e != "Enter") return
    if (ides.value.length > 6 && !Number.isInteger(ides.value)) {
      setScanActivo(false);
      const dat: any = JSON.parse(decode(ides.value))
      setScan({ ...datosScn, ...JSON.parse(decode(ides.value)) });
      if (dat.id) {
        ides.value = dat.id
        setBarcodeData(dat.id);
        const data: any = await Boleto(dat.id);
        if (!data.estado) return alert(data.mensaje);
        console.log(data)
        setScan({ ...datosScn, ...data.boleto });
        setModal(true)

      } else {
        setBarcodeData("")
      }
    } else {
      setScan({ id: ides.value });
      setBarcodeData(ides.value);
      if (ides.value) {
        setBarcodeData(ides.value);
        const data: any = await Boleto(ides.value);
        if (!data.estado) return alert(data.mensaje);
        console.log(data)
        setScan({ ...datosScn, ...data.boleto });
        setModal(true)
      } else {
        setBarcodeData("")
      }
    }
  }
  const startScanner = async () => {
    const allow = await checkPermisos();
    if (allow) {
      setScanActivo(true);
      (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
      BarcodeScanner.hideBackground();
      try {
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {

          setScanActivo(false);
          const dat: any = JSON.parse(decode(result.content))
          setScan({ ...datosScn, ...JSON.parse(decode(result.content)) });
          if (dat.id) {
            setBarcodeData(dat.id);
            const data: any = await Boleto(dat.id);
            setModal(true)
            setScan({ ...datosScn, ...data.boleto });
          } else {
            setBarcodeData("")
          }
          (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
          // (window.document.getElementById('content') as HTMLElement).classList.remove('d-none');
        } else {
          alert('¡No se encontraron datos!');
        }
      } catch (error) {
        console.error('Error al iniciar el escáner:', error);
        alert('Error al iniciar el escáner.');
      }
    } else {
      alert('Permisos deshabilitados');
    }
  };

  const stopScanner = () => {
    BarcodeScanner.stopScan();
    setScanActivo(false);
    (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
  };
 function cerrarModla(){
   setScan({})
   setModal(false)
 }
  const verificarundefiner=(e:any)=> e!=undefined ? e :"valor indefinido"
  useIonViewWillLeave(() => {
    BarcodeScanner.stopScan();
    setScanActivo(false);
  });
  return (

    <IonContent fullscreen={true}
      style={{
        background: "#ffffff !important"
      }}
    >
     {showModal? <IonModal isOpen={showModal}
        onDidDismiss={cerrarModla}
        initialBreakpoint={1} breakpoints={[0, 0.25, 0.5, 1, 1]}
        backdropDismiss={false}>
        <IonHeader className=" bg-welcome">
          <IonToolbar className=""
            style={{
              color: "#ffffs"
            }}
          >


            <IonButtons slot="end"  >
              <IonButton
                onClick={cerrarModla}>
                <IonIcon className=" fw-bold" size="large" icon={close} ></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonToolbar>
          {Object.values(datosScn).length > 2 ? <div className=' text-white font-serif text-4xl'>

            {datosScn.canjeBoleto == "NO CANJEADO" ?
              <div className='bg-success container-fluid  fw-bold text-center' style={{
                width: "100%", height: '10vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>{datosScn.canjeBoleto}</div> : <div className='bg-danger container-fluid  fw-bold text-center' style={{
                width: "100%", height: '10vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>Canjeado</div>
            }
          </div> : ''}
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={tabs} onIonChange={e => setTabs("" + e.detail.value)}>
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="favorites">
              <IonLabel>Comentario</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Detalle">
              <IonLabel>Detalle</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
        <IonContent>

          {tabs == "all" ? <IonList>
            {Object.values(datosScn).length > 2 ?

              Object.values(datosScn).map((item, ind) => (
                <IonItem key={ind}>
                  <IonLabel>
                    {Object.keys(datosScn)[ind] + ":" + item}
                  </IonLabel>
                </IonItem>

              )

              )
              : ""}
          </IonList> : ""}
          {tabs == "Detalle" ?
            <IonContent>
              <div className='p-2'>


                <article className="job-card text-center ">
                  <div>
                    <p className="text-title">{!datosScn.info_concierto?"":JSON.parse(datosScn.info_concierto)[0].nombreConcierto || "no encontrado"}</p>
                    <p className="post-date">Creado: {verificarundefiner(datosScn.fechaCreacion )|| "no encontrado"}</p>
                  </div>


                  {JSON.parse(datosScn.info_concierto)!=undefined?JSON.parse(datosScn.info_concierto).map((el: any, ind: number) => {
                    return (<div className="budget-exp text-center" key={ind}>
                      <div >
                        <p className="value">${el.localidad_precio || "no encontrado"}</p>

                      </div>
                      <div>
                        <p className="value">{el.localidad_nombre || "no encontrado"}</p>

                      </div>
                      <div>
                        <p className="value">{el.cantidad || "no encontrado"}</p>

                      </div>
                      
                     
                    </div>
                    )
                  }):""}
                  <div className="budget-exp" >
                    <div >
                      <p className="value"></p>
                      <p className="label">Valor U.</p>
                    </div>
                    <div>
                      <p className="value"></p>
                      <p className="label">Localidad</p>
                    </div>
                    
                    <div>
                      <p className="value"></p>
                      <p className="label">Cantidad</p>
                    </div>
                  </div>

                  <p className="text-body">
                    Compra realizada vía {datosScn.canal || "no encontrado"}, valor total de la compra del registro #<span className=' fw-bold'>{datosScn.id}</span> 
                    <span className=' fw-bold'> ${datosScn.total_pago || "valor no encontrado"} </span> 
                    cédula # {datosScn.cedula || "cedula no encontrada"} 
                  </p>

                  <div className="tags ">
                    <article className=' fw-bold'>
                      <p>{datosScn.forma_pago || "Forma de pago"}</p>
                      <p>{datosScn.consolidado || "No consolidado"}</p>
                      <p>{datosScn.estado_pago || "No pagado"}</p>
                    </article>
                  </div>

                  <div className=''>
                    <a >
                      <button className="card-btn">{datosScn.estado_autorizacion_sri?"FACTURADO":"NO FACTURADO"}</button>
                    </a>
                  </div>
                </article>
              </div>
            </IonContent>
            : ""

          }

        </IonContent>
        <IonFooter>
          <IonToolbar>
            {Object.values(datosScn).length > 2 ? <div className=''>

              {datosScn.canjeBoleto == "NO CANJEADO" ?
                <div className=' container'>    <IonButton >Canjear</IonButton></div> : <div className='bg-danger'>Canjeado</div>
              }
            </div> : ''}
          </IonToolbar>
        </IonFooter>
      </IonModal >:""}
      <div className="container">
        <strong style={{
          display: 'none'
        }}></strong>
        <p style={{
          display: 'none'
        }} className='d-none'>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
        <div className=' ion-container'
          style={{
            display: ""
          }}
        >

          <IonGrid>
            <IonCol >
              <IonInput
                id='barcode'
                placeholder='Código de barras o QR'
                type="number"
                onKeyPress={e => guardarDatosScann(e.key)}
                counter={true}
                clearInput={true}
              />
            </IonCol>
          </IonGrid>
        </div>
        {barcodeData && <p>Barcode Data Registro compra: {datosScn.id}</p>}
        {scanActivo ? "" : <div id='content' className='row'>
          <IonButton onClick={startScanner}>Iniciar escáner</IonButton>


        </div>}
      </div>
      {scanActivo ? <div className="scan-box" ></div>


        : ""}
      {scanActivo ? <IonButton className='scan-button' onClick={stopScanner}>Deten escáner</IonButton> : ""}
    </IonContent>
  );
};

export default ExploreContainer;
