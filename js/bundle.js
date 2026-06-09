(() => {
  // ts/config.ts
  var config = {
    baseUrl: "https://webetu.iutnc.univ-lorraine.fr/www/canals5/phox/api"
  };

  // ts/photoloader.ts
  var ROOT_URL = "https://webetu.iutnc.univ-lorraine.fr";
  function loadPicture(idPicture) {
    const url = `${config.baseUrl}/photos/${idPicture}`;
    return loadResource(url);
  }
  function loadResource(uri) {
    let fullUrl = uri;
    if (uri.startsWith("/api")) {
      fullUrl = `${ROOT_URL}/www/canals5/phox${uri}`;
    } else if (uri.startsWith("/www")) {
      fullUrl = `${ROOT_URL}${uri}`;
    }
    if (fullUrl.endsWith("/")) {
      fullUrl = fullUrl.slice(0, -1);
    }
    const fetchOptions = {
      method: "GET",
      credentials: "include"
    };
    return fetch(fullUrl, fetchOptions).then((response) => {
      if (!response.ok) {
        throw new Error(`erreur reseau http : ${response.status} sur l'url : ${fullUrl}`);
      }
      return response.json();
    }).catch((error) => {
      if (error instanceof Error) {
        console.error(`echec du fetch sur [${fullUrl}] :`, error.message);
      }
      throw error;
    });
  }

  // ts/ui.ts
  function displayPicture(rawData) {
    const sectionPhoto = document.querySelector("#la_photo");
    const titrePrincipal = document.querySelector("#titre_principal") || document.querySelector("h1");
    if (!sectionPhoto) return;
    const p = rawData.photo ? rawData.photo : rawData;
    const idPhoto = p.id || 105;
    if (titrePrincipal) {
      titrePrincipal.textContent = `photo : ${idPhoto}`;
    }
    let cheminImage = "";
    if (p.url && typeof p.url === "object" && "href" in p.url) {
      cheminImage = p.url.href;
    } else if (typeof p.url === "string") {
      cheminImage = p.url;
    }
    let srcComplet = "";
    if (cheminImage) {
      srcComplet = cheminImage.startsWith("http") ? cheminImage : `https://webetu.iutnc.univ-lorraine.fr${cheminImage}`;
    }
    const imgElement = sectionPhoto.querySelector("img");
    const titreElement = sectionPhoto.querySelector("h4:nth-of-type(1)");
    const descElement = sectionPhoto.querySelector("p:nth-of-type(1)");
    const infoElement = sectionPhoto.querySelector("p:nth-of-type(2)");
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
  function displayCategory(categoryData) {
    const zoneCategorie = document.querySelector("#la_categorie");
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
  function displayComments(commentsData) {
    const listeCommentaires = document.querySelector("#les_commentaires");
    if (!listeCommentaires) return;
    listeCommentaires.innerHTML = "";
    let liste = [];
    if (commentsData) {
      if (Array.isArray(commentsData)) {
        liste = commentsData;
      } else {
        liste = commentsData.comments || commentsData.commentaires || [];
      }
    }
    if (liste.length === 0) {
      listeCommentaires.innerHTML = "<li>aucun commentaire.</li>";
      return;
    }
    listeCommentaires.innerHTML = liste.map((c) => {
      if (!c) return "";
      const auteur = c.pseudo || "anonyme";
      const contenu = c.content || c.texte || "";
      return `<li>${auteur} : ${contenu}</li>`;
    }).join("");
  }

  // ts/gallery.ts
  var liensPagination = {};
  function chargerDepuisUrl(url) {
    return loadResource(url).then((data) => {
      liensPagination = data.links || {};
      return {
        photos: data.photos || [],
        links: data.links || {}
      };
    }).catch((error) => {
      if (error instanceof Error) {
        console.error("erreur de chargement de la galerie :", error.message);
      }
      throw error;
    });
  }
  function load() {
    const urlInitiale = `${config.baseUrl}/photos`;
    return chargerDepuisUrl(urlInitiale);
  }
  function next() {
    if (liensPagination.next && liensPagination.next.href) {
      return chargerDepuisUrl(liensPagination.next.href);
    }
    return Promise.reject(new Error("pas de page suivante"));
  }
  function prev() {
    if (liensPagination.prev && liensPagination.prev.href) {
      return chargerDepuisUrl(liensPagination.prev.href);
    }
    return Promise.reject(new Error("pas de page precedente"));
  }
  function first() {
    if (liensPagination.first && liensPagination.first.href) {
      return chargerDepuisUrl(liensPagination.first.href);
    }
    return Promise.reject(new Error("deja sur la premiere page"));
  }
  function last() {
    if (liensPagination.last && liensPagination.last.href) {
      return chargerURLDernierePageFix(liensPagination.last.href);
    }
    return Promise.reject(new Error("pas de derniere page"));
  }
  function chargerURLDernierePageFix(url) {
    return chargerDepuisUrl(url);
  }

  // ts/gallery_ui.ts
  function display_galerie(galerie, onPhotoClick) {
    const conteneurGalerie = document.querySelector("#la_galerie");
    if (!conteneurGalerie) {
      console.error("conteneur #la_galerie introuvable dans le html");
      return;
    }
    if (!galerie.photos || galerie.photos.length === 0) {
      conteneurGalerie.innerHTML = "<p>aucune photo dans la galerie.</p>";
      return;
    }
    const htmlVignettes = galerie.photos.map((item) => {
      const p = item.photo;
      const id = p.id;
      const titre = p.titre || "sans titre";
      let urlVignette = "";
      if (p.thumbnail && p.thumbnail.href) {
        urlVignette = p.thumbnail.href;
      } else if (p.thumbnailUrl) {
        urlVignette = p.thumbnailUrl;
      }
      if (urlVignette && !urlVignette.startsWith("http")) {
        urlVignette = `https://webetu.iutnc.univ-lorraine.fr${urlVignette}`;
      }
      return `
            <div class="vignette" data-photoId="${id}">
                <img src="${urlVignette}" alt="${titre}" data-photoId="${id}">
                <p>${titre}</p>
            </div>
        `;
    }).join("");
    conteneurGalerie.innerHTML = htmlVignettes;
    if (onPhotoClick) {
      const vignettes = conteneurGalerie.querySelectorAll(".vignette");
      vignettes.forEach((vignette) => {
        vignette.style.cursor = "pointer";
        vignette.addEventListener("click", () => {
          const idAttr = vignette.getAttribute("data-photoId");
          if (idAttr) {
            const id = parseInt(idAttr, 10);
            onPhotoClick(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.history.pushState(null, "", `#${id}`);
          }
        });
      });
    }
  }

  // ts/index.ts
  function getPicture(id) {
    loadPicture(id).then((data) => {
      if (!data) return;
      displayPicture(data);
      const liens = data.links || data.photo && data.photo.links;
      if (!liens) {
        console.error("aucun lien hypermedia trouve dans la reponse");
        displayCategory(null);
        displayComments([]);
        return;
      }
      if (liens.categorie && liens.categorie.href) {
        loadResource(liens.categorie.href).then((catData) => displayCategory(catData)).catch(() => displayCategory(null));
      } else {
        displayCategory(null);
      }
      if (liens.comments && liens.comments.href) {
        loadResource(liens.comments.href).then((comsData) => displayComments(comsData)).catch(() => displayComments([]));
      } else {
        displayComments([]);
      }
    }).catch((err) => {
      if (err instanceof Error) {
        console.error("erreur generale :", err.message);
      }
    });
  }
  function gererChangementId() {
    const hash = window.location.hash.substring(1);
    const idPhoto = parseInt(hash, 10);
    getPicture(isNaN(idPhoto) ? 105 : idPhoto);
  }
  function executerActionGalerie(action) {
    action().then((maGalerie) => {
      display_galerie(maGalerie, getPicture);
    }).catch((err) => {
      if (err instanceof Error) {
        console.warn("navigation de la galerie impossible :", err.message);
      }
    });
  }
  window.addEventListener("hashchange", gererChangementId);
  window.onload = () => {
    gererChangementId();
    const btnLoad = document.querySelector("#bouton_galerie");
    const btnNext = document.querySelector("#btn_next");
    const btnPrev = document.querySelector("#btn_prev");
    const btnFirst = document.querySelector("#btn_first");
    const btnLast = document.querySelector("#btn_last");
    if (btnLoad) btnLoad.addEventListener("click", () => executerActionGalerie(load));
    if (btnNext) btnNext.addEventListener("click", () => executerActionGalerie(next));
    if (btnPrev) btnPrev.addEventListener("click", () => executerActionGalerie(prev));
    if (btnFirst) btnFirst.addEventListener("click", () => executerActionGalerie(first));
    if (btnLast) btnLast.addEventListener("click", () => executerActionGalerie(last));
  };
})();
