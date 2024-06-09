import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Buffer } from "buffer";
import { Dropzone, FileMosaic } from "@files-ui/react";
import axios from "axios";
import $ from "jquery";
import { useState } from "react";
import { Boleteria_voucher, boleteriaAxios } from "../utils";
import { usePhotoGallery } from "../hooks/usePhotoGallery";
export default function Firmas(props) {
    let { modal, canjear, setModalFir } = props
    let { takePhoto, photos, file } = usePhotoGallery()
    let [loader,setLoader]= useState(false)
    let imagecedula;
    $(document).ready(function () {

        const canvas = document.querySelector("#canvas");
        const btnlimpiar = document.querySelector("#limpiar");
        const descargar = document.querySelector("#descarga");
        let xAnterior = 0, yAnterior = 0, xActual = 0, yActual = 0;
        const contexto = canvas.getContext("2d");
        const COLOR_PINCEL = "black";
        const COLOR_FONDO = "white";
        const GROSOR = 2;
        let haComenzadoDibujo = false;

        const obtenerXReal = (evento) => {
            if (evento.touches && evento.touches.length > 0) {
                return evento.touches[0].clientX - canvas.getBoundingClientRect().left;
            } else {
                return evento.clientX - canvas.getBoundingClientRect().left;
            }
        };

        const obtenerYReal = (evento) => {
            if (evento.touches && evento.touches.length > 0) {
                return evento.touches[0].clientY - canvas.getBoundingClientRect().top;
            } else {
                return evento.clientY - canvas.getBoundingClientRect().top;
            }
        };

        const inicioDibujo = (evento) => {
            xAnterior = xActual;
            yAnterior = yActual;
            xActual = obtenerXReal(evento);
            yActual = obtenerYReal(evento);
            contexto.beginPath();
            contexto.fillStyle = COLOR_PINCEL;
            contexto.fillRect(xActual, yActual, GROSOR, GROSOR);
            contexto.closePath();
            haComenzadoDibujo = true;
        };

        const movimientoDibujo = (evento) => {
            if (!haComenzadoDibujo) {
                return;
            }

            xAnterior = xActual;
            yAnterior = yActual;
            xActual = obtenerXReal(evento);
            yActual = obtenerYReal(evento);
            contexto.beginPath();
            contexto.moveTo(xAnterior, yAnterior);
            contexto.lineTo(xActual, yActual);
            contexto.strokeStyle = COLOR_PINCEL;
            contexto.lineWidth = GROSOR;
            contexto.stroke();
            contexto.closePath();
            evento.preventDefault();
        };

        const finDibujo = () => {
            haComenzadoDibujo = false;
        };

        canvas.addEventListener("mousedown", inicioDibujo);
        canvas.addEventListener("mousemove", movimientoDibujo);
        canvas.addEventListener("mouseup", finDibujo);
        canvas.addEventListener("mouseout", finDibujo);

        canvas.addEventListener("touchstart", inicioDibujo);
        canvas.addEventListener("touchmove", movimientoDibujo);
        canvas.addEventListener("touchend", finDibujo);

        const limpiar = () => {
            contexto.fillStyle = COLOR_FONDO;
            contexto.fillRect(0, 0, canvas.width, canvas.height);
        };

        limpiar();
        btnlimpiar.onclick = () => limpiar()
    });
    const functionModificaPDF = async () => {
        try {
            setLoader(true)

            const url = modal.link_pago == null ? modal.link_comprobante : modal.link_pago.replace("k/", "k/voucher/");
            console.log(url)
            let { data, status } = await boleteriaAxios.post("Boleteria/bancos", {
                "bancos": "",
                "id": "",
                "url": url
            })
            const existingPdfBytes = await fetch(data).then((res) => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();
            const imageDataUrl = canvas.toDataURL("image/png");
            const imageBytes = await fetch(imageDataUrl).then((res) => res.arrayBuffer());
            const image = await pdfDoc.embedPng(imageBytes);
            const jpgDims = image.scale(0.5)
            console.log(image, imageBytes)
            firstPage.drawImage(image, {
                x: 114,
                y: 5,
                width: width / 3,
                height: height / 10,
            });
            const newPage = pdfDoc.addPage([width, height]);
            const base64Image = file[0].dataresult;
            const base64Data = base64Image.split(";base64,")[1];
            const imageBytesimgen = Buffer.from(base64Data, "base64");
           // console.log(type)
            //if (type == "png" || type == 'PNG') imagecedula = await pdfDoc.embedJpg(imageBytesimgen)
            imagecedula = await pdfDoc.embedJpg(imageBytesimgen)

            console.log(imagecedula)

            newPage.drawImage(imagecedula, {
                x: 50,
                y: width / 2,
                width: width / 2,
                height: height / 2

            });
            const pdfBytes = await pdfDoc.save();
            const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
            console.log(pdfBytes, pdfBlob)
            const fordata = new FormData();
            let nombre = url.split("voucher/")[1]
            fordata.append('image', pdfBlob, nombre + '.pdf');
            setLoader(true)
            try {
                const { data } = await axios.post("https://api.ticketsecuador.ec/store/api/img/", fordata,
                    {
                        header: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic Ym9sZXRlcmlhOmJvbGV0ZXJpYQ=='
                        }
                    })
                console.log(data)
                if (!data.success) {
                    console.log(data)

                    return null
                }
                console.log(data)

                let boleto = await Boleteria_voucher({
                    "estado": 1,
                    "id": "" + modal.id,
                    "link": data.link
                })
                if (boleto.estado) {
                    canjear("Enter")
                    setModalFir(false)
                    let boletos = JSON.stringify({ ...boleto.datos })
                    console.log(boletos)
                    setLoader(false)
                    alert(boleto.datos.status_pg)

                    
                    // sessionStorage.setItem("Detalleuid", boletos)
                    // window.location.reload()
                }
                console.log(boleto, {
                    "estado": "1",
                    "id": modal.id,
                    "link": data.link
                })
                //setLoading("")
                return data.link

            } catch (error) {
                alert('Hubo un error')
                setLoader(false)
                console.log(error)
                return null

            }
        } catch (error) {
            alert('Hubo un error')
            setLoader(false)
            return "Hubo un error"
        }

        // download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");
    };
    return (<div>
        {loader ?<div className=" superpuesto" id="superpuesto">
            <div className="loader">
                <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 1080 1080">
                   
                    <g>
                        <g>
                            <path className="st0" d="M135.07,553.8l5.05-25.27h78.56l-5.05,25.27H135.07z M177.83,641c-8.15,0-15.1-1.65-20.85-4.95
			c-5.76-3.3-9.87-8.07-12.32-14.32c-2.46-6.25-2.84-13.65-1.16-22.22l19.59-98.57h32.86l-19.59,98.36
			c-0.84,4.77-0.35,8.57,1.47,11.37c1.82,2.81,5.19,4.21,10.11,4.21c2.24,0,4.53-0.35,6.85-1.05c2.32-0.7,4.46-1.68,6.42-2.95
			l4.84,23.38c-4.07,2.53-8.57,4.29-13.48,5.27C187.65,640.5,182.74,641,177.83,641z" />
                            <path className="st0"
                                d="M226.06,593.19l5.27-26.33h59.61l-5.27,26.33H226.06z" />
                            <path className="st0" d="M302.51,639.31L325.05,526h32.65l-22.54,113.31H302.51z M346.95,510.2c-5.76,0-10.39-1.65-13.9-4.95
			c-3.51-3.3-5.27-7.34-5.27-12.11c0-5.61,2-10.28,6-14.01c4-3.72,9.23-5.58,15.69-5.58c5.76,0,10.43,1.58,14.01,4.74
			c3.58,3.16,5.37,7.06,5.37,11.69c0,6.04-2,10.92-6,14.64C358.85,508.34,353.55,510.2,346.95,510.2z" />
                            <path className="st0"
                                d="M425.51,641c-11.66,0-21.8-2.11-30.43-6.32c-8.64-4.21-15.34-10.11-20.11-17.69
			c-4.77-7.58-7.16-16.5-7.16-26.75c0-12.64,2.95-23.91,8.85-33.8c5.9-9.9,14.04-17.72,24.43-23.48
			c10.39-5.76,22.33-8.64,35.81-8.64c12.07,0,22.54,2.49,31.38,7.48c8.85,4.99,15.38,12.04,19.59,21.17l-27.8,13.9
			c-2.39-5.33-5.72-9.23-10-11.69c-4.29-2.46-9.37-3.69-15.27-3.69c-6.46,0-12.22,1.58-17.27,4.74c-5.05,3.16-9.06,7.51-12.01,13.06
			c-2.95,5.55-4.42,11.97-4.42,19.27c0,7.72,2.28,13.87,6.85,18.43c4.56,4.56,11.06,6.85,19.48,6.85c5.76,0,11.02-1.23,15.8-3.69
			c4.77-2.46,8.77-6.28,12.01-11.48l24.22,15.16c-5.34,8.57-12.74,15.24-22.22,20.01C447.73,638.61,437.16,641,425.51,641z" />
                            <path className="st0" d="M489.33,639.31l31.17-156.28h32.86l-31.17,156.28H489.33z M522.18,616.57l7.16-40.65L590.21,526h42.76
			l-63.4,52.87l-18.32,13.48L522.18,616.57z M574.63,639.31l-29.07-47.6l22.96-25.06l44.23,72.66H574.63z" />
                            <path className="st0" d="M680.57,641c-11.79,0-22.01-2.11-30.65-6.32c-8.64-4.21-15.34-10.11-20.11-17.69
			c-4.77-7.58-7.16-16.5-7.16-26.75c0-12.64,2.84-23.91,8.53-33.8c5.69-9.9,13.55-17.72,23.59-23.48
			c10.04-5.76,21.59-8.64,34.65-8.64c11.09,0,20.64,2.07,28.64,6.21c8,4.14,14.22,9.9,18.64,17.27c4.42,7.37,6.63,16.18,6.63,26.43
			c0,2.95-0.18,5.9-0.53,8.85c-0.35,2.95-0.81,5.76-1.37,8.42h-93.73l3.37-19.17h74.98l-13.48,5.9c1.12-6.32,0.77-11.62-1.05-15.9
			c-1.83-4.28-4.77-7.58-8.85-9.9c-4.07-2.32-8.99-3.48-14.74-3.48c-7.16,0-13.24,1.72-18.22,5.16c-4.99,3.44-8.74,8.18-11.27,14.22
			c-2.53,6.04-3.79,12.85-3.79,20.43c0,8.71,2.42,15.2,7.27,19.48c4.84,4.28,12.18,6.42,22.01,6.42c5.76,0,11.3-0.91,16.64-2.74
			c5.33-1.82,9.9-4.42,13.69-7.79l13.69,21.69c-6.6,5.2-14.01,9.02-22.22,11.48C697.52,639.77,689.13,641,680.57,641z" />
                            <path className="st0" d="M755.97,553.8l5.06-25.27h78.56l-5.05,25.27H755.97z M798.72,641c-8.14,0-15.1-1.65-20.85-4.95
			c-5.76-3.3-9.87-8.07-12.32-14.32c-2.46-6.25-2.84-13.65-1.16-22.22l19.59-98.57h32.86l-19.59,98.36
			c-0.84,4.77-0.35,8.57,1.47,11.37c1.82,2.81,5.19,4.21,10.11,4.21c2.24,0,4.53-0.35,6.85-1.05c2.32-0.7,4.46-1.68,6.42-2.95
			l4.84,23.38c-4.07,2.53-8.57,4.29-13.48,5.27C808.55,640.5,803.64,641,798.72,641z" />
                            <path className="st0" d="M885.5,641c-9.97,0-19.34-1.13-28.12-3.37c-8.78-2.24-15.55-5.05-20.32-8.42l12.64-23.8
			c4.91,3.23,10.92,5.83,18.01,7.79c7.09,1.97,14.22,2.95,21.38,2.95c7.72,0,13.34-0.98,16.85-2.95c3.51-1.96,5.27-4.63,5.27-8
			c0-2.67-1.47-4.67-4.42-6c-2.95-1.33-6.67-2.42-11.16-3.26c-4.5-0.84-9.3-1.82-14.43-2.95c-5.13-1.12-9.97-2.7-14.53-4.74
			c-4.56-2.03-8.29-4.98-11.16-8.85c-2.88-3.86-4.32-8.95-4.32-15.27c0-8.56,2.42-15.8,7.27-21.69c4.84-5.9,11.58-10.39,20.22-13.48
			c8.64-3.09,18.43-4.63,29.38-4.63c7.86,0,15.51,0.84,22.96,2.53c7.44,1.69,13.76,4,18.96,6.95l-11.79,24.01
			c-5.34-3.37-10.92-5.65-16.74-6.85c-5.83-1.19-11.41-1.79-16.74-1.79c-7.72,0-13.31,1.09-16.74,3.26
			c-3.44,2.18-5.16,4.81-5.16,7.9c0,2.67,1.44,4.74,4.32,6.21c2.88,1.47,6.56,2.67,11.06,3.58c4.49,0.91,9.34,1.9,14.53,2.95
			c5.19,1.05,10.04,2.6,14.53,4.63c4.49,2.04,8.18,4.92,11.06,8.64c2.88,3.72,4.32,8.74,4.32,15.06c0,8.57-2.49,15.83-7.48,21.8
			c-4.99,5.97-11.76,10.43-20.32,13.37C906.21,639.52,896.45,641,885.5,641z" />
                        </g>
                        <path className="st1" d="M480.21,432.74c0,0,2.51,20.25,31.23,20.25l-119.19-0.51l42.36-265.66c0,0,0.72-17.23,24.05-17.59h85.8
		c0,0-15.8,41.64,17.95,57.8c33.75,16.16,80.42-8.98,80.06-57.8h78.98c0,0,19.39,1.08,16.87,20.1l-42,263.15H560.98
		c0,0-28.72,3.23-26.57-29.08l6.1-44.52h-21.18l3.23-18.67h21.54l3.59-23.69c0,0,1.08-4.67,5.39-5.39h21.18l-4.31,28.72h28.36
		l-2.51,19.39h-28.36l-5.74,36.98c0,0-4.31,14.36,12.92,16.51h100.52l39.13-245.92h-54.93c0,0-14,64.98-85.44,62.83
		c0,0-53.85-2.51-51.7-62.83h-63.54L419.89,433.1L480.21,432.74z" />
                        <path className="st1" d="M349.17,698.05L317.22,889.4c0,0-5.03,18.31,18.67,20.1h86.52c0,0-3.59-58.16,58.52-63.54
		c0,0,43.8,0.36,42.72,44.16c0,0,0,9.69-4.31,19.39h77.9c0,0,19.75,1.08,24.05-20.1l31.59-191.35h-23.34l-32.31,193.5h-56.72
		c0,0,7.9-54.57-53.49-62.83c0,0-63.18-3.59-81.49,63.54h-65.7l34.11-194.22H349.17z" />
                        <polygon className="st1"
                            points="387.22,698.05 383.99,717.07 419.62,717.07 423.57,698.05 	" />
                        <polygon className="st1"
                            points="436.05,698.05 432.82,717.07 468.45,717.07 472.4,698.05 	" />
                        <polygon className="st1"
                            points="483.8,698.05 480.57,717.07 516.2,717.07 520.15,698.05 	" />
                        <polygon className="st1"
                            points="532.95,698.05 529.72,717.07 565.35,717.07 569.3,698.05 	" />
                        <polygon className="st1"
                            points="581.77,698.05 578.54,717.07 614.17,717.07 618.12,698.05 	" />
                    </g>
                </svg>
                <span></span>
            </div>
            <span>Firmando</span>
        </div>:""}
        <div className="d-flex justify-content-center ">
            <div className="row text-center col-10 pt-5">
                <p >Agrega la foto de la cédula del propietario de la tarjeta:</p>
                <div className="d-flex justify-content-center ">

                    
                    <label className="custum-file-upload2"  >
                        <div className="icon" onClick={takePhoto}  >
                            {file.length==0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24">
                                    <path d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" />
                                </svg>
                            ) : (
                                // Si no se cargó un archivo, mostrar el icono de subida
                               <div>
                                        {file.map((filed) => (
                                            <FileMosaic onClick={takePhoto} key={1} {...filed} preview />
                                        ))}
                               </div>
                            )} </div>
                        <div className="text">
                           
                        </div>
                       

                    </label>
                    
                   
                </div>
                <p className={file.length == 0 ? "d-none" : ""}>Firmar a continuación:</p>
                <canvas id="canvas" className={file.length == 0 ? "d-none" : ""}></canvas>

            </div>
        </div>
        <br></br>
        <div className=" d-flex justify-content-around">
            <div>
                <button disabled={file.length == 0} className="btn btn-danger" id="limpiar">Limpiar</button>
            </div>
            <div>
                <button disabled={file.length == 0} onClick={functionModificaPDF} className="btn btn-success" id="descarga">Firmar</button>
            </div>
        </div>
    </div>)
}