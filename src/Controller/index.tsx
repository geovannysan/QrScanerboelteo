import { Preferences } from "@capacitor/preferences";

// Interfaz que define las operaciones de preferencia de usuario
interface IUserPreferences {
    setUser(data: { id: number; name: string }): Promise<void>;
    getUser(): Promise<{ id: number; name: string } | null>;
}

export class User {
    username = '';
    password = '';
   
}

// Implementación de las preferencias de usuario que cumple con los principios SOLID
export class UserPreferences extends User implements IUserPreferences  {
    private static readonly USER_KEY = 'user';

    // Configura el usuario en las preferencias
    async setUser(data: { id: number; name: string }): Promise<void> {
        await Preferences.set({
            key: UserPreferences.USER_KEY,
            value: JSON.stringify(data),
        });
    }

    // Obtiene el usuario desde las preferencias
    async getUser(): Promise<{ id: number; name: string } | null> {
        const result = await Preferences.get({ key: UserPreferences.USER_KEY });
        return result.value ? JSON.parse(result.value) : null;
    }

    // Método adicional: elimina el usuario de las preferencias
    async removeUser(): Promise<void> {
        await Preferences.remove({ key: UserPreferences.USER_KEY });
    }
}
