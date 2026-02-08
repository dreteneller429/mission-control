/**
 * Clients API Endpoints
 * GET /api/clients - Get all clients
 */

// Sample client data with initial clients as specified
const CLIENTS_DATA = [
  {
    id: 'client-mario',
    name: 'Mario',
    company: 'SureClose',
    status: 'active',
    mrr: 2250,
    email: 'mario@sureclose.com',
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextAction: 'Monthly check-in call',
    description: 'Key contact for SureClose operations',
    interactions: [
      { date: new Date().toISOString(), type: 'Email' },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'Call' },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), type: 'Meeting' }
    ],
    documents: ['Contract.pdf', 'Service Agreement.pdf', 'Monthly Report.pdf']
  },
  {
    id: 'client-hwc',
    name: 'Home Warranty Company',
    company: 'SureClose',
    status: 'awaiting',
    mrr: 0,
    email: 'info@hwc.com',
    lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextAction: 'Obtain signatures on contract',
    description: 'Awaiting final signatures for engagement',
    interactions: [
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'Email' }
    ],
    documents: ['Draft Contract.pdf']
  },
  {
    id: 'client-tanners',
    name: 'Tanner\'s Network Contacts',
    company: 'SureClose',
    status: 'prospect',
    mrr: 0,
    email: 'contact@tanners.com',
    lastActivity: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    nextAction: 'Initial discovery call',
    description: 'Referral from Tanner - warm prospect',
    interactions: [
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: 'Email' }
    ],
    documents: []
  },
  {
    id: 'client-8unit',
    name: '8-Unit Deal',
    company: 'Peachstone',
    status: 'active',
    mrr: 3500,
    email: 'deals@peachstone.com',
    lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextAction: 'Unit inspection scheduled',
    description: 'Multi-unit residential property development',
    interactions: [
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Call' },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'Meeting' }
    ],
    documents: ['Property Assessment.pdf', 'Financial Model.xlsx', 'Timeline.pdf']
  },
  {
    id: 'client-7unit',
    name: '7-Unit Deal',
    company: 'Peachstone',
    status: 'active',
    mrr: 2800,
    email: 'deals@peachstone.com',
    lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextAction: 'Financing application review',
    description: 'Mid-size apartment complex project',
    interactions: [
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'Email' },
      { date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), type: 'Meeting' }
    ],
    documents: ['Financing Documents.pdf', 'Architectural Plans.pdf']
  },
  {
    id: 'client-159unit',
    name: '159-Unit Fort Valley',
    company: 'Peachstone',
    status: 'prospect',
    mrr: 0,
    email: 'special@peachstone.com',
    lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextAction: 'Present proposal at board meeting',
    description: 'Special opportunity - large-scale development',
    interactions: [
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), type: 'Meeting' }
    ],
    documents: ['Opportunity Brief.pdf', 'Market Analysis.pdf']
  }
];

/**
 * Get all clients
 */
function getAllClients(req, res) {
  try {
    res.json(CLIENTS_DATA);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get single client by ID
 */
function getClientById(req, res) {
  try {
    const { id } = req.params;
    const client = CLIENTS_DATA.find(c => c.id === id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create new client
 */
function createClient(req, res) {
  try {
    const { name, company, status, mrr, email, nextAction, description } = req.body;

    if (!name || !company) {
      return res.status(400).json({ error: 'Name and company are required' });
    }

    const newClient = {
      id: `client-${Date.now()}`,
      name,
      company,
      status: status || 'prospect',
      mrr: mrr || 0,
      email: email || '',
      lastActivity: new Date().toISOString(),
      nextAction: nextAction || 'Pending',
      description: description || '',
      interactions: [],
      documents: []
    };

    CLIENTS_DATA.push(newClient);
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update client
 */
function updateClient(req, res) {
  try {
    const { id } = req.params;
    const clientIndex = CLIENTS_DATA.findIndex(c => c.id === id);

    if (clientIndex === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const { name, company, status, mrr, email, nextAction, description } = req.body;
    const client = CLIENTS_DATA[clientIndex];

    // Update fields
    if (name) client.name = name;
    if (company) client.company = company;
    if (status) client.status = status;
    if (mrr !== undefined) client.mrr = mrr;
    if (email) client.email = email;
    if (nextAction) client.nextAction = nextAction;
    if (description) client.description = description;

    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete client
 */
function deleteClient(req, res) {
  try {
    const { id } = req.params;
    const clientIndex = CLIENTS_DATA.findIndex(c => c.id === id);

    if (clientIndex === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }

    CLIENTS_DATA.splice(clientIndex, 1);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  routes: [
    { method: 'GET', path: '/api/clients', handler: getAllClients },
    { method: 'GET', path: '/api/clients/:id', handler: getClientById },
    { method: 'POST', path: '/api/clients', handler: createClient },
    { method: 'PUT', path: '/api/clients/:id', handler: updateClient },
    { method: 'DELETE', path: '/api/clients/:id', handler: deleteClient }
  ]
};
