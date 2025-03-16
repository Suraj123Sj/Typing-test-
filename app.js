const noteForm = document.getElementById('noteForm');
const noteInput = document.getElementById('noteInput');
const notesContainer = document.getElementById('notesContainer');
const installBtn = document.getElementById('installBtn');

// Load notes from localStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// ========== PWA Installation Logic ==========
let deferredPrompt;

// Check if PWA is already installed
const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
if (isInstalled) {
    installBtn.style.display = 'none';
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Only show install button if not in standalone mode
    if (!isInstalled) {
        installBtn.style.display = 'block';
    }
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted install');
            installBtn.style.display = 'none';
        }
    } catch (err) {
        console.error('Installation failed:', err);
    }
    
    deferredPrompt = null;
});

// Detect successful installation
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    installBtn.style.display = 'none';
    deferredPrompt = null;
});

// ========== Service Worker Registration ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered with scope:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update().then(() => {
                        console.log('Checking for service worker updates');
                    });
                }, 60 * 60 * 1000); // Check every hour
            })
            .catch(error => {
                console.error('SW registration failed:', error);
            });
    });
}

// ========== Note Functionality ==========
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
