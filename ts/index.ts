import { loadPicture, loadResource } from './photoloader';
import { displayPicture, displayCategory, displayComments, photonode, categorynode, commentsnode } from './ui';
import * as gallery from './gallery';
import * as gallery_ui from './gallery_ui';

// on decrit les liens hypermedia fournis par la reponse
interface linkitem {
    href: string;
}

interface photolinks {
    categorie?: linkitem;
    comments?: linkitem;
}

// type combinant le noeud photo et les liens
interface fullphotoresponse extends photonode {
    links?: photolinks;
    photo?: photonode & { links?: photolinks };
}

// telecharge et affiche l'image principale
function getPicture(id: number): void {
    loadPicture<fullphotoresponse>(id)
        .then((data: fullphotoresponse) => {
            if (!data) return;

            // on donne les donnees a l'ui
            displayPicture(data);

            const liens = data.links || (data.photo && data.photo.links);

            if (!liens) {
                console.error("aucun lien hypermedia trouve dans la reponse");
                displayCategory(null);
                displayComments([]);
                return;
            }

            // gere le texte au dessus des commentaires
            if (liens.categorie && liens.categorie.href) {
                loadResource<categorynode>(liens.categorie.href)
                    .then((catData: categorynode) => displayCategory(catData))
                    .catch(() => displayCategory(null));
            } else {
                displayCategory(null);
            }

            // gere la liste a puces
            if (liens.comments && liens.comments.href) {
                loadResource<commentsnode>(liens.comments.href)
                    .then((comsData: commentsnode) => displayComments(comsData))
                    .catch(() => displayComments([]));
            } else {
                displayComments([]);
            }
        })
        .catch((err: unknown) => {
            // structure du catch comme vu dans la diapo du cours
            if (err instanceof Error) {
                console.error("erreur generale :", err.message);
            }
        });
}

// regarde le diese dans l'url (hashchange)
function gererChangementId(): void {
    const hash = window.location.hash.substring(1);
    const idPhoto = parseInt(hash, 10);
    getPicture(isNaN(idPhoto) ? 105 : idPhoto);
}

// relie les boutons a l'action du clic
function executerActionGalerie(action: () => Promise<gallery.galleryresponse>): void {
    action()
        .then((maGalerie: gallery.galleryresponse) => {
            // on appelle la fonction ui avec nos donnees
            gallery_ui.display_galerie(maGalerie, getPicture);
        })
        .catch((err: unknown) => {
            if (err instanceof Error) {
                console.warn("navigation de la galerie impossible :", err.message);
            }
        });
}

window.addEventListener('hashchange', gererChangementId);

window.onload = () => {
    gererChangementId();

    // recuperation des boutons dans le dom
    const btnLoad = document.querySelector('#bouton_galerie');
    const btnNext = document.querySelector('#btn_next');
    const btnPrev = document.querySelector('#btn_prev');
    const btnFirst = document.querySelector('#btn_first');
    const btnLast = document.querySelector('#btn_last');
    
    // branchement des actions
    if (btnLoad) btnLoad.addEventListener('click', () => executerActionGalerie(gallery.load));
    if (btnNext) btnNext.addEventListener('click', () => executerActionGalerie(gallery.next));
    if (btnPrev) btnPrev.addEventListener('click', () => executerActionGalerie(gallery.prev));
    if (btnFirst) btnFirst.addEventListener('click', () => executerActionGalerie(gallery.first));
    if (btnLast) btnLast.addEventListener('click', () => executerActionGalerie(gallery.last));
};