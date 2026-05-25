const API_URL = 'http://localhost:3000/books';

// لستة احتياطية (Mock Data) باش يلا كان السيرفر طافي، السيت يبان عامر ف الديزاين!
const fallbackBooks = [
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

// ربط العناصر
const sections = {
    accueil: document.getElementById('sectionAccueil'),
    aLire: document.getElementById('sectionALire'),
    admin: document.getElementById('sectionAdmin')
};
const navLinks = {
    accueil: document.getElementById('navAccueil'),
    aLire: document.getElementById('navALire'),
    admin: document.getElementById('navAdmin')
};

const booksGrid = document.getElementById('booksGrid');
const aLireGrid = document.getElementById('aLireGrid');
const adminTableBody = document.getElementById('adminTableBody');
const genresContainer = document.getElementById('genresContainer');
const globalSearch = document.getElementById('globalSearch');

// دالة جلب البيانات الذكية
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error();
        allBooks = await response.json();
        isUsingFallback = false;
    } catch (error) {
        console.warn("json-server طافي! تم تشغيل القائمة الاحتياطية لعرض الديزاين.");
        if (allBooks.length === 0) {
            allBooks = [...fallbackBooks];
        }
        isUsingFallback = true;
    }
    renderApp();
}

// الدالات التفاعلية الأخرى
async function addLivre(livre) {
    if (isUsingFallback) {
        const nextId = String(allBooks.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1);
        allBooks.push({ ...livre, id: nextId });
        renderApp();
        return;
    }
    await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(livre) });
    await fetchBooks();
}

async function updateLivre(id, livreModifie) {
    if (isUsingFallback) {
        allBooks = allBooks.map(b => b.id === id ? { ...livreModifie, id } : b);
        renderApp();
        return;
    }
    await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(livreModifie) });
    await fetchBooks();
}

async function deleteLivre(id) {
    if (isUsingFallback) {
        allBooks = allBooks.filter(b => b.id !== id); renderApp(); return;
    }
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    await fetchBooks();
}

async function toggleALire(id, currentStatus) {
    if (isUsingFallback) {
        allBooks = allBooks.map(b => b.id === id ? { ...b, aLire: !currentStatus } : b); renderApp(); return;
    }
    await fetch(`${API_URL}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aLire: !currentStatus }) });
    await fetchBooks();
}

// رسم الفلاتر والكتوبة (Dark Mode UI)
function renderApp() {
    renderGenres();
    renderAccueil();
    renderALireSection();
    renderAdminTable();
}

function renderGenres() {
    const genres = ['Tous', ...new Set(allBooks.map(b => b.genre))];
    genresContainer.innerHTML = '';
    genres.forEach(genre => {
        const btn = document.createElement('button');
        btn.textContent = genre;
        // الألوان تبدلات للبنفسجي والرمادي الغامق
        btn.className = `px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
            selectedGenre === genre ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-900/50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
        }`;
        btn.addEventListener('click', () => { selectedGenre = genre; renderGenres(); renderAccueil(); });
        genresContainer.appendChild(btn);
    });
}

function renderAccueil() {
    booksGrid.innerHTML = '';
    const filtered = allBooks.filter(l => {
        const mG = selectedGenre === 'Tous' || l.genre === selectedGenre;
        const mS = l.titre.toLowerCase().includes(searchQuery.toLowerCase()) || l.auteur.toLowerCase().includes(searchQuery.toLowerCase());
        return mG && mS;
    });

    if (filtered.length === 0) {
        booksGrid.innerHTML = `<div class="col-span-full bg-slate-800/50 p-8 rounded-xl shadow-sm text-center text-sm text-slate-400 border border-slate-700">Aucun livre trouvé. Essayez un autre mot-clé ou sélectionnez un autre genre.</div>`;
        return;
    }

    filtered.forEach(livre => {
        const card = document.createElement('div');
        card.className = "flex flex-col justify-between p-4 space-y-3";
        card.innerHTML = `
            <img src="${livre.couverture}" alt="${livre.titre}" class="w-full book-img cursor-pointer btn-detail shadow-sm">
            <div class="flex-grow">
                <h3 class="font-bold text-white text-base cursor-pointer btn-detail leading-snug">${livre.titre}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Par: ${livre.auteur}</p>
                <span class="inline-block bg-violet-900/50 border border-violet-800 text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 uppercase tracking-wider">${livre.genre}</span>
            </div>
            <button class="w-full py-2 rounded-lg text-xs font-semibold transition btn-toggle-lire cursor-pointer border ${
                livre.aLire ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 hover:bg-rose-500/30' : 'bg-violet-600/20 border-violet-500/30 text-violet-400 hover:bg-violet-600/40 hover:text-violet-200'
            }">${livre.aLire ? 'Retirer de À lire' : 'Ajouter à À lire'}</button>
        `;
        card.querySelector('.btn-toggle-lire').addEventListener('click', () => toggleALire(livre.id, livre.aLire));
        card.querySelectorAll('.btn-detail').forEach(el => el.addEventListener('click', () => showDetails(livre)));
        booksGrid.appendChild(card);
    });
}

function renderALireSection() {
    aLireGrid.innerHTML = '';
    const toRead = allBooks.filter(l => l.aLire);
    if (toRead.length === 0) {
        aLireGrid.innerHTML = `<div class="col-span-full bg-slate-800/50 p-8 rounded-xl shadow-sm text-center text-sm text-slate-400 border border-slate-700">Votre liste « À lire » est vide pour le moment. Ajoutez un livre dans l'accueil.</div>`;
        return;
    }
    toRead.forEach(livre => {
        const card = document.createElement('div');
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
        card.querySelector('.btn-retirer').addEventListener('click', () => toggleALire(livre.id, livre.aLire));
        aLireGrid.appendChild(card);
    });
}

function renderAdminTable() {
    adminTableBody.innerHTML = '';
    allBooks.forEach(livre => {
        const tr = document.createElement('tr');
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
        tr.querySelector('.btn-edit').addEventListener('click', () => setupEditForm(livre));
        tr.querySelector('.btn-delete').addEventListener('click', () => { if(confirm('Voulez-vous vraiment supprimer ce livre ?')) deleteLivre(livre.id); });
        adminTableBody.appendChild(tr);
    });
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

// لإعدادات الفورم والتنقل
function switchTab(activeTab) {
    Object.keys(sections).forEach(k => {
        sections[k].classList.toggle('hidden', k !== activeTab);
        navLinks[k].classList.toggle('active', k === activeTab);
    });
}

const bookForm = document.getElementById('bookForm');
const formTitle = document.getElementById('formTitle');
const formCancelBtn = document.getElementById('formCancelBtn');
const bookIdField = document.getElementById('bookId');

function getBookFormData() {
    return {
        titre: document.getElementById('formTitre').value.trim(),
        auteur: document.getElementById('formAuteur').value.trim(),
        genre: document.getElementById('formGenre').value,
        description: document.getElementById('formDescription').value.trim(),
        couverture: document.getElementById('formCouverture').value.trim(),
        aLire: false
    };
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

bookForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const livreData = getBookFormData();
    const editingId = bookIdField.value;
    if (editingId) {
        livreData.aLire = editingBookALire;
    }

    try {
        if (editingId) {
            await updateLivre(editingId, livreData);
        } else {
            await addLivre(livreData);
        }
        clearForm();
    } catch (error) {
        console.error('Erreur de sauvegarde du livre:', error);
        alert('Impossible de sauvegarder le livre. Merci de réessayer.');
    }
});

formCancelBtn.addEventListener('click', clearForm);

Object.keys(navLinks).forEach(k => navLinks[k].addEventListener('click', () => switchTab(k)));
globalSearch.addEventListener('input', (e) => { searchQuery = e.target.value; renderAccueil(); });
document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('detailsModal').classList.add('hidden'));
document.getElementById('detailsModal').addEventListener('click', (event) => {
    if (event.target.id === 'detailsModal') {
        document.getElementById('detailsModal').classList.add('hidden');
    }
});

// تشغيل عند أول فتح
fetchBooks();