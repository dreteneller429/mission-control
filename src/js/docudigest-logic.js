// DocuDigest Logic
class DocuDigestManager {
  constructor() {
    this.processedDocuments = [];
    this.processingItems = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadProcessedDocuments();
  }

  setupEventListeners() {
    const dropzone = document.getElementById('uploadDropzone');
    const fileInput = document.getElementById('fileInput');

    // Click to upload
    dropzone?.addEventListener('click', () => fileInput?.click());

    // Drag and drop
    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });

    // File input change
    fileInput?.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Type filter
    document.getElementById('typeFilter')?.addEventListener('change', (e) => {
      this.filterByType(e.target.value);
    });
  }

  handleFiles(files) {
    const fileArray = Array.from(files).filter(f => f.type === 'application/pdf');

    if (fileArray.length === 0) {
      alert('Please upload PDF files only');
      return;
    }

    this.processingItems = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading'
    }));

    this.showProcessingSection();
    this.renderProcessingList();
    this.uploadFiles(fileArray);
  }

  uploadFiles(files) {
    files.forEach((file, index) => {
      setTimeout(() => {
        this.simulateFileProcessing(index, file);
      }, index * 1000);
    });
  }

  simulateFileProcessing(index, file) {
    // Simulate processing steps
    const steps = [
      { progress: 30, status: 'uploading' },
      { progress: 60, status: 'processing' },
      { progress: 90, status: 'extracting' },
      { progress: 100, status: 'complete' }
    ];

    steps.forEach((step, stepIndex) => {
      setTimeout(() => {
        this.processingItems[index] = {
          ...this.processingItems[index],
          ...step
        };
        this.renderProcessingList();

        if (step.status === 'complete') {
          this.completeFileProcessing(file);
        }
      }, (stepIndex + 1) * 1000);
    });
  }

  completeFileProcessing(file) {
    const processedDoc = {
      id: Date.now() + Math.random(),
      filename: file.name,
      date: new Date().toISOString(),
      pages: Math.floor(Math.random() * 30) + 1,
      size: (file.size / 1024).toFixed(2) + ' KB',
      keywords: this.generateKeywords(),
      content: this.generateExtractedContent(file.name)
    };

    this.processedDocuments.unshift(processedDoc);
    this.renderProcessedTable();

    // Remove from processing list
    this.processingItems = this.processingItems.filter(p => p.name !== file.name);
    this.renderProcessingList();

    if (this.processingItems.length === 0) {
      setTimeout(() => {
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('processedSection').style.display = 'block';
      }, 1000);
    }
  }

  showProcessingSection() {
    document.getElementById('processingSection').style.display = 'block';
    document.getElementById('processedSection').style.display = 'none';
  }

  renderProcessingList() {
    const list = document.getElementById('processingList');
    list.innerHTML = this.processingItems.map(item => `
      <div class="processing-item">
        <div style="flex: 1;">
          <div class="processing-name">${this.escapeHtml(item.name)}</div>
          <div class="processing-bar">
            <div class="processing-progress" style="width: ${item.progress}%"></div>
          </div>
          <div class="processing-status">${item.status} - ${item.progress}%</div>
        </div>
      </div>
    `).join('');
  }

  async loadProcessedDocuments() {
    try {
      const response = await fetch('/api/docudigest/processed');
      if (response.ok) {
        this.processedDocuments = await response.json();
        if (this.processedDocuments.length > 0) {
          document.getElementById('processedSection').style.display = 'block';
          this.renderProcessedTable();
        }
      }
    } catch (error) {
      console.error('Error loading processed documents:', error);
    }
  }

  renderProcessedTable() {
    const tbody = document.getElementById('processedTableBody');

    if (this.processedDocuments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No processed documents yet</td></tr>';
      return;
    }

    tbody.innerHTML = this.processedDocuments.map(doc => `
      <tr>
        <td>
          <span class="doc-filename" data-id="${doc.id}">${this.escapeHtml(doc.filename)}</span>
        </td>
        <td>${this.formatDate(doc.date)}</td>
        <td class="doc-pages">${doc.pages}</td>
        <td class="doc-size">${doc.size}</td>
        <td class="doc-keywords">
          ${doc.keywords.slice(0, 3).map(k => `<span class="keyword-tag">${this.escapeHtml(k)}</span>`).join('')}
          ${doc.keywords.length > 3 ? `<span class="keyword-tag">+${doc.keywords.length - 3}</span>` : ''}
        </td>
        <td>
          <button class="action-btn" onclick="window.docudigestManager.showExtractedContent('${doc.id}')">View</button>
        </td>
      </tr>
    `).join('');

    // Attach click handlers for filename
    tbody.querySelectorAll('.doc-filename').forEach(el => {
      el.addEventListener('click', () => {
        const docId = el.dataset.id;
        this.showExtractedContent(docId);
      });
    });
  }

  showExtractedContent(docId) {
    const doc = this.processedDocuments.find(d => d.id == docId);
    if (!doc) return;

    const modal = document.getElementById('contentModal');
    document.getElementById('contentTitle').textContent = doc.filename;
    document.getElementById('extractedContent').innerHTML = doc.content;

    modal.classList.add('open');

    document.getElementById('closeContentModal')?.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'contentModal') {
        modal.classList.remove('open');
      }
    });
  }

  filterByType(type) {
    // Placeholder for filtering by document type
    console.log('Filter by type:', type);
  }

  generateKeywords() {
    const keywords = [
      'contract', 'agreement', 'terms', 'conditions', 'payment',
      'signature', 'date', 'client', 'amount', 'renewal',
      'obligation', 'liability', 'confidential', 'effective', 'clause'
    ];

    const shuffled = keywords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 4) + 2);
  }

  generateExtractedContent(filename) {
    return `
      <h3>Document Summary</h3>
      <p>This document has been successfully processed and analyzed.</p>
      
      <h3>Key Information Extracted</h3>
      <ul>
        <li><strong>Document Type:</strong> Contract</li>
        <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        <li><strong>Parties Involved:</strong> Multiple parties identified</li>
        <li><strong>Key Terms:</strong> Payment terms, obligations, and conditions extracted</li>
      </ul>

      <h3>Detected Keywords</h3>
      <p>${this.generateKeywords().join(', ')}</p>

      <h3>Extracted Text (Preview)</h3>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. The document has been processed with AI-powered extraction to identify key information, agreements, and actionable items. All metadata has been cataloged for easy reference and retrieval.</p>

      <h3>Recommendations</h3>
      <ul>
        <li>Review extracted information for accuracy</li>
        <li>Tag document with relevant categories</li>
        <li>Associate with appropriate client records</li>
        <li>Set reminders for important dates or renewal terms</li>
      </ul>
    `;
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
    window.docudigestManager = new DocuDigestManager();
  });
} else {
  window.docudigestManager = new DocuDigestManager();
}
