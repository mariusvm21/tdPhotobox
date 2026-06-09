# TD Mini-Projet : Photobox 

**Auteur :** Marius VALEUR--MASELLI

## 📋 Description du projet
Ce projet est une Single Page Application (SPA) développée en TypeScript, utilisant l'API Phox de l'IUT. Il permet de naviguer de manière asynchrone dans une galerie d'images, d'en consulter les détails, les catégories et les commentaires, le tout sans rechargement de page grâce à l'API `fetch`.

## 🚀 Fonctionnalités réalisées

Toutes les fonctionnalités obligatoires (Exercices 1 à 4) ont été implémentées avec succès :

* **Exercice 1 : Affichage d'une image détaillée**
  * Chargement asynchrone de la photo par défaut (105) ou via l'identifiant dans l'URL (`#id`).
  * Requêtes en cascade pour récupérer et afficher la catégorie et la liste des commentaires associés à la photo.
* **Exercice 2 : Affichage de la galerie de photos**
  * Chargement de la liste des photos depuis l'API.
  * Génération dynamique d'une grille de miniatures (vignettes) stylisées.
* **Exercice 3 : Navigation dans les galeries (Pagination)**
  * Implémentation des boutons de navigation (`First`, `Prev`, `Load`, `Next`, `Last`).
  * Stockage interne des liens hypermédias fournis par l'API pour naviguer de manière fluide d'une page à l'autre.
* **Exercice 4 : Affichage dynamique au clic**
  * Rendu des vignettes cliquables via l'attribut `data-photoId`.
  * Au clic sur une miniature : mise à jour instantanée de la photo principale, mise à jour de l'URL (`window.location.hash`), et défilement automatique (scroll) fluide vers le haut de la page.

## 🛠️ Qualité du code et contraintes techniques respectées
* **Architecture modulaire :** Découpage strict en modules (`config`, `photoloader`, `ui`, `gallery`, `gallery_ui`, `index`) compilés via ESBuild.
* **TypeScript Strict :** Remplacement intégral des types `any` implicites par des **Interfaces TypeScript** (`photonode`, `gallerydata`, etc.) pour correspondre exactement à la structure JSON de l'API.
* **Gestion des Promesses :** Utilisation de la généricité (`<T>`) pour les requêtes `fetch`, utilisation du mot-clé `as` pour le typage des réponses, et gestion des erreurs sécurisée (`catch (err: unknown)` avec vérification `instanceof Error`) conformément aux cours.

## ⚙️ Installation et Lancement
1. Installer les dépendances : `npm install`
2. Compiler le code TypeScript : `npm run build`
3. Lancer l'application via un serveur local (ex: XAMPP sur `http://localhost/.../index.html`).
*(Note : L'accès aux images nécessitant des requêtes cross-origin hors IUT, l'option `credentials: 'include'` a été configurée dans les requêtes fetch).*