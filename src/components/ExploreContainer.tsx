import React, { useEffect, useRef, useState } from 'react';
import './ExploreContainer.css';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { IonAlert, IonApp, IonBadge, IonButton, IonButtons, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonSegment, IonSegmentButton, IonTitle, IonToolbar, isPlatform, useIonViewWillLeave } from '@ionic/react';
import { decode } from 'js-base64';
import { Boleto, Canjear, LoginUser, getUsuario } from '../utils';
import { close, chevronForward, umbrella } from "ionicons/icons";
import MAc from './MACAddres';
import { Device } from '@capacitor/device';
import { jwtDecode } from 'jwt-decode';
import Firmas from './Firma';
import { UserPreferences } from '../Controller';
import { useHistory } from 'react-router';
import { Modalcanje } from './Modal';


const ExploreContainer: React.FC = () => {
  let history = useHistory()
  const userPreferences = new UserPreferences();
  const [barcodeData, setBarcodeData] = useState('');
  const [scanActivo, setScanActivo] = useState(false);
  const [datosScn, setScan] = useState<any>({ id: "" })
  const [mac, setMAc] = useState<string>('')
  const [show, setShow] = useState(false);
  const [showv, setShowv] = useState(false);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [showModal, setModal] = useState(false);
  const [showModalFir, setModalFir] = useState(false);
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
  async function getMAc() {
    try {
      const deviceInfo = await Device.getInfo();
      const macs = await Device.getId();
      console.log(deviceInfo, mac)
      setMAc(JSON.stringify({ deviceInfo, ...macs }))
      console.log(isPlatform('android'))
      //  if (isPlatform('android')) {

      const obten = await MAc.NativeMethod();
      console.log(obten)
      setMAc(JSON.stringify(obten))
    } catch (error) {
      console.info(error)
    }

  }
  const guardarDatosScanner = async (e: any) => {
    try {
      // Verifica si la tecla presionada es Enter
      if (e.key !== "Enter") return;
      setModal(false);
      const ides: any = document.getElementById('barcode');
      if (!ides || !ides.value) return;
      setScanActivo(false);
      const dat: any = { id: ides.value };
      setScan({ ...datosScn, id: ides.value });
      if (dat.id) {
        ides.value = dat.id;  // Actualiza el valor del input
        setBarcodeData(dat.id);  // Guarda el valor del código
        const data: any = await Boleto(dat.id);
        if (!data.estado) return alert(data.mensaje);
        setScan({ ...datosScn, ...data.boleto, comentario: data.comentario, fechacanje: data.fechacanje });
        setModal(true);
        setModalFir(false);
      } else {
        setBarcodeData("");
      }
    } catch (error) {
      BarcodeScanner.stopScan();
      setScanActivo(false);
    }

  };

  const guardarDatosScann = async (e: any) => {
    setModal(false)
    const ides: any = document.getElementById('barcode')
    try {
      if (e != "Enter") return
      //  if (ides.value.length == 8 ) {
      setScanActivo(false);
      const dat: any = { id: ides.value }
      setScan({ ...datosScn, id: ides.value });
      if (dat.id) {
        ides.value = dat.id
        setBarcodeData(dat.id);
        const data: any = await Boleto(dat.id);
        if (!data.estado) return alert(data.mensaje);
        console.log(data)
        setScan({ ...datosScn, ...data.boleto, comentario: data.comentario, fechacanje: data.fechacanje });
        setModal(true)
        setModalFir(false)
      } else {
        setBarcodeData("")
      }

    } catch (error) {
      BarcodeScanner.stopScan();
      setScanActivo(false);
    }

    /* } else {
       setScan({ id: ides.value });
       setBarcodeData(ides.value);
       if (ides.value) {
         setBarcodeData(ides.value);
         const data: any = await Boleto(ides.value);
         if (!data.estado) return alert(data.mensaje);
         console.log(data)
         setScan({ ...datosScn, ...data.boleto, comentario: data.comentario, fechacanje: data.fechacanje });
         setModal(true)
         setModalFir(false)
       } else {
         setBarcodeData("")
       }
     }*/
  }
  const startScanner = async () => {
    const allow = await checkPermisos();
    if (allow) {
      const idboleto: any = document.getElementById('barcode')
      setScanActivo(true);
      (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
      BarcodeScanner.hideBackground();
      try {
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {

          setScanActivo(false);
          const dat: any = { id: result.content }
          setScan({ ...datosScn, id: result.content });
          const codigo = dat.id
          if (codigo != undefined && codigo!= null) {
            try {
              setBarcodeData(dat.id);
              const data: any = await Boleto(dat.id);
              if (!data.estado) return alert('¡No se encontraron datos!');
              idboleto.value = '' + dat.id
              setModal(true)
              setScan({ ...datosScn, ...data.boleto, comentario: data.comentario, fechacanje: data.fechacanje });
            } catch (error) {
              alert("no encontrado");
              BarcodeScanner.stopScan();
              (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
            }
           
          } else {
            alert("no encontrado");
            BarcodeScanner.stopScan();
            (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
            setBarcodeData("")
          }

          BarcodeScanner.stopScan();
          (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');

        } else {
          alert('¡No se encontraron datos!');
        }
      } catch (error) {
        BarcodeScanner.stopScan();
        setScanActivo(false);
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
  function cerrarModla() {
    setScan({})
    setModal(false)
    const idboleto: any = document.getElementById('barcode')
    idboleto.value = ''
    setTimeout(() => {
      inputRef.current?.setFocus(); // Enfoca el campo de entrada
    }, 150);

    idboleto.focus({
      preventScroll: true,
    })
    console.log(inputRef)

  }
  const verificarundefiner = (e: any) => {
    return (e != undefined || e != null) ? e : "valor indefinido"
  }
  useIonViewWillLeave(() => {
    BarcodeScanner.stopScan();
    setScanActivo(false);

  });
  function cerrar() {
    // localStorage.removeItem("user")
    userPreferences.removeUser()
    history.push("/")
    setShow(false)
  }
  const CanjearBoleto = async () => {
    setModalFir(false)
    const user: any = getUsuario()
    const nuveo = mac
    console.log(user)
    const params = {
      "user": user.id,
      "cedula": user.username,
      "info": nuveo
    }
    try {
      const data = await Canjear(datosScn.idtickte, params)
      console.log(data)
      if (data.estado) {
        cerrarModla()
        alert(data.mensaje)
        setModal(false)
        return
      } else {
        alert(data.mensaje)
        return
      }
    } catch (error) {
      alert("no se pudo canjear el boleto ")
      return error
    }
  }

  function Tarjeta() {
    if (String(datosScn.forma_pago) == "Tarjeta") {
      if (datosScn.id_espacio_localida != 1) {
        return (<div className='bg-warning container-fluid  fw-bold text-center'
          style={{
            width: "100%", height: '10vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
          REGISTRO NO FIRMADO
        </div>)
      }
      return (<div className='bg-success container-fluid  fw-bold text-center'
        style={{
          width: "100%", height: '10vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
        {datosScn.canjeBoleto}
      </div>)

    }
    return (<div className='bg-success container-fluid  fw-bold text-center'
      style={{
        width: "100%", height: '10vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
      {datosScn.canjeBoleto}
    </div>)
  }
  function VerVoucher() {
    const url = datosScn.link_pago == null ? datosScn.link_comprobante : datosScn.link_pago.replace("k/", "k/voucher/");
    if (!(datosScn.id_espacio_localida == 1)) {

      window.open(url, '_blank');
    } else {
      window.open(datosScn.status_pg, '_blank');
    }
  }
  useEffect(() => {
    getMAc()
    const token = getUsuario()
    setTimeout(() => {
      inputRef.current?.setFocus()
    }, 150);

    if (token) {
      setShow(true)
      getMAc()
      return
    } else {
      return
    }
  }, [show])
  return (
    <IonApp>
      <IonContent fullscreen={true}
        style={{
          background: "#ffffff !important"
        }}
      >

        <div>
          {showModal ?
            <IonModal isOpen={showModal}
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
                    <Tarjeta /> :
                    <div className='bg-danger container-fluid  fw-bold text-center'
                      style={{
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
                  <IonSegmentButton value="comenta">
                    <IonLabel>Comentario</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="Detalle">
                    <IonLabel>Detalle</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonToolbar>
              <IonContent>
                <IonAlert
                  header="Desea canjear este boleto?"
                  trigger="present-alert"
                  buttons={[
                    {
                      text: 'Cancelar',
                      role: 'cancel',
                      handler: () => {
                        console.log('Alert canceled');
                      },
                    },
                    {
                      text: 'Aceptar',
                      role: 'confirm',
                      handler: () => {
                        CanjearBoleto()
                      },
                    },
                  ]}
                  onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
                ></IonAlert>
                {tabs == "Detalle" ?
                  <IonList>
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
                {tabs == "all" ?
                  <IonContent>
                    <div className='p-2'>


                      <article className="job-card text-center " >
                        <div style={{
                          lineHeight: 0.7
                        }}>
                          <p className="text-title">{!datosScn.info_concierto ? "" : JSON.parse(datosScn.info_concierto)[0].nombreConcierto || "no encontrado"}</p>
                          <p className="post-date">Creado: {verificarundefiner(datosScn.fechaCreacion) || "no encontrado"}</p>
                          <p className="post-date">Ticket id: {verificarundefiner(datosScn.idtickte) || "no encontrado"} silla:{verificarundefiner(datosScn.sillas)} </p>
                          <p className='post-date'>Localidad num {verificarundefiner(datosScn.id_localidades_items) || "no encontrado"} </p>
                        </div>


                        {JSON.parse(datosScn.info_concierto) != undefined ? JSON.parse(datosScn.info_concierto).map((el: any, ind: number) => {
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
                        }) : ""}
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

                        <div className='d-flex justify-content-around '>
                          {datosScn.forma_pago == "Tarjeta" ? <a>
                            {datosScn.id_espacio_localida == 1 ? <button className="card-btn bg-success" onClick={VerVoucher} > VER FIRMA</button> :
                              <button className="card-btn bg-warning" onClick={VerVoucher}>
                                VER VOUCHER</button>}
                          </a> : ""}
                          <a >
                            <div className="tags ">
                              <article className=' fw-bold'>
                                <p className=''>{datosScn.estado_autorizacion_sri ? "FACTURADO" : "NO FACTURADO"}</p>
                              </article>
                            </div>
                            <button className="card-btn d-none" >{datosScn.estado_autorizacion_sri ? "FACTURADO" : "NO FACTURADO"}</button>
                          </a>
                        </div>
                      </article>
                    </div>
                  </IonContent>
                  : ""
                }
                {
                  tabs == "comenta" ?
                    <IonContent>
                      <div>


                      </div>
                      <IonList>
                        {datosScn.comentario.length > 0 ?
                          datosScn.comentario.map((item: any, ind: number) => (
                            <IonItem key={ind}>
                              <IonLabel className='text-center'>
                                <p className=' text-uppercase'>{item}</p>
                              </IonLabel>
                            </IonItem>
                          )

                          )
                          : ""}
                      </IonList>
                    </IonContent> : ""
                }

              </IonContent>
              <IonFooter>
                <IonToolbar color={datosScn.canjeBoleto == "NO CANJEADO" ? "" : "danger"}>
                  {Object.values(datosScn).length > 2 ? <div className=''>

                    {datosScn.canjeBoleto == "NO CANJEADO" ?
                      <div className=' container'>    {(datosScn.id_espacio_localida != 1 && datosScn.forma_pago == "Tarjeta") ?
                        <IonButton color={"warning"} onClick={() => setModalFir(true)} className='cal'>Firmar</IonButton> : <IonButton id="present-alert" >Canjear</IonButton>} </div> : <div className=' text-center  '> EL BOLETO YA FUE CANEJADO
                        <span className='m-2'>{datosScn.fechacanje} </span></div>
                    }
                  </div> : ''}
                </IonToolbar>
              </IonFooter>
            </IonModal > : ""}

          <Modalcanje
            showModalFir={showModalFir}
            setModalFir={setModalFir}
            datosScn={datosScn} guardarDatosScann={guardarDatosScann}
          />
          <IonModal isOpen={showv}
            onDidDismiss={() => setShowv(false)}>
            <IonHeader className=" bg-welcome">
              <IonToolbar className=""
                style={{
                  color: "#ffffs"
                }}
              >


                <IonButtons slot="end"  >
                  <IonButton
                    onClick={() => setShowv(false)}>
                    <IonIcon className=" fw-bold" size="large" icon={close} ></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>


          </IonModal>
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
            > {scanActivo ? "" : <IonButton onClick={cerrar} className=' position-sticky'  >Cerrar session</IonButton>}

              <IonGrid>
                <IonCol >
                  <IonInput
                    id='barcode'
                    ref={inputRef}
                    placeholder='Código de barras o QR'
                    type="text"
                    autofocus={true}
                    onKeyDown={e => guardarDatosScanner(e)}
                    counter={true}
                    clearInput={true}
                  />

                </IonCol>
              </IonGrid>
            </div>
            {barcodeData ? "" : <p className={scanActivo ? "d-none" : ''}>Barcode Data Registro compra: {datosScn.id}</p>}
            {scanActivo ? "" : <div id='content' className='row'>
              <IonButton onClick={startScanner} >Iniciar escáner</IonButton>


            </div>}

            <div className='d-none'>{mac}</div>
          </div>
          {scanActivo ? <div className="scan-box" ></div>


            : ""}
          {scanActivo ? <div className='d-flex justify-content-center'> <IonButton className='scan-button px-0' onClick={stopScanner}>Deten escáner</IonButton> </div> : ""}
        </div>
      </IonContent>
    </IonApp>
  );
};

export default ExploreContainer;
