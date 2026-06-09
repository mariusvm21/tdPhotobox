// types pour les donnees du noeud photo
export interface photourl {
    href: string;
}

export interface photodetails {
    id?: number;
    titre?: string;
    descr?: string;
    description?: string;
    format?: string;
    type?: string;
    width?: number;
    height?: number;
    url?: string | photourl;
}

export interface photonode {
    photo?: photodetails;
    id?: number;
    titre?: string;
    url?: string | photourl;
}

// insere l'image et ses infos dans le dom
export function displayPicture(rawData: photonode): void {
    const sectionPhoto = document.querySelector('#la_photo');
    const titrePrincipal = document.querySelector('#titre_principal') || document.querySelector('h1');
    if (!sectionPhoto) return;

    // on va chercher l'objet et on le force en "photodetails" avec un cast (vu en cours)
    const p = (rawData.photo ? rawData.photo : rawData) as photodetails;
    const idPhoto = p.id || 105;

    // modifie le haut de la page
    if (titrePrincipal) {
        titrePrincipal.textContent = `photo : ${idPhoto}`;
    }

    // bricolage pour extraire l'url selon le format de l'api phox
    let cheminImage = "";
    if (p.url && typeof p.url === 'object' && 'href' in p.url) {
        cheminImage = p.url.href;
    } else if (typeof p.url === 'string') {
        cheminImage = p.url;
    }

    let srcComplet = "";
    if (cheminImage) {
        srcComplet = cheminImage.startsWith('http') ? cheminImage : `https://webetu.iutnc.univ-lorraine.fr${cheminImage}`;
    }

    // pointage des balises du prof dans le html
    const imgElement = sectionPhoto.querySelector('img');
    const titreElement = sectionPhoto.querySelector('h4:nth-of-type(1)'); 
    const descElement = sectionPhoto.querySelector('p:nth-of-type(1)');   
    const infoElement = sectionPhoto.querySelector('p:nth-of-type(2)');   

    // ecriture dans le dom
    if (imgElement) {
        imgElement.src = srcComplet;
        imgElement.alt = p.titre || "image";
    }
    if (titreElement) {
        titreElement.textContent = p.titre || "sans titre";
    }
    if (descElement) {
        descElement.textContent = p.descr || p.description || "aucune description.";
    }
    if (infoElement) {
        infoElement.textContent = `${p.format || p.type || "image/jpeg"}, ${p.width || "?"}x${p.height || "?"}`;
    }
}

// interface pour les categories
export interface categorynode {
    categorie?: { nom: string };
    nom?: string;
}

// gere le petit texte pour afficher la categorie de l'image
export function displayCategory(categoryData: categorynode | null): void {
    const zoneCategorie = document.querySelector('#la_categorie');
    if (!zoneCategorie) return;

    let nomCat = "inconnue";
    if (categoryData) {
        if (categoryData.categorie && categoryData.categorie.nom) {
            nomCat = categoryData.categorie.nom;
        } else if (categoryData.nom) {
            nomCat = categoryData.nom;
        }
    }
    zoneCategorie.textContent = `categorie : ${nomCat}`;
}

// structure des listes de commentaires
export interface commentitem {
    pseudo?: string;
    content?: string;
    texte?: string;
}

export interface commentsnode {
    comments?: commentitem[];
    commentaires?: commentitem[];
}

// boucle sur les reponses pour generer la liste de commentaires
export function displayComments(commentsData: commentsnode | commentitem[] | null): void {
    const listeCommentaires = document.querySelector('#les_commentaires');
    if (!listeCommentaires) return;

    listeCommentaires.innerHTML = "";

    let liste: commentitem[] = [];
    if (commentsData) {
        if (Array.isArray(commentsData)) {
            liste = commentsData;
        } else {
            liste = commentsData.comments || commentsData.commentaires || [];
        }
    }

    // si liste vide on affiche un petit message
    if (liste.length === 0) {
        listeCommentaires.innerHTML = "<li>aucun commentaire.</li>";
        return;
    }

    listeCommentaires.innerHTML = liste.map((c: commentitem) => {
        if (!c) return '';
        const auteur = c.pseudo || "anonyme";
        const contenu = c.content || c.texte || "";
        return `<li>${auteur} : ${contenu}</li>`;
    }).join('');
}