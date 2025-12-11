class MovieClient {
    constructor() {
        this.baseUrl = 'http://localhost:5000';
        this.movies = [];
        this.selectedMovie = null;
        
        this.initializeElements();
        this.bindEvents();
        this.showStatus('Ready to connect to API at ' + this.baseUrl, 'info');
    }

    initializeElements() {
        this.elements = {
            gridMovies: document.getElementById('gridMovies'),
            moviesBody: document.getElementById('moviesBody'),
            txtId: document.getElementById('txtId'),
            txtTitle: document.getElementById('txtTitle'),
            txtActors: document.getElementById('txtActors'),
            txtBudget: document.getElementById('txtBudget'),
            txtDescription: document.getElementById('txtDescription'),
            btnGetAll: document.getElementById('btnGetAll'),
            btnGetByTitle: document.getElementById('btnGetByTitle'),
            btnPost: document.getElementById('btnPost'),
            btnPut: document.getElementById('btnPut'),
            btnDelete: document.getElementById('btnDelete'),
            btnClear: document.getElementById('btnClear'),
            statusMessage: document.getElementById('statusMessage')
        };
    }

    bindEvents() {
        this.elements.btnGetAll.addEventListener('click', () => this.getAllMovies());
        this.elements.btnGetByTitle.addEventListener('click', () => this.getByTitle());
        this.elements.btnPost.addEventListener('click', () => this.createMovie());
        this.elements.btnPut.addEventListener('click', () => this.updateMovie());
        this.elements.btnDelete.addEventListener('click', () => this.deleteMovie());
        this.elements.btnClear.addEventListener('click', () => this.clearForm());
        
        // Auto-select row when clicking on table row
        this.elements.moviesBody.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row && row.dataset.id) {
                this.selectMovie(row.dataset.id);
            }
        });
    }

    async getAllMovies() {
        try {
            const response = await fetch(`${this.baseUrl}/movie`);
            if (!response.ok) throw new Error('Failed to fetch movies');
            
            this.movies = await response.json();
            this.renderMovies();
            this.showStatus(`Loaded ${this.movies.length} movies`, 'success');
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
            console.error('GET ALL Error:', error);
        }
    }

    async getByTitle() {
        const title = this.elements.txtTitle.value.trim();
        if (!title) {
            this.showStatus('Please enter a title to search', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/movie/title/${encodeURIComponent(title)}`);
            if (!response.ok) throw new Error('Movie not found');
            
            this.movies = await response.json();
            this.renderMovies();
            this.showStatus(`Found ${this.movies.length} movie(s) with title "${title}"`, 'success');
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
            console.error('GET BY TITLE Error:', error);
        }
    }

    async createMovie() {
        const movieData = this.readForm(true);
        
        try {
            const response = await fetch(`${this.baseUrl}/movie`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieData)
            });

            if (!response.ok) throw new Error('Failed to create movie');

            this.showStatus('Movie created successfully!', 'success');
            this.getAllMovies();
            this.clearForm();
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
            console.error('POST Error:', error);
        }
    }

    async updateMovie() {
        const movieId = this.elements.txtId.value.trim();
        if (!this.isValidUUID(movieId)) {
            this.showStatus('Please select a movie to update', 'error');
            return;
        }

        const movieData = this.readForm(false);
        
        try {
            const response = await fetch(`${this.baseUrl}/movie`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieData)
            });

            if (!response.ok) throw new Error('Failed to update movie');

            this.showStatus('Movie updated successfully!', 'success');
            this.getAllMovies();
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
            console.error('PUT Error:', error);
        }
    }

    async deleteMovie() {
        const movieId = this.elements.txtId.value.trim();
        if (!this.isValidUUID(movieId)) {
            this.showStatus('Please select a movie to delete', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this movie?')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/movie/${movieId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete movie');

            this.showStatus('Movie deleted successfully!', 'success');
            this.getAllMovies();
            this.clearForm();
        } catch (error) {
            this.showStatus('Error: ' + error.message, 'error');
            console.error('DELETE Error:', error);
        }
    }

    readForm(create) {
        return {
            id: create ? this.generateUUID() : this.elements.txtId.value.trim(),
            title: this.elements.txtTitle.value.trim(),
            actors: this.elements.txtActors.value
                .split(',')
                .map(actor => actor.trim())
                .filter(actor => actor.length > 0),
            budget: this.elements.txtBudget.value ? 
                parseFloat(this.elements.txtBudget.value) : null,
            description: this.elements.txtDescription.value.trim()
        };
    }

    renderMovies() {
        this.elements.moviesBody.innerHTML = '';
        
        this.movies.forEach(movie => {
            const row = document.createElement('tr');
            row.dataset.id = movie.id;
            
            if (this.selectedMovie === movie.id) {
                row.style.backgroundColor = '#e8f4ff';
            }
            
            row.innerHTML = `
                <td>${movie.id}</td>
                <td>${this.escapeHtml(movie.title || '')}</td>
                <td>${this.escapeHtml((movie.actors || []).join(', '))}</td>
                <td>${movie.budget ? `$${movie.budget.toLocaleString()}` : 'N/A'}</td>
                <td>${this.escapeHtml(movie.description || '').substring(0, 50)}${(movie.description || '').length > 50 ? '...' : ''}</td>
            `;
            
            this.elements.moviesBody.appendChild(row);
        });
    }

    selectMovie(movieId) {
        const movie = this.movies.find(m => m.id === movieId);
        if (!movie) return;

        this.selectedMovie = movieId;
        
        this.elements.txtId.value = movie.id;
        this.elements.txtTitle.value = movie.title || '';
        this.elements.txtActors.value = (movie.actors || []).join(', ');
        this.elements.txtBudget.value = movie.budget || '';
        this.elements.txtDescription.value = movie.description || '';
        
        this.renderMovies();
        this.showStatus(`Selected movie: ${movie.title}`, 'info');
    }

    clearForm() {
        this.elements.txtId.value = '';
        this.elements.txtTitle.value = '';
        this.elements.txtActors.value = '';
        this.elements.txtBudget.value = '';
        this.elements.txtDescription.value = '';
        this.selectedMovie = null;
        
        this.renderMovies();
        this.showStatus('Form cleared', 'info');
    }

    showStatus(message, type = 'info') {
        const statusEl = this.elements.statusMessage;
        statusEl.textContent = message;
        statusEl.className = 'status-message ' + type;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusEl.className = 'status-message';
            }, 3000);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidUUID(uuid) {
        const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new MovieClient();
    window.movieApp = app; // Make available in console for debugging
});
