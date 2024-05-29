import {registerPlugin} from '@capacitor/core'
export interface Macandres{
    NativeMethod():Promise<{value:string}>
}
const MAc = registerPlugin<Macandres>('Macandres')
export default MAc;