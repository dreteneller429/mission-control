// Clients Page Logic
class ClientsManager {
  constructor() {
    this.clients = [];
    this.filteredClients = [];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadClients();
  }

  setupEventListeners() {
    // Search
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.filterClients(e.target.value);
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.applyFilters();
      });
    });

    // Modal
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.getElementById('clientModal').classList.remove('open');
    });

    document.getElementById('clientModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'clientModal') {
        document.getElementById('clientModal').classList.remove('open');
      }
    });
  }

  async loadClients() {
    const grid = document.getElementById('clientsGrid');

    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        this.clients = await response.json();
        this.filteredClients = this.clients;
        if (this.clients.length === 0) {
          grid.innerHTML = '<div class="empty-state"><div class="empty-icon">💼</div><p>No clients added yet</p><p class="empty-hint">Start by adding your first client</p></div>';
        } else {
          this.renderClients();
        }
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">💼</div><p>No clients added yet</p><p class="empty-hint">Add your first client to get started</p></div>';
    }
  }

  filterClients(searchTerm) {
    const term = searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.company.toLowerCase().includes(term)
    );
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.filteredClients];

    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(c => c.status === this.currentFilter);
    }

    this.renderClients(filtered);
  }

  renderClients(clients = this.filteredClients) {
    const grid = document.getElementById('clientsGrid');

    if (clients.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No clients found</p></div>';
      return;
    }

    grid.innerHTML = clients.map(client => this.buildClientCard(client)).join('');
    
    // Attach click handlers
    grid.querySelectorAll('.client-card').forEach((card, index) => {
      card.addEventListener('click', () => this.showClientDetails(clients[index]));
    });
  }

  buildClientCard(client) {
    const mrrDisplay = client.mrr ? `$${client.mrr.toLocaleString()}/mo` : 'N/A';
    
    return `
      <div class="client-card">
        <div class="client-card-header">
          <div class="client-info">
            <p class="client-name">${this.escapeHtml(client.name)}</p>
            <p class="client-company">${this.escapeHtml(client.company)}</p>
          </div>
          <span class="client-status ${client.status}">${this.capitalizeStatus(client.status)}</span>
        </div>
        
        <div class="client-card-body">
          <div class="client-stat">
            <span class="stat-label">MRR</span>
            <span class="stat-value mrr-value">${mrrDisplay}</span>
          </div>
          <div class="client-stat">
            <span class="stat-label">Last Activity</span>
            <span class="stat-value">${this.formatDate(client.lastActivity)}</span>
          </div>
          <div class="client-stat">
            <span class="stat-label">Next Action</span>
            <span class="stat-value" style="font-size: 0.85rem;">${this.escapeHtml(client.nextAction || 'Pending')}</span>
          </div>
        </div>
        
        <div class="client-card-footer">
          <button class="btn-expand">View Details →</button>
        </div>
      </div>
    `;
  }

  showClientDetails(client) {
    const modal = document.getElementById('clientModal');
    const details = document.getElementById('clientDetails');

    const interactionHistory = client.interactions && client.interactions.length > 0
      ? client.interactions.map(int => `
          <div class="detail-row">
            <span class="detail-label">${this.formatDate(int.date)}</span>
            <span class="detail-value">${this.escapeHtml(int.type)}</span>
          </div>
        `).join('')
      : '<p style="color: var(--text-secondary);">No interactions recorded</p>';

    const documents = client.documents && client.documents.length > 0
      ? client.documents.map(doc => `<li style="color: var(--text-secondary);">📄 ${this.escapeHtml(doc)}</li>`).join('')
      : '<li style="color: var(--text-secondary);">No documents</li>';

    details.innerHTML = `
      <div class="client-detail-header">
        <h2 class="client-detail-name">${this.escapeHtml(client.name)}</h2>
        <p class="client-detail-company">${this.escapeHtml(client.company)}</p>
      </div>

      <div class="client-detail-section">
        <h3 class="section-title">Overview</h3>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value">${this.capitalizeStatus(client.status)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">MRR</span>
          <span class="detail-value">${client.mrr ? '$' + client.mrr.toLocaleString() : 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Contact Email</span>
          <span class="detail-value">${this.escapeHtml(client.email || 'N/A')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Last Activity</span>
          <span class="detail-value">${this.formatDate(client.lastActivity)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Next Action</span>
          <span class="detail-value">${this.escapeHtml(client.nextAction || 'Pending')}</span>
        </div>
      </div>

      ${client.description ? `
        <div class="client-detail-section">
          <h3 class="section-title">Notes</h3>
          <p style="color: var(--text-secondary);">${this.escapeHtml(client.description)}</p>
        </div>
      ` : ''}

      <div class="client-detail-section">
        <h3 class="section-title">Interaction History</h3>
        ${interactionHistory}
      </div>

      <div class="client-detail-section">
        <h3 class="section-title">Documents</h3>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${documents}
        </ul>
      </div>
    `;

    modal.classList.add('open');
  }

  capitalizeStatus(status) {
    const map = {
      'active': 'Active',
      'prospect': 'Prospect',
      'closed': 'Closed',
      'awaiting': 'Awaiting Signatures'
    };
    return map[status] || status;
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
    window.clientsManager = new ClientsManager();
  });
} else {
  window.clientsManager = new ClientsManager();
}
