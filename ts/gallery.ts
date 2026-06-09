import { loadResource } from './photoloader';
import { config } from './config';
import { galleryitem } from './gallery_ui';

// interfaces pour decrire ce que renvoie l'api pour la pagination
export interface linkitem {
    href: string;
}

export interface paginationlinks {
    next?: linkitem;
    prev?: linkitem;
    first?: linkitem;
    last?: linkitem;
}

export interface galleryresponse {
    photos?: galleryitem[];
    links?: paginationlinks;
}

// on garde en memoire ou on en est
let liensPagination: paginationlinks = {};

// on factorise le code de chargement pour eviter de se repeter
function chargerDepuisUrl(url: string): Promise<galleryresponse> {
    return loadResource<galleryresponse>(url)
        .then((data: galleryresponse) => {
            // on sauvegarde la page actuelle
            liensPagination = data.links || {};
            
            return {
                photos: data.photos || [],
                links: data.links || {}
            };
        })
        .catch((error: unknown) => {
            if (error instanceof Error) {
                console.error("erreur de chargement de la galerie :", error.message);
            }
            throw error;
        });
}

// premier chargement
export function load(): Promise<galleryresponse> {
    const urlInitiale = `${config.baseUrl}/photos`;
    return chargerDepuisUrl(urlInitiale);
}

// page d'apres
export function next(): Promise<galleryresponse> {
    if (liensPagination.next && liensPagination.next.href) {
        return chargerDepuisUrl(liensPagination.next.href);
    }
    return Promise.reject(new Error("pas de page suivante"));
}

// page d'avant
export function prev(): Promise<galleryresponse> {
    if (liensPagination.prev && liensPagination.prev.href) {
        return chargerDepuisUrl(liensPagination.prev.href);
    }
    return Promise.reject(new Error("pas de page precedente"));
}

// retour au debut
export function first(): Promise<galleryresponse> {
    if (liensPagination.first && liensPagination.first.href) {
        return chargerDepuisUrl(liensPagination.first.href);
    }
    return Promise.reject(new Error("deja sur la premiere page"));
}

// saut a la fin
export function last(): Promise<galleryresponse> {
    if (liensPagination.last && liensPagination.last.href) {
        return chargerURLDernierePageFix(liensPagination.last.href);
    }
    return Promise.reject(new Error("pas de derniere page"));
}

// evite un bug de l'api iut avec les liens absolus
function chargerURLDernierePageFix(url: string): Promise<galleryresponse> {
    return chargerDepuisUrl(url);
}