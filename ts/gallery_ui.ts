// interfaces pour typer la galerie proprement sans aucun any comme vu en cours
export interface photolink {
    href?: string;
}

export interface photodata {
    id: number;
    titre?: string;
    thumbnail?: photolink;
    thumbnailUrl?: string;
}

export interface galleryitem {
    photo: photodata;
}

export interface gallerydata {
    photos?: galleryitem[];
}

// affiche l'ensemble de la galerie sous forme de vignettes
export function display_galerie(galerie: gallerydata, onPhotoClick?: (id: number) => void): void {
    const conteneurGalerie = document.querySelector('#la_galerie');
    
    // securite au cas ou la div est introuvable dans le html
    if (!conteneurGalerie) {
        console.error("conteneur #la_galerie introuvable dans le html");
        return;
    }

    // message d'erreur s'il n'y a rien a afficher
    if (!galerie.photos || galerie.photos.length === 0) {
        conteneurGalerie.innerHTML = "<p>aucune photo dans la galerie.</p>";
        return;
    }

    // on cree le html de toutes les miniatures
    const htmlVignettes = galerie.photos.map((item: galleryitem) => {
        const p = item.photo;
        const id = p.id;
        const titre = p.titre || "sans titre";
        
        let urlVignette = "";
        if (p.thumbnail && p.thumbnail.href) {
            urlVignette = p.thumbnail.href;
        } else if (p.thumbnailUrl) {
            urlVignette = p.thumbnailUrl;
        }

        // convertit en lien absolu pour le hors vpn
        if (urlVignette && !urlVignette.startsWith('http')) {
            urlVignette = `https://webetu.iutnc.univ-lorraine.fr${urlVignette}`;
        }

        return `
            <div class="vignette" data-photoId="${id}">
                <img src="${urlVignette}" alt="${titre}" data-photoId="${id}">
                <p>${titre}</p>
            </div>
        `;
    }).join('');

    conteneurGalerie.innerHTML = htmlVignettes;

    // on ajoute les ecouteurs pour que les images soient cliquables
    if (onPhotoClick) {
        // on recupere tout ce qu'on vient d'injecter
        const vignettes = conteneurGalerie.querySelectorAll('.vignette');
        
        vignettes.forEach((vignette) => {
            // modifie le style pour montrer que c'est une zone active
            (vignette as HTMLElement).style.cursor = 'pointer';
            
            vignette.addEventListener('click', () => {
                // on lit la donnee cachee dans l'attribut
                const idAttr = vignette.getAttribute('data-photoId');
                if (idAttr) {
                    const id = parseInt(idAttr, 10);
                    
                    // on charge l'image en grand
                    onPhotoClick(id);
                    
                    // petit effet sympa pour remonter la page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    // on change le lien en haut dans l'url
                    window.history.pushState(null, '', `#${id}`);
                }
            });
        });
    }
}