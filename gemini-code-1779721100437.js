let API_URL = 'http://localhost:3000/books';

let fallbackBooks = [
    { "id": "1", "titre": "Eloquent JavaScript", "auteur": "Marijn Haverbeke", "genre": "Programmation", "description": "Une plongée profonde dans les bases de JavaScript.", "couverture": "images/1.jpg", "aLire": false },
    { "id": "2", "titre": "L'Amica Geniale", "auteur": "Elena Ferrante", "genre": "Drame", "description": "L'amitié complexe de deux filles dans le Naples des années 50.", "couverture": "images/2.jpg", "aLire": true },
    { "id": "3", "titre": "The Lean Startup", "auteur": "Eric Ries", "genre": "Business", "description": "L'approche révolutionnaire pour lancer une entreprise en ligne.", "couverture": "images/3.jpg", "aLire": false },
    { "id": "4", "titre": "The Wealth of Nations", "auteur": "Adam Smith", "genre": "Finance", "description": "L'œuvre fondatrice sur l'économie et les marchés financiers.", "couverture": "images/4.jpg", "aLire": false },
    { "id": "5", "titre": "Dune", "auteur": "Frank Herbert", "genre": "Science-fiction", "description": "Sur la planète aride d'Arrakis se joue le destin de l'univers.", "couverture": "images/5.jpg", "aLire": false },
    { "id": "6", "titre": "Steve Jobs", "auteur": "Walter Isaacson", "genre": "Technologie", "description": "La biographie du visionnaire qui a révolutionné la technologie.", "couverture": "images/6.jpg", "aLire": true }
];

let allBooks = [];
let selectedGenre = 'Tous';
let searchQuery = '';
let isUsingFallback = false; 
let editingBookALire = false;

// ربط العناصر مع HTML بطريقة بسيطة
let sectionAccueil = document.getElementById('sectionAccueil');
let sectionALire = document.getElementById('sectionALire');
let sectionAdmin = document.getElementById('sectionAdmin');

let navAccueil = document.getElementById('navAccueil');
let navALire = document.getElementById('navALire');
let navAdmin = document.getElementById('navAdmin');

let booksGrid = document.getElementById('booksGrid');
let aLireGrid = document.getElementById('aLireGrid');
let adminTableBody = document.getElementById('adminTableBody');
let genresContainer = document.getElementById('genresContainer');
let globalSearch = document.getElementById('globalSearch');

// دالة جلب البيانات باستعمال then بدل async/await
function fetchBooks() {
    fetch(API_URL)
        .then(function(response) {
            if (response.ok === false) {
                throw new Error("Erreur de serveur");
            }
            return response.json();
        })
        .then(function(data) {
            allBooks = data;
            isUsingFallback = false;
            renderApp();
        })
        .catch(function(error) {
            console.warn("json-server طافي! تم تشغيل القائمة الاحتياطية.");
            if (allBooks.length === 0) {
                // نسخ المصفوفة باستخدام for loop
                allBooks = [];
                for (let i = 0; i < fallbackBooks.length; i++) {
                    allBooks.push(fallbackBooks[i]);
                }
            }
            isUsingFallback = true;
            renderApp();
        });
}

function addLivre(livre) {
    if (isUsingFallback === true) {
        let maxId = 0;
        for (let i = 0; i < allBooks.length; i++) {
            let currentId = Number(allBooks[i].id);
            if (currentId > maxId) {
                maxId = currentId;
            }
        }
        livre.id = String(maxId + 1);
        allBooks.push(livre);
        renderApp();
    } else {
        fetch(API_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(livre) 
        }).then(function() {
            fetchBooks();
        });
    }
}

function updateLivre(id, livreModifie) {
    if (isUsingFallback === true) {
        for (let i = 0; i < allBooks.length; i++) {
            if (allBooks[i].id === id) {
                allBooks[i] = livreModifie;
                allBooks[i].id = id;
            }
        }
        renderApp();
    } else {
        fetch(API_URL + '/' + id, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(livreModifie) 
        }).then(function() {
            fetchBooks();
        });
    }
}

function deleteLivre(id) {
    if (isUsingFallback === true) {
        let newBooksArray = [];
        for (let i = 0; i < allBooks.length; i++) {
            if (allBooks[i].id !== id) {
                newBooksArray.push(allBooks[i]);
            }
        }
        allBooks = newBooksArray;
        renderApp();
    } else {
        fetch(API_URL + '/' + id, { 
            method: 'DELETE' 
        }).then(function() {
            fetchBooks();
        });
    }
}

function toggleALire(id, currentStatus) {
    let nvStatus = false;
    if (currentStatus === false) {
        nvStatus = true;
    }

    if (isUsingFallback === true) {
        for (let i = 0; i < allBooks.length; i++) {
            if (allBooks[i].id === id) {
                allBooks[i].aLire = nvStatus;
            }
        }
        renderApp();
    } else {
        fetch(API_URL + '/' + id, { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ aLire: nvStatus }) 
        }).then(function() {
            fetchBooks();
        });
    }
}

function renderApp() {
    renderGenres();
    renderAccueil();
    renderALireSection();
    renderAdminTable();
}

function renderGenres() {
    // استخراج الأنواع باستخدام for loop بدل Set
    let genres = ['Tous'];
    for (let i = 0; i < allBooks.length; i++) {
        let genreActuel = allBooks[i].genre;
        let existeDeja = false;
        
        for (let j = 0; j < genres.length; j++) {
            if (genres[j] === genreActuel) {
                existeDeja = true;
            }
        }
        
        if (existeDeja === false) {
            genres.push(genreActuel);
        }
    }

    genresContainer.innerHTML = '';
    
    for (let i = 0; i < genres.length; i++) {
        let genre = genres[i];
        let btn = document.createElement('button');
        btn.textContent = genre;
        
        // استخدام if/else بدل Ternary Operator
        if (selectedGenre === genre) {
            btn.className = "px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-900/50";
        } else {
            btn.className = "px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white";
        }

        btn.addEventListener('click', function() { 
            selectedGenre = genre; 
            renderGenres(); 
            renderAccueil(); 
        });
        
        genresContainer.appendChild(btn);
    }
}

function renderAccueil() {
    booksGrid.innerHTML = '';
    
    // فلترة الكتب باستخدام for loop 
    let filteredBooks = [];
    for (let i = 0; i < allBooks.length; i++) {
        let livre = allBooks[i];
        
        let matchGenre = false;
        if (selectedGenre === 'Tous' || livre.genre === selectedGenre) {
            matchGenre = true;
        }

        let titreMinuscule = livre.titre.toLowerCase();
        let auteurMinuscule = livre.auteur.toLowerCase();
        let rechercheMinuscule = searchQuery.toLowerCase();
        
        let matchSearch = false;
        if (titreMinuscule.includes(rechercheMinuscule) || auteurMinuscule.includes(rechercheMinuscule)) {
            matchSearch = true;
        }

        if (matchGenre === true && matchSearch === true) {
            filteredBooks.push(livre);
        }
    }

    if (filteredBooks.length === 0) {
        booksGrid.innerHTML = '<div class="col-span-full bg-slate-800/50 p-8 rounded-xl shadow-sm text-center text-sm text-slate-400 border border-slate-700">Aucun livre trouvé. Essayez un autre mot-clé ou sélectionnez un autre genre.</div>';
        return;
    }

    for (let i = 0; i < filteredBooks.length; i++) {
        let livre = filteredBooks[i];
        let card = document.createElement('div');
        card.className = "flex flex-col justify-between p-4 space-y-3";
        
        let btnClass = "";
        let btnText = "";
        
        if (livre.aLire === true) {
            btnClass = "w-full py-2 rounded-lg text-xs font-semibold transition btn-toggle-lire cursor-pointer border bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30";
            btnText = "Retirer de À lire";
        } else {
            btnClass = "w-full py-2 rounded-lg text-xs font-semibold transition btn-toggle-lire cursor-pointer border bg-violet-600/20 border-violet-500/30 text-violet-400 hover:bg-violet-600/40 hover:text-violet-200";
            btnText = "Ajouter à À lire";
        }

        card.innerHTML = `
            <img src="${livre.couverture}" alt="${livre.titre}" class="w-full book-img cursor-pointer btn-detail shadow-sm">
            <div class="flex-grow">
                <h3 class="font-bold text-white text-base cursor-pointer btn-detail leading-snug">${livre.titre}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Par: ${livre.auteur}</p>
                <span class="inline-block bg-violet-900/50 border border-violet-800 text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 uppercase tracking-wider">${livre.genre}</span>
            </div>
            <button class="${btnClass}">${btnText}</button>
        `;
        
        card.querySelector('.btn-toggle-lire').addEventListener('click', function() {
            toggleALire(livre.id, livre.aLire);
        });
        
        let detailsBtns = card.querySelectorAll('.btn-detail');
        for (let j = 0; j < detailsBtns.length; j++) {
            detailsBtns[j].addEventListener('click', function() {
                showDetails(livre);
            });
        }
        
        booksGrid.appendChild(card);
    }
}

function renderALireSection() {
    aLireGrid.innerHTML = '';
    
    let toReadBooks = [];
    for (let i = 0; i < allBooks.length; i++) {
        if (allBooks[i].aLire === true) {
            toReadBooks.push(allBooks[i]);
        }
    }

    if (toReadBooks.length === 0) {
        aLireGrid.innerHTML = '<div class="col-span-full bg-slate-800/50 p-8 rounded-xl shadow-sm text-center text-sm text-slate-400 border border-slate-700">Votre liste « À lire » est vide pour le moment. Ajoutez un livre dans l\'accueil.</div>';
        return;
    }
    
    for (let i = 0; i < toReadBooks.length; i++) {
        let livre = toReadBooks[i];
        let card = document.createElement('div');
        card.className = "bg-slate-800/80 rounded-xl shadow-sm overflow-hidden flex p-3 gap-4 border border-slate-700";
        card.innerHTML = `
            <img src="${livre.couverture}" class="w-16 h-24 object-cover rounded-lg shadow-sm">
            <div class="flex flex-col justify-between flex-grow">
                <div>
                    <h3 class="font-bold text-white text-sm leading-tight">${livre.titre}</h3>
                    <p class="text-xs text-slate-400 mt-0.5">${livre.auteur}</p>
                </div>
                <button class="text-left text-xs text-rose-500 font-semibold hover:text-rose-400 hover:underline cursor-pointer btn-retirer">Supprimer</button>
            </div>
        `;
        
        card.querySelector('.btn-retirer').addEventListener('click', function() {
            toggleALire(livre.id, livre.aLire);
        });
        
        aLireGrid.appendChild(card);
    }
}

function renderAdminTable() {
    adminTableBody.innerHTML = '';
    
    for (let i = 0; i < allBooks.length; i++) {
        let livre = allBooks[i];
        let tr = document.createElement('tr');
        tr.className = "hover:bg-slate-700/30 transition-colors";
        tr.innerHTML = `
            <td class="p-4"><img src="${livre.couverture}" class="w-8 h-12 object-cover rounded shadow-sm"></td>
            <td class="p-4 font-bold text-white">${livre.titre}</td>
            <td class="p-4 text-slate-400">${livre.auteur}</td>
            <td class="p-4"><span class="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-medium border border-slate-600">${livre.genre}</span></td>
            <td class="p-4 text-center space-x-1">
                <button class="bg-violet-600 text-white text-xs px-2.5 py-1 rounded-md hover:bg-violet-500 btn-edit cursor-pointer transition">Modifier</button>
                <button class="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-md hover:bg-rose-500 btn-delete cursor-pointer transition">Supprimer</button>
            </td>
        `;
        
        tr.querySelector('.btn-edit').addEventListener('click', function() {
            setupEditForm(livre);
        });
        
        tr.querySelector('.btn-delete').addEventListener('click', function() {
            if(confirm('Voulez-vous vraiment supprimer ce livre ?') === true) {
                deleteLivre(livre.id);
            }
        });
        
        adminTableBody.appendChild(tr);
    }
}

function showDetails(livre) {
    document.getElementById('modalContent').innerHTML = `
        <div class="flex flex-col sm:flex-row gap-5">
            <img src="${livre.couverture}" class="w-full sm:w-36 h-52 object-cover rounded-xl shadow-lg border border-slate-700">
            <div class="space-y-2">
                <h2 class="text-xl font-bold text-white">${livre.titre}</h2>
                <p class="text-xs text-slate-400"><strong>Auteur :</strong> ${livre.auteur}</p>
                <p class="text-xs text-slate-300"><strong>Genre :</strong> <span class="bg-violet-900/50 border border-violet-800 text-violet-300 px-2 py-0.5 rounded font-semibold">${livre.genre}</span></p>
                <p class="text-sm text-slate-300 leading-relaxed pt-3 mt-3 border-t border-slate-700">${livre.description}</p>
            </div>
        </div>
    `;
    document.getElementById('detailsModal').classList.remove('hidden');
}

function switchTab(activeTab) {
    // إخفاء كل الأقسام
    sectionAccueil.classList.add('hidden');
    sectionALire.classList.add('hidden');
    sectionAdmin.classList.add('hidden');
    
    navAccueil.classList.remove('active');
    navALire.classList.remove('active');
    navAdmin.classList.remove('active');

    // إظهار القسم المطلوب فقط باستخدام if
    if (activeTab === 'accueil') {
        sectionAccueil.classList.remove('hidden');
        navAccueil.classList.add('active');
    } else if (activeTab === 'aLire') {
        sectionALire.classList.remove('hidden');
        navALire.classList.add('active');
    } else if (activeTab === 'admin') {
        sectionAdmin.classList.remove('hidden');
        navAdmin.classList.add('active');
    }
}

let bookForm = document.getElementById('bookForm');
let formTitle = document.getElementById('formTitle');
let formCancelBtn = document.getElementById('formCancelBtn');
let bookIdField = document.getElementById('bookId');

function getBookFormData() {
    let newLivre = {};
    newLivre.titre = document.getElementById('formTitre').value.trim();
    newLivre.auteur = document.getElementById('formAuteur').value.trim();
    newLivre.genre = document.getElementById('formGenre').value;
    newLivre.description = document.getElementById('formDescription').value.trim();
    newLivre.couverture = document.getElementById('formCouverture').value.trim();
    newLivre.aLire = false;
    
    return newLivre;
}

function clearForm() {
    bookIdField.value = '';
    editingBookALire = false;
    bookForm.reset();
    formTitle.textContent = 'Ajouter un nouveau livre';
    formCancelBtn.classList.add('hidden');
    document.getElementById('formSubmitBtn').textContent = 'Enregistrer';
}

function setupEditForm(livre) {
    bookIdField.value = livre.id;
    editingBookALire = livre.aLire;
    document.getElementById('formTitre').value = livre.titre;
    document.getElementById('formAuteur').value = livre.auteur;
    document.getElementById('formGenre').value = livre.genre;
    document.getElementById('formDescription').value = livre.description;
    document.getElementById('formCouverture').value = livre.couverture;
    
    formTitle.textContent = 'Modifier le livre';
    document.getElementById('formSubmitBtn').textContent = 'Mettre à jour';
    formCancelBtn.classList.remove('hidden');
    
    switchTab('admin');
}

bookForm.addEventListener('submit', function(event) {
    event.preventDefault();
    let livreData = getBookFormData();
    let editingId = bookIdField.value;
    
    if (editingId !== "") {
        livreData.aLire = editingBookALire;
        updateLivre(editingId, livreData);
    } else {
        addLivre(livreData);
    }
    
    clearForm();
});

formCancelBtn.addEventListener('click', function() {
    clearForm();
});

navAccueil.addEventListener('click', function() { switchTab('accueil'); });
navALire.addEventListener('click', function() { switchTab('aLire'); });
navAdmin.addEventListener('click', function() { switchTab('admin'); });

globalSearch.addEventListener('input', function(e) { 
    searchQuery = e.target.value; 
    renderAccueil(); 
});

document.getElementById('closeModalBtn').addEventListener('click', function() { 
    document.getElementById('detailsModal').classList.add('hidden'); 
});

document.getElementById('detailsModal').addEventListener('click', function(event) {
    if (event.target.id === 'detailsModal') {
        document.getElementById('detailsModal').classList.add('hidden');
    }
});

// تشغيل عند أول فتح
fetchBooks();