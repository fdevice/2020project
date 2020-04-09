import { CVData } from 'src/assets/models/cvData.model';

    // model bazowego CV wysyłanego do serwera
export interface BaseCV {
    loggedUserEmail: string,
    cvData: CVData
}