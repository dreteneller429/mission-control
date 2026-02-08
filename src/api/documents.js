/**
 * Documents API Endpoints
 * GET /api/documents - Get all documents
 * GET /api/documents/:id - Get single document
 * POST /api/documents - Create document
 * DELETE /api/documents/:id - Delete document
 */

// Sample documents data
let DOCUMENTS_DATA = [
  {
    id: 'doc-001',
    title: 'Execution Plan',
    category: 'planning',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content: `# Execution Plan

## Phase 1: Foundation
- Setup project structure
- Configure build tools
- Create design system

## Phase 2: Navigation & Dashboard
- Build sidebar navigation
- Create main dashboard
- Implement live activity feed

## Phase 3: Remaining Pages
- Journal with date picker
- Weekly recaps
- Client management
- Documents upgrade
- DocuDigest (optional)

## Timeline
- Week 1-2: Foundation
- Week 3: Navigation & Dashboard
- Week 4-5: Remaining pages`,
    url: '/docs/EXECUTION_PLAN.md'
  },
  {
    id: 'doc-002',
    title: 'Design System',
    category: 'development',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    content: `# iOS Liquid Glass Design System

## Colors
- Primary: #007AFF (Blue)
- Secondary: #30D158 (Green)
- Accent: #FF9F0A (Orange)
- Dark: #0a0e1a

## Components
- Glass Cards with backdrop filter
- Smooth transitions and animations
- iOS-style glass morphism
- Curved containers and pills

## Typography
- San Francisco Display for headings
- SF Pro for body text
- Monaco for code

## Spacing
- 8px base unit
- Consistent padding and gaps`,
    url: '/docs/DESIGN_SYSTEM.md'
  },
  {
    id: 'doc-003',
    title: 'Quick Start Guide',
    category: 'research',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# Quick Start Guide

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Project Structure
- /src/pages - Page components
- /src/styles - Design system CSS
- /src/js - Logic files
- /src/api - API endpoints

## Building Pages
1. Create HTML component in /src/pages
2. Add JavaScript logic file in /src/js
3. Create API endpoints in /src/api
4. Add navigation link in Navigation.html

## Styling
- Use CSS variables from theme.css
- Follow glass design patterns
- Maintain consistent spacing`,
    url: '/docs/QUICK_START.md'
  },
  {
    id: 'doc-004',
    title: 'SureClose Partnership',
    category: 'client',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# SureClose Partnership Overview

## Client: SureClose
- Focus: Real estate closing solutions
- Status: Active partnerships
- Key Contacts: Mario, HWC Team

## Current Clients
- Mario: $2,250/mo - Active
- Home Warranty Company: Awaiting signatures
- Tanner's Network: Prospect stage

## Services
- Dashboard development
- Custom workflow integration
- Real estate automation

## Next Steps
- Complete HWC contract signatures
- Follow up with Tanner's network
- Plan quarterly review with Mario`,
    url: '/docs/SURECLOSE.md'
  },
  {
    id: 'doc-005',
    title: 'Peachstone Real Estate Development',
    category: 'real-estate',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# Peachstone Real Estate Projects

## Project Portfolio
- 8-Unit Deal: $3,500/mo - In progress
- 7-Unit Deal: $2,800/mo - In progress
- 159-Unit Fort Valley: Special opportunity

## Current Status
- 8-Unit: Unit inspections scheduled
- 7-Unit: Financing application under review
- Fort Valley: Proposal pending board approval

## Key Metrics
- Total MRR: $6,300
- Projects in pipeline: 3
- Investment target: $12M+

## Timeline
- 8-Unit: Completion in 6 months
- 7-Unit: Completion in 8 months
- Fort Valley: Decision by Q2 2026`,
    url: '/docs/PEACHSTONE.md'
  },
  {
    id: 'doc-006',
    title: 'Sub-agent Configuration',
    category: 'sub-agent',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# Sub-agent Configuration Guide

## Overview
Sub-agents are specialized instances for focused work.

## Configuration
- Agent type: Specialized task handler
- Memory: Isolated context
- Duration: Task-specific
- Reports: Automatic completion summary

## Common Tasks
- Phase completions
- Page building
- Data processing
- Report generation

## Best Practices
- Define clear scope
- Set explicit deliverables
- Enable automatic reporting
- Cleanup after completion`,
    url: '/docs/SUBAGENT_CONFIG.md'
  },
  {
    id: 'doc-007',
    title: 'Intelligence Report Template',
    category: 'intelligence',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    content: `# Intelligence Report Template

## Market Analysis
- Trends identification
- Competitor analysis
- Opportunity assessment

## Data Points
- Market size
- Growth rate
- Key players
- Emerging patterns

## Recommendations
- Strategic positioning
- Resource allocation
- Timeline optimization

## Risk Assessment
- Market risks
- Competitive threats
- Operational challenges`,
    url: '/docs/INTELLIGENCE_TEMPLATE.md'
  }
];

/**
 * Get all documents
 */
function getAllDocuments(req, res) {
  try {
    res.json(DOCUMENTS_DATA);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get single document by ID
 */
function getDocumentById(req, res) {
  try {
    const { id } = req.params;
    const doc = DOCUMENTS_DATA.find(d => d.id === id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(doc);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create new document
 */
function createDocument(req, res) {
  try {
    const { title, category, content, url } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const newDoc = {
      id: `doc-${Date.now()}`,
      title,
      category,
      date: new Date().toISOString(),
      content: content || '',
      url: url || ''
    };

    DOCUMENTS_DATA.push(newDoc);
    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update document
 */
function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const docIndex = DOCUMENTS_DATA.findIndex(d => d.id === id);

    if (docIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { title, category, content, url } = req.body;
    const doc = DOCUMENTS_DATA[docIndex];

    // Update fields
    if (title) doc.title = title;
    if (category) doc.category = category;
    if (content) doc.content = content;
    if (url) doc.url = url;

    res.json(doc);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete document
 */
function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const docIndex = DOCUMENTS_DATA.findIndex(d => d.id === id);

    if (docIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    DOCUMENTS_DATA.splice(docIndex, 1);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  routes: [
    { method: 'GET', path: '/api/documents', handler: getAllDocuments },
    { method: 'GET', path: '/api/documents/:id', handler: getDocumentById },
    { method: 'POST', path: '/api/documents', handler: createDocument },
    { method: 'PUT', path: '/api/documents/:id', handler: updateDocument },
    { method: 'DELETE', path: '/api/documents/:id', handler: deleteDocument }
  ]
};
