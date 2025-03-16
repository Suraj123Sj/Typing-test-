const noteForm = document.getElementById('noteForm');
const noteInput = document.getElementById('noteInput');
const notesContainer = document.getElementById('notesContainer');
const installBtn = document.getElementById('installBtn');

// Load notes from localStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installBtn.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}

// Note functionality
function saveNote() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function displayNotes() {
    notesContainer.innerHTML = '';
    notes.forEach((note, index) => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-card';
        noteEl.innerHTML = `
            <p>${note}</p>
            <button class="delete-btn" onclick="deleteNote(${index})">×</button>
        `;
        notesContainer.appendChild(noteEl);
    });
}

function addNote(text) {
    notes.push(text);
    saveNote();
    displayNotes();
}

window.deleteNote = function(index) {
    notes.splice(index, 1);
    saveNote();
    displayNotes();
}

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const noteText = noteInput.value.trim();
    if (noteText) {
        addNote(noteText);
        noteInput.value = '';
    }
});

// Initial display
displayNotes();
