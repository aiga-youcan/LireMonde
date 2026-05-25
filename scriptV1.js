/**
 * =======================================================================
 * PROJET READSPHERE - LIREMONDE (Certification DWWM)
 * Description : Plateforme interactive de gestion et découverte de livres.
 * Compétences : Manipulation du DOM, JS Dynamique, API REST (CRUD).
 * =======================================================================
 */

// ==========================================
// CONFIGURATION & ÉTATS DE L'APPLICATION
// ==========================================
const API_URL = 'http://localhost:3000/books';

// Base de données de secours (Mock Data) au cas où json-server n'est pas lancé
const fallbackBooks = [
    { "id": "1", "titre": "Eloquent JavaScript", "auteur": "Marijn Haverbeke", "genre": "Programmation", "description": "Une plongée profonde dans les bases de JavaScript.", "couverture": "images/1.jpg", "aLire": false },
    { "id": "2", "titre": "L'Amica Geniale", "auteur": "Elena Ferrante", "genre": "Drame", "description": "L'amitié complexe de deux filles dans le Naples des années 50.", "couverture": "images/2.jpg", "aLire": true },
    { "id": "3", "titre": "The Lean Startup", "auteur": "Eric Ries", "genre": "Business", "description": "L'approche révolutionnaire pour lancer une entreprise en ligne.", "couverture": "images/3.jpg", "aLire": false },
    { "id": "4", "titre": "The Wealth of Nations", "auteur": "Adam Smith", "genre": "Finance", "description": "L'œuvre fondatrice sur l'économie et les marchés financiers.", "couverture": "images/4.jpg", "aLire": false },
    { "id": "5", "titre": "Dune", "auteur": "Frank Herbert", "genre": "Science-fiction", "description": "Sur la planète aride d'Arrakis se joue le destin de l'univers.", "couverture": "images/5.jpg", "aLire": false },
    { "id": "6", "titre": "Steve Jobs", "auteur": "Walter Isaacson", "genre": "Technologie", "description": "La biographie du visionnaire qui a révolutionné la technologie.", "couverture": "images/6.jpg", "aLire": true }
];

let tousLesLivres = [];
let genreChoisi = 'Tous';
let motRecherche = '';
let idLivreEnModification = null;
let pageActuelle = 'accueil'; // Permet de rester sur la page après une action CRUD
let modeSecours = false; // Passe à true si l'API est inaccessible

// Sélection des éléments du DOM
const DOM = {
    pages: {
        accueil: document.getElementById('sectionAccueil'),
        aLire: document.getElementById('sectionALire'),
        admin: document.getElementById('sectionAdmin')
    },
    nav: {
        accueil: document.getElementById('navAccueil'),
        aLire: document.getElementById('navALire'),
        admin: document.getElementById('navAdmin')
    },
    conteneurs: {
        grille: document.getElementById('booksGrid'),
        aLire: document.getElementById('aLireGrid'),
        admin: document.getElementById('adminTableBody'),
        filtres: document.getElementById('genresContainer')
    },
    recherche: document.getElementById('globalSearch'),
    modale: {
        conteneur: document.getElementById('detailsModal'),
        contenu: document.getElementById('modalContent'),
        boutonFermer: document.getElementById('closeModalBtn')
    },
    formulaire: {
        form: document.getElementById('bookForm'),
        titre: document.getElementById('formTitle'),
        btnAnnuler: document.getElementById('formCancelBtn')
    }
};

/**
 * =======================================================================
 * CONSOMMATION API REST (Critère : async/await, try/catch, erreurs)
 * =======================================================================
 */

// GET : récupérer tous les livres
async function apiGetTousLesLivres() {
    try {
        const reponse = await fetch(API_URL);
        if (!reponse.ok) throw new Error("Erreur réseau");
        tousLesLivres = await reponse.json();
        modeSecours = false;
    } catch (erreur) {
        console.warn("Serveur inaccessible. Passage en mode Mock Data.");
        if (tousLesLivres.length === 0) tousLesLivres = [...fallbackBooks];
        modeSecours = true;
    }
    rafraichirInterface();
}

// GET : récupérer un livre par id (Demandé dans les spécifications API)
async function apiGetLivreParId(id) {
    if (modeSecours) return tousLesLivres.find(l => l.id === id);
    try {
        const reponse = await fetch(`${API_URL}/${id}`);
        if (!reponse.ok) throw new Error("Livre non trouvé");
        return await reponse.json();
    } catch (erreur) {
        console.error("Erreur GET par ID:", erreur);
        return null;
    }
}

// POST : ajouter un livre
async function apiAjouterLivre(nouveauLivre) {
    if (modeSecours) {
        const nouvelId = String(Math.max(...tousLesLivres.map(l => Number(l.id) || 0)) + 1);
        tousLesLivres.push({ ...nouveauLivre, id: nouvelId });
    } else {
        try {
            await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nouveauLivre) });
        } catch (erreur) { console.error("Erreur POST:", erreur); }
    }
    await apiGetTousLesLivres();
}

// PUT ou PATCH : modifier un livre
async function apiModifierLivre(id, livreModifie) {
    if (modeSecours) {
        tousLesLivres = tousLesLivres.map(l => l.id === id ? { ...livreModifie, id } : l);
    } else {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(livreModifie) });
        } catch (erreur) { console.error("Erreur PUT:", erreur); }
    }
    await apiGetTousLesLivres();
}

// DELETE : supprimer un livre
async function apiSupprimerLivre(id) {
    if (modeSecours) {
        tousLesLivres = tousLesLivres.filter(l => l.id !== id);
    } else {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch (erreur) { console.error("Erreur DELETE:", erreur); }
    }
    await apiGetTousLesLivres();
}

// PATCH : ajouter / retirer de la liste “À lire”
async function apiBasculerStatutALire(id, statutActuel) {
    if (modeSecours) {
        tousLesLivres = tousLesLivres.map(l => l.id === id ? { ...l, aLire: !statutActuel } : l);
    } else {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aLire: !statutActuel }) });
        } catch (erreur) { console.error("Erreur PATCH:", erreur); }
    }
    await apiGetTousLesLivres();
}


/**
 * =======================================================================
 * AFFICHAGE DYNAMIQUE ET USER STORIES (Interface Cohérente)
 * =======================================================================
 */

function rafraichirInterface() {
    afficherFiltres();
    afficherAccueil();
    afficherListeALire();
    afficherTableauAdmin();
    naviguerVers(pageActuelle); // Mise à jour sans rechargement, on reste sur la même page
}

// USER STORY 4 : Filtrer les livres par genre
function afficherFiltres() {
    DOM.conteneurs.filtres.innerHTML = '';
    const genresUniques = ['Tous', ...new Set(tousLesLivres.map(l => l.genre))];

    genresUniques.forEach(genre => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.textContent = genre;
        btn.className = genreChoisi === genre 
            ? "px-5 py-2 rounded-xl text-sm font-bold bg-teal-600 text-white shadow-md transition-all" 
            : "px-5 py-2 rounded-xl text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all";
        
        btn.addEventListener('click', () => {
            genreChoisi = genre;
            rafraichirInterface();
        });
        DOM.conteneurs.filtres.appendChild(btn);
    });
}

// USER STORY 1 & 5 : Affichage dynamique et Recherche en temps réel
function afficherAccueil() {
    DOM.conteneurs.grille.innerHTML = '';

    const livresFiltres = tousLesLivres.filter(livre => {
        const correspondGenre = genreChoisi === 'Tous' || livre.genre === genreChoisi;
        const correspondRecherche = livre.titre.toLowerCase().includes(motRecherche.toLowerCase()) || 
                                    livre.auteur.toLowerCase().includes(motRecherche.toLowerCase());
        return correspondGenre && correspondRecherche;
    });

    // Gestion de l'état vide
    if (livresFiltres.length === 0) {
        DOM.conteneurs.grille.innerHTML = `<div class="col-span-full bg-slate-50 p-8 rounded-[1.5rem] text-center text-slate-500 border border-slate-200">Aucun livre ne correspond à votre recherche.</div>`;
        return;
    }

    livresFiltres.forEach(livre => {
        const carte = document.createElement('div');
        carte.className = "bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden";

        const texteBtn = livre.aLire ? "Retirer de la liste" : "Ajouter à lire";
        const styleBtn = livre.aLire ? "bg-rose-100 text-rose-600 hover:bg-rose-200" : "bg-teal-50 text-teal-700 hover:bg-teal-100";

        carte.innerHTML = `
            <div class="overflow-hidden">
                <img src="${livre.couverture}" class="w-full h-64 object-cover cursor-pointer hover:scale-110 transition-transform duration-500 btn-details">
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <h3 class="font-bold text-lg text-slate-800 cursor-pointer mb-1 btn-details">${livre.titre}</h3>
                <p class="text-slate-500 text-sm mb-3">${livre.auteur}</p>
                <span class="text-[11px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg w-max mb-5 border border-slate-200">${livre.genre}</span>
                <button type="button" class="mt-auto w-full py-3 rounded-xl text-sm font-bold transition-colors ${styleBtn} btn-toggle">${texteBtn}</button>
            </div>
        `;

        carte.querySelector('.btn-toggle').addEventListener('click', () => apiBasculerStatutALire(livre.id, livre.aLire));
        carte.querySelectorAll('.btn-details').forEach(btn => btn.addEventListener('click', async () => {
            // Utilisation du GET par id spécifié dans le brief
            const livreComplet = await apiGetLivreParId(livre.id);
            if(livreComplet) ouvrirModale(livreComplet);
        }));

        DOM.conteneurs.grille.appendChild(carte);
    });
}

// USER STORY 3 : Liste "À lire"
function afficherListeALire() {
    DOM.conteneurs.aLire.innerHTML = '';
    const livresALire = tousLesLivres.filter(livre => livre.aLire);

    // Gestion de l'état vide
    if (livresALire.length === 0) {
        DOM.conteneurs.aLire.innerHTML = `<div class="col-span-full bg-slate-50 p-8 rounded-[1.5rem] text-center text-slate-500 border border-slate-200">Votre liste est vide pour le moment.</div>`;
        return;
    }

    livresALire.forEach(livre => {
        const carte = document.createElement('div');
        carte.className = "flex gap-5 p-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all";
        carte.innerHTML = `
            <img src="${livre.couverture}" class="w-24 h-32 object-cover rounded-xl shadow-sm">
            <div class="flex flex-col justify-between py-1">
                <div>
                    <h3 class="font-bold text-slate-800 text-lg leading-tight mb-1">${livre.titre}</h3>
                    <p class="text-sm text-slate-500">${livre.auteur}</p>
                </div>
                <button type="button" class="text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl text-sm font-bold w-max transition-colors btn-supprimer">Retirer</button>
            </div>
        `;
        carte.querySelector('.btn-supprimer').addEventListener('click', () => apiBasculerStatutALire(livre.id, livre.aLire));
        DOM.conteneurs.aLire.appendChild(carte);
    });
}

// USER STORY 6 : Tableau de bord Administrateur (Affichage)
function afficherTableauAdmin() {
    DOM.conteneurs.admin.innerHTML = '';
    tousLesLivres.forEach(livre => {
        const ligne = document.createElement('tr');
        ligne.className = "border-b border-slate-100 hover:bg-slate-50 transition-colors";
        ligne.innerHTML = `
            <td class="p-4"><img src="${livre.couverture}" class="w-12 h-16 object-cover rounded-lg shadow-sm"></td>
            <td class="p-4 font-bold text-slate-700">${livre.titre}</td>
            <td class="p-4 text-slate-500">${livre.auteur}</td>
            <td class="p-4"><span class="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">${livre.genre}</span></td>
            <td class="p-4 text-center">
                <button type="button" class="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold text-xs mr-2 hover:bg-blue-100 transition-colors btn-editer">Éditer</button>
                <button type="button" class="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors btn-supprimer">Supprimer</button>
            </td>
        `;

        ligne.querySelector('.btn-editer').addEventListener('click', () => preparerEditionFormulaire(livre));
        ligne.querySelector('.btn-supprimer').addEventListener('click', () => {
            if (confirm(`Confirmez-vous la suppression de "${livre.titre}" ?`)) apiSupprimerLivre(livre.id);
        });
        DOM.conteneurs.admin.appendChild(ligne);
    });
}

// USER STORY 2 : Consultation des détails (Modale)
function ouvrirModale(livre) {
    DOM.modale.contenu.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8">
            <img src="${livre.couverture}" class="w-full md:w-1/3 rounded-2xl object-cover shadow-lg border border-slate-200">
            <div class="flex flex-col justify-center">
                <h2 class="text-3xl font-bold mb-3 text-slate-800">${livre.titre}</h2>
                <p class="text-slate-500 mb-5 text-lg">Par <span class="font-semibold">${livre.auteur}</span></p>
                <span class="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 w-max rounded-lg mb-6 uppercase tracking-wider">${livre.genre}</span>
                <h4 class="font-bold text-slate-800 mb-2">Résumé</h4>
                <p class="text-sm text-slate-600 leading-relaxed">${livre.description}</p>
            </div>
        </div>
    `;
    DOM.modale.conteneur.classList.remove('hidden');
}

/**
 * =======================================================================
 * LOGIQUE DU FORMULAIRE ADMIN (Ajout, Modification)
 * =======================================================================
 */

function preparerEditionFormulaire(livre) {
    idLivreEnModification = livre.id;
    document.getElementById('formTitre').value = livre.titre;
    document.getElementById('formAuteur').value = livre.auteur;
    document.getElementById('formGenre').value = livre.genre;
    document.getElementById('formDescription').value = livre.description;
    document.getElementById('formCouverture').value = livre.couverture;
    
    DOM.formulaire.titre.textContent = "Modifier les informations du livre";
    document.getElementById('formSubmitBtn').textContent = "Mettre à jour";
    DOM.formulaire.btnAnnuler.classList.remove('hidden');
    
    // Remonter en haut de la page pour voir le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reinitialiserFormulaire() {
    idLivreEnModification = null;
    DOM.formulaire.form.reset();
    DOM.formulaire.titre.textContent = "Ajouter un nouveau livre";
    document.getElementById('formSubmitBtn').textContent = "Enregistrer";
    DOM.formulaire.btnAnnuler.classList.add('hidden');
}

DOM.formulaire.form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche le rechargement (Critère de performance)

    const donneesLivre = {
        titre: document.getElementById('formTitre').value.trim(),
        auteur: document.getElementById('formAuteur').value.trim(),
        genre: document.getElementById('formGenre').value,
        description: document.getElementById('formDescription').value.trim(),
        couverture: document.getElementById('formCouverture').value.trim(),
        aLire: false // Par défaut
    };

    try {
        if (idLivreEnModification) {
            const ancienLivre = tousLesLivres.find(l => l.id === idLivreEnModification);
            donneesLivre.aLire = ancienLivre.aLire; // Conserver le statut "À lire"
            await apiModifierLivre(idLivreEnModification, donneesLivre);
        } else {
            await apiAjouterLivre(donneesLivre);
        }
        reinitialiserFormulaire();
    } catch (erreur) {
        alert("Une erreur est survenue lors de l'enregistrement.");
    }
});

DOM.formulaire.btnAnnuler.addEventListener('click', reinitialiserFormulaire);

/**
 * =======================================================================
 * NAVIGATION (DOM mis à jour dynamiquement sans rechargement)
 * =======================================================================
 */

function naviguerVers(pageDemandee) {
    pageActuelle = pageDemandee;
    
    // Cacher toutes les sections
    Object.values(DOM.pages).forEach(page => page.classList.add('hidden'));
    Object.values(DOM.nav).forEach(lien => lien.classList.remove('active'));

    // Afficher la bonne section
    DOM.pages[pageDemandee].classList.remove('hidden');
    DOM.nav[pageDemandee].classList.add('active');
}

// Écouteurs de navigation Navbar
DOM.nav.accueil.addEventListener('click', () => naviguerVers('accueil'));
DOM.nav.aLire.addEventListener('click', () => naviguerVers('aLire'));
DOM.nav.admin.addEventListener('click', () => naviguerVers('admin'));

// Barre de recherche
DOM.recherche.addEventListener('input', (event) => { 
    motRecherche = event.target.value; 
    rafraichirInterface(); 
});

// Écouteurs Modale
DOM.modale.boutonFermer.addEventListener('click', () => DOM.modale.conteneur.classList.add('hidden'));
DOM.modale.conteneur.addEventListener('click', (event) => {
    if (event.target === DOM.modale.conteneur) DOM.modale.conteneur.classList.add('hidden');
});

/**
 * =======================================================================
 * INITIALISATION DE L'APPLICATION
 * =======================================================================
 */
// Lancement de la première requête GET au démarrage
apiGetTousLesLivres();