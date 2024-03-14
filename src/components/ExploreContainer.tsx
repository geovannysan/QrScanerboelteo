import React, { useEffect, useState } from 'react';
import './ExploreContainer.css';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { IonButton, IonContent, useIonViewWillLeave } from '@ionic/react';
import { decode } from 'js-base64';
const ExploreContainer: React.FC = () => {
  const [barcodeData, setBarcodeData] = useState('');
  const [scanActivo, setScanActivo] = useState(false);
  const [datosScn, setScan] = useState({ id: "" })


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

  const startScanner = async () => {
    const allow = await checkPermisos();
    if (allow) {
      setScanActivo(true);
      (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
      //(window.document.getElementById('content') as HTMLElement).classList.add('d-none');
      BarcodeScanner.hideBackground();
      try {
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {

          setScanActivo(false);
          const dat: any = JSON.parse(decode(result.content))
          setScan({ ...datosScn, ...JSON.parse(decode(result.content)) });
          if (dat.id) {
            setBarcodeData(dat.id);
          } else {
            setBarcodeData("")
          }
          ///const dat:any = JSON.parse(decode(result.content))
          // alert(JSON.stringify(dat));
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
      <div className="container">
        <strong style={{
          display: 'none'
        }}></strong>
        <p style={{
          display: 'none'
        }} className='d-none'>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
        {scanActivo ? "" : <div id='content' className='row'>
          <IonButton onClick={startScanner}>Iniciar escáner</IonButton>

          {barcodeData && <p>Barcode Data: {datosScn.id}</p>}
        </div>}
      </div>
      {scanActivo ? <div className="scan-box" ></div>


        : ""}
      {scanActivo ? <IonButton className='scan-button' onClick={stopScanner}>Deten escáner</IonButton> : ""}
    </IonContent>
  );
};

export default ExploreContainer;
