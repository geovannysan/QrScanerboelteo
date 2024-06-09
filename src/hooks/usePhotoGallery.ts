import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
export interface UserPhoto {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE = 'photos';
export function usePhotoGallery() {
    const [photos, setPhotos] = useState<UserPhoto[]>([]);
    const [file, setFile] = useState<any>([]);
    const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
        const base64Data = await base64FromPath(photo.webPath!);
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data,
        });


        // Use webPath to display the new image instead of base64 since it's
        // already loaded into memory
        return {
            filepath: fileName,
            webviewPath: photo.webPath,
        };
    };
    const takePhoto = async () => {
        try {
            const photo = await Camera.getPhoto({
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                quality: 100,
                allowEditing: false,
            });
            const theActualPicture = photo.dataUrl;
            const fileName = Date.now() + '.jpeg';
            const savedFileImage = await savePicture(photo, fileName);
            let file: any = dataUrlToFile("" + photo.dataUrl, fileName)
            console.log(file)
            console.log(photo, savedFileImage, photos)
            const newPhotos = [savedFileImage];
            console.log([{
                file: file, id: 1, name: file.name, size: file.size, type: file.type, valid: true, errors: undefined, dataresult: theActualPicture
            }])
            setFile([{
                file: file, id: 1, name: file.name, size: file.size, type: file.type, valid: true, errors: undefined, dataresult: theActualPicture
            }]);
            setPhotos(newPhotos);
        }catch(err){
            console.log(err)
            setFile([]);
        }
    };
    return {
        file,
        photos,
        takePhoto,
    };
}
const dataUrlToFile = (dataUrl: String, filename: any) => {
    const arr: any = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};
export async function base64FromPath(path: string): Promise<string> {
    console.log(path)

    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject('method did not return a string');
            }
        };
        reader.readAsDataURL(blob);
    });
}