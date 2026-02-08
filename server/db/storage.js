const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const getFilePath = (collection) => path.join(dbDir, `${collection}.json`);

const initCollection = (collection, defaultData = []) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

const readCollection = (collection) => {
  initCollection(collection);
  const filePath = getFilePath(collection);
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeCollection = (collection, data) => {
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const findById = (collection, id) => {
  const data = readCollection(collection);
  return data.find(item => item.id === id);
};

const findAll = (collection) => {
  return readCollection(collection);
};

const findIndex = (collection, id) => {
  const data = readCollection(collection);
  return data.findIndex(item => item.id === id);
};

const update = (collection, id, updates) => {
  const data = readCollection(collection);
  const index = findIndex(collection, id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updates };
    writeCollection(collection, data);
    return data[index];
  }
  return null;
};

const add = (collection, item) => {
  const data = readCollection(collection);
  data.push(item);
  writeCollection(collection, data);
  return item;
};

const remove = (collection, id) => {
  const data = readCollection(collection);
  const index = findIndex(collection, id);
  if (index !== -1) {
    const removed = data.splice(index, 1);
    writeCollection(collection, data);
    return removed[0];
  }
  return null;
};

module.exports = {
  initCollection,
  readCollection,
  writeCollection,
  findById,
  findAll,
  findIndex,
  update,
  add,
  remove
};
