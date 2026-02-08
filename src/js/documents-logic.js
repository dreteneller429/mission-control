// Documents Upgrade Logic
class DocumentsManager {
  constructor() {
    this.documents = [];
    this.filteredDocuments = [];
    this.selectedDocument = null;
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDocuments();
  }

  setupEventListeners() {
    // Search
    document.getElementById('docSearch')?.addEventListener('input', (e) => {
      this.currentSearch = e.target.value.toLowerCase();
      this.applyFilters();
    });

    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentCategory = e.target.dataset.category;
        this.applyFilters();
      });
    });
  }

  async loadDocuments() {
    const list = document.getElementById('documentsList');
    list.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading documents...</p></div>';

    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        this.documents = await response.json();
        this.filteredDocuments = this.documents;
        this.applyFilters();
      } else {
        throw new Error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error loading documents</p></div>';
    }
  }

  applyFilters() {
    let filtered = [...this.documents];

    // Category filter
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === this.currentCategory);
    }

    // Search filter
    if (this.currentSearch) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(this.currentSearch) ||
        (doc.content && doc.content.toLowerCase().includes(this.currentSearch))
      );
    }

    this.filteredDocuments = filtered;
    this.renderDocumentsList();
  }

  renderDocumentsList() {
    const list = document.getElementById('documentsList');

    if (this.filteredDocuments.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><p>No documents found</p></div>';
      return;
    }

    list.innerHTML = this.filteredDocuments.map((doc, index) => 
      this.buildDocumentItem(doc, index)
    ).join('');

    // Attach click handlers
    list.querySelectorAll('.document-item').forEach((item, index) => {
      item.addEventListener('click', () => this.selectDocument(this.filteredDocuments[index]));
    });
  }

  buildDocumentItem(doc, index) {
    const isActive = this.selectedDocument?.id === doc.id ? 'active' : '';
    const dateStr = this.formatDate(doc.date);

    return `
      <div class="document-item ${isActive}" data-index="${index}">
        <p class="doc-item-title">${this.escapeHtml(doc.title)}</p>
        <div class="doc-item-meta">
          <span class="doc-item-date">${dateStr}</span>
          <span class="doc-item-category category-${doc.category}">${doc.category}</span>
        </div>
      </div>
    `;
  }

  selectDocument(doc) {
    this.selectedDocument = doc;
    this.renderDocumentsList(); // Update active state
    this.renderPreview(doc);
  }

  renderPreview(doc) {
    const container = document.getElementById('previewContainer');
    const dateStr = this.formatDate(doc.date);

    const content = this.markdownToHtml(doc.content || '');

    container.innerHTML = `
      <div class="preview-header">
        <div class="preview-title-section">
          <h2 class="preview-title">${this.escapeHtml(doc.title)}</h2>
          <div class="preview-meta">
            <span>📅 ${dateStr}</span>
            <span class="doc-item-category category-${doc.category}">${doc.category}</span>
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn-icon" id="openDocBtn" title="Open document">🔗</button>
          <button class="btn-icon danger" id="deleteDocBtn" title="Delete document">🗑️</button>
        </div>
      </div>
      <div class="preview-content">
        ${content}
      </div>
    `;

    // Attach handlers
    document.getElementById('openDocBtn')?.addEventListener('click', () => this.openDocument(doc));
    document.getElementById('deleteDocBtn')?.addEventListener('click', () => this.deleteDocument(doc));
  }

  markdownToHtml(markdown) {
    if (!markdown) return '<p>No content</p>';

    let html = markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, (match) => `<ul>${match}</ul>`)
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }

    return html;
  }

  async openDocument(doc) {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      alert('Document URL not available');
    }
  }

  async deleteDocument(doc) {
    if (!confirm(`Delete "${doc.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });

      if (response.ok) {
        this.documents = this.documents.filter(d => d.id !== doc.id);
        this.selectedDocument = null;
        this.applyFilters();
        document.getElementById('previewContainer').innerHTML = 
          '<div class="preview-empty"><div class="empty-icon">📄</div><p>Select a document to view</p></div>';
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document');
    }
  }

  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const diff = today - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days}d ago`;
      if (days < 30) return `${Math.floor(days / 7)}w ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.documentsManager = new DocumentsManager();
  });
} else {
  window.documentsManager = new DocumentsManager();
}
