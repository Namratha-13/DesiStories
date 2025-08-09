// API base URL
const API_BASE = '/api';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadLanguages();
    loadStories();
    loadProverbs();
});

// Tab switching functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Toggle share forms
function toggleShareType(type) {
    const storyForm = document.getElementById('story-form');
    const proverbForm = document.getElementById('proverb-form');
    const buttons = document.querySelectorAll('.share-type-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (type === 'story') {
        storyForm.style.display = 'flex';
        proverbForm.style.display = 'none';
    } else {
        storyForm.style.display = 'none';
        proverbForm.style.display = 'flex';
    }
}

// Load languages into dropdowns
async function loadLanguages() {
    try {
        const response = await fetch(`${API_BASE}/languages`);
        const languages = await response.json();
        
        const selects = [
            document.getElementById('story-language-filter'),
            document.getElementById('proverb-language-filter'),
            document.getElementById('story-language'),
            document.getElementById('proverb-language')
        ];
        
        selects.forEach(select => {
            // Clear existing options except first
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = lang;
                select.add(option);
            });
        });
    } catch (error) {
        console.error('Error loading languages:', error);
    }
}

// Load stories
async function loadStories() {
    const language = document.getElementById('story-language-filter').value;
    const category = document.getElementById('story-category-filter').value;
    
    let url = `${API_BASE}/stories`;
    const params = new URLSearchParams();
    
    if (language) params.append('language', language);
    if (category) params.append('category', category);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    const container = document.getElementById('stories-container');
    container.innerHTML = '<p>Loading stories...</p>';
    
    try {
        const response = await fetch(url);
        const stories = await response.json();
        
        container.innerHTML = '';
        if (stories.length === 0) {
            container.innerHTML = '<p>No stories found. Be the first to share one!</p>';
            return;
        }
        
        stories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${story.title}</h3>
                <p>${story.content.substring(0, 150)}${story.content.length > 150 ? '...' : ''}</p>
                <div class="card-meta">
                    <span>👤 ${story.author || 'Anonymous'}</span>
                    <span>📅 ${new Date(story.created_at).toLocaleDateString()}</span>
                    <span>🏷️ ${story.language}</span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<p>Error loading stories.</p>';
        console.error('Error:', error);
    }
}

// Load proverbs
async function loadProverbs() {
    const language = document.getElementById('proverb-language-filter').value;
    const region = document.getElementById('proverb-region-filter').value;
    
    let url = `${API_BASE}/proverbs`;
    const params = new URLSearchParams();
    
    if (language) params.append('language', language);
    if (region) params.append('region', region);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    const container = document.getElementById('proverbs-container');
    container.innerHTML = '<p>Loading proverbs...</p>';
    
    try {
        const response = await fetch(url);
        const proverbs = await response.json();
        
        container.innerHTML = '';
        if (proverbs.length === 0) {
            container.innerHTML = '<p>No proverbs found. Be the first to share one!</p>';
            return;
        }
        
        proverbs.forEach(proverb => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>"${proverb.proverb}"</h3>
                <p>${proverb.meaning || ''}</p>
                <div class="card-meta">
                    <span>🌍 ${proverb.language}</span>
                    <span>📍 ${proverb.region}</span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<p>Error loading proverbs.</p>';
        console.error('Error:', error);
    }
}

// Story form submission
document.getElementById('story-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('story-title').value,
        content: document.getElementById('story-content').value,
        author: document.getElementById('story-author').value || 'Anonymous',
        language: document.getElementById('story-language').value,
        category: document.getElementById('story-category').value,
        tags: document.getElementById('story-tags').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/stories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Story shared successfully!');
            document.getElementById('story-form').reset();
            loadStories();
        } else {
            alert('Error sharing story');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Proverb form submission
document.getElementById('proverb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        proverb: document.getElementById('proverb-text').value,
        meaning: document.getElementById('proverb-meaning').value,
        language: document.getElementById('proverb-language').value,
        region: document.getElementById('proverb-region').value,
        contributor: document.getElementById('proverb-contributor').value || 'Anonymous'
    };
    
    try {
        const response = await fetch(`${API_BASE}/proverbs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Proverb shared successfully!');
            document.getElementById('proverb-form').reset();
            loadProverbs();
        } else {
            alert('Error sharing proverb');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
