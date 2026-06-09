import { config } from './config';

const ROOT_URL = "https://webetu.iutnc.univ-lorraine.fr";

// recupere une photo avec son identifiant en utilisant un type generique
export function loadPicture<T>(idPicture: number): Promise<T> {
    const url = `${config.baseUrl}/photos/${idPicture}`;
    return loadResource<T>(url);
}

// fonction generique pour taper sur l'api de l'iut
export function loadResource<T>(uri: string): Promise<T> {
    let fullUrl = uri;

    // on ajoute le domaine public si l'url est relative
    if (uri.startsWith('/api')) {
        fullUrl = `${ROOT_URL}/www/canals5/phox${uri}`;
    } 
    else if (uri.startsWith('/www')) {
        fullUrl = `${ROOT_URL}${uri}`;
    }

    // securite contre les slashs en trop a la fin
    if (fullUrl.endsWith('/')) {
        fullUrl = fullUrl.slice(0, -1);
    }

    // parametres sans vpn avec l'option du prof
    const fetchOptions: RequestInit = {
        method: 'GET',
        credentials: 'include'
    };

    return fetch(fullUrl, fetchOptions)
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error(`erreur reseau http : ${response.status} sur l'url : ${fullUrl}`);
            }
            // on force la reponse dans le bon format generique comme vu en cours
            return response.json() as Promise<T>;
        })
        .catch((error: unknown) => {
            if (error instanceof Error) {
                console.error(`echec du fetch sur [${fullUrl}] :`, error.message);
            }
            throw error;
        });
}