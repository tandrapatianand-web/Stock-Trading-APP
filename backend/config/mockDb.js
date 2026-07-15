const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Load database from file or initialize
const loadDb = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { users: [], stocks: [], portfolios: [], transactions: [], watchlists: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load JSON DB, resetting...', err.message);
    const initial = { users: [], stocks: [], portfolios: [], transactions: [], watchlists: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
};

// Save database to file
const saveDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// Generate ObjectId helper
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Match items by query object
const matches = (item, query) => {
  if (!query) return true;
  for (let key in query) {
    if (key === '$or') {
      const orArray = query[key];
      const match = orArray.some(subQuery => matches(item, subQuery));
      if (!match) return false;
    } else if (key === 'user' || key === 'stock') {
      const itemVal = item[key] ? item[key].toString() : '';
      const queryVal = query[key] ? query[key].toString() : '';
      if (itemVal !== queryVal) return false;
    } else if (query[key] instanceof RegExp || (query[key] && query[key].$regex)) {
      const pattern = query[key].$regex || query[key];
      const flags = query[key].$options || 'i';
      const re = new RegExp(pattern, flags);
      if (!re.test(item[key])) return false;
    } else {
      if (item[key] !== query[key]) return false;
    }
  }
  return true;
};

// Populate helper
const populateField = (item, field, db) => {
  if (field === 'holdings.stock' && item.holdings) {
    item.holdings = item.holdings.map(h => {
      if (!h.stock) return h;
      const idToFind = typeof h.stock === 'object' ? h.stock._id : h.stock;
      if (!idToFind) return h;
      const stockObj = db.stocks.find(s => s._id.toString() === idToFind.toString());
      return { ...h, stock: stockObj };
    });
  } else if (field === 'stocks' && item.stocks) {
    item.stocks = item.stocks.map(s => {
      if (!s) return s;
      const idToFind = typeof s === 'object' ? s._id : s;
      const stockObj = db.stocks.find(sObj => sObj._id.toString() === idToFind.toString());
      return stockObj;
    }).filter(Boolean);
  } else if (field === 'user' && item.user) {
    const idToFind = typeof item.user === 'object' ? item.user._id : item.user;
    const userObj = db.users.find(u => u._id.toString() === idToFind.toString());
    if (userObj) {
      const { password, ...safeUser } = userObj;
      item.user = safeUser;
    }
  }
  return item;
};

// Mongoose Query Chain class mock
class MockQuery {
  constructor(data, populateFields = [], db) {
    this.data = data;
    this.populateFields = populateFields;
    this.db = db;
  }

  sort(sortObj) {
    if (!sortObj) return this;
    const key = Object.keys(sortObj)[0];
    const order = sortObj[key];
    this.data.sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      if (typeof valA === 'string') {
        return order === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 1 ? valA - valB : valB - valA;
    });
    return this;
  }

  skip(skipVal) {
    this.data = this.data.slice(skipVal);
    return this;
  }

  limit(limitVal) {
    this.data = this.data.slice(0, limitVal);
    return this;
  }

  populate(pathSpec) {
    const path = typeof pathSpec === 'string' ? pathSpec : pathSpec.path;
    this.populateFields.push(path);
    return this;
  }

  // To make it awaitable like Mongoose
  async then(resolve, reject) {
    let populatedData = JSON.parse(JSON.stringify(this.data));
    if (Array.isArray(populatedData)) {
      populatedData = populatedData.map(item => {
        this.populateFields.forEach(f => populateField(item, f, this.db));
        return item;
      });
    } else if (populatedData) {
      this.populateFields.forEach(f => populateField(populatedData, f, this.db));
    }
    resolve(populatedData);
  }
}

// Single Document Mongoose Query chain mock
class MockQuerySingle {
  constructor(data, populateFields = [], db, collectionName) {
    this.data = data;
    this.populateFields = populateFields;
    this.db = db;
    this.collectionName = collectionName;
  }
  select(fieldsStr) {
    return this;
  }
  populate(pathSpec) {
    const path = typeof pathSpec === 'string' ? pathSpec : pathSpec.path;
    this.populateFields.push(path);
    return this;
  }
  async then(resolve, reject) {
    if (!this.data) {
      resolve(null);
      return;
    }
    const populated = JSON.parse(JSON.stringify(this.data));
    this.populateFields.forEach(f => populateField(populated, f, this.db));
    resolve(createInstance(this.collectionName, populated, this.db));
  }
}

// Instance save helper wrapper
const createInstance = (collectionName, item, db) => {
  return {
    ...item,
    save: async function () {
      const currentDb = loadDb();
      const index = currentDb[collectionName].findIndex(x => x._id === this._id);
      
      // Password hash pre-save check (for users)
      if (collectionName === 'users' && this.password && !this.password.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }

      const copy = { ...this };
      delete copy.save;
      delete copy.matchPassword;

      // Revert populated fields to string IDs before writing back to DB
      if (collectionName === 'portfolios' && copy.holdings) {
        copy.holdings = copy.holdings.map(h => {
          const rawHolding = { ...h };
          if (rawHolding.stock && typeof rawHolding.stock === 'object') {
            rawHolding.stock = rawHolding.stock._id;
          }
          return rawHolding;
        });
      }

      if (collectionName === 'watchlists' && copy.stocks) {
        copy.stocks = copy.stocks.map(s => {
          if (s && typeof s === 'object') {
            return s._id;
          }
          return s;
        });
      }

      if (collectionName === 'transactions' && copy.user) {
        if (copy.user && typeof copy.user === 'object') {
          copy.user = copy.user._id;
        }
      }

      if (index >= 0) {
        currentDb[collectionName][index] = copy;
      } else {
        currentDb[collectionName].push(copy);
      }
      saveDb(currentDb);
      return this;
    },
    matchPassword: async function (entered) {
      if (!this.password) return false;
      return await bcrypt.compare(entered, this.password);
    }
  };
};

// Generic Model Factory
const createMockModel = (collectionName) => {
  return {
    countDocuments: async (query) => {
      const db = loadDb();
      return db[collectionName].filter(item => matches(item, query)).length;
    },

    find: (query) => {
      const db = loadDb();
      const filtered = db[collectionName].filter(item => matches(item, query));
      return new MockQuery(filtered, [], db);
    },

    findOne: (query) => {
      const db = loadDb();
      const filtered = db[collectionName].find(item => matches(item, query));
      return new MockQuerySingle(filtered, [], db, collectionName);
    },

    findById: (id) => {
      const db = loadDb();
      const filtered = db[collectionName].find(item => item._id === id);
      return new MockQuerySingle(filtered, [], db, collectionName);
    },

    create: async (data) => {
      const db = loadDb();
      const newItem = {
        _id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Password hashing pre-save
      if (collectionName === 'users' && newItem.password) {
        const salt = await bcrypt.genSalt(10);
        newItem.password = await bcrypt.hash(newItem.password, salt);
      }

      db[collectionName].push(newItem);
      saveDb(db);
      return createInstance(collectionName, newItem, db);
    },

    insertMany: async (items) => {
      const db = loadDb();
      const inserted = items.map(item => ({
        _id: generateId(),
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      db[collectionName].push(...inserted);
      saveDb(db);
      return inserted.map(item => createInstance(collectionName, item, db));
    },

    findByIdAndUpdate: async (id, update) => {
      const db = loadDb();
      const idx = db[collectionName].findIndex(x => x._id === id);
      if (idx === -1) return null;
      
      const current = db[collectionName][idx];
      const updated = {
        ...current,
        ...update,
        updatedAt: new Date().toISOString()
      };
      
      db[collectionName][idx] = updated;
      saveDb(db);
      return createInstance(collectionName, updated, db);
    },

    distinct: async (field) => {
      const db = loadDb();
      const values = db[collectionName].map(item => item[field]);
      return [...new Set(values)];
    },

    deleteOne: async (query) => {
      const db = loadDb();
      const idx = db[collectionName].findIndex(item => matches(item, query));
      if (idx >= 0) {
        db[collectionName].splice(idx, 1);
        saveDb(db);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },

    deleteMany: async (query) => {
      const db = loadDb();
      const initialCount = db[collectionName].length;
      db[collectionName] = db[collectionName].filter(item => !matches(item, query));
      saveDb(db);
      return { deletedCount: initialCount - db[collectionName].length };
    },

    // Mock aggregate pipelines for analytics
    aggregate: async (pipeline) => {
      const db = loadDb();
      if (collectionName === 'transactions') {
        const groupStep = pipeline.find(s => s.$group);
        if (groupStep) {
          const idVal = groupStep.$group._id;
          if (idVal === null) {
            // Calculate total volume sum
            const sum = db.transactions.reduce((acc, t) => acc + (t.total || 0), 0);
            return [{ totalVolume: sum }];
          } else if (idVal === '$symbol') {
            // Aggregate by symbol
            const aggregates = {};
            db.transactions.forEach(t => {
              if (!aggregates[t.symbol]) {
                aggregates[t.symbol] = { count: 0, totalValue: 0 };
              }
              aggregates[t.symbol].count += 1;
              aggregates[t.symbol].totalValue += t.total;
            });
            const topList = Object.keys(aggregates).map(sym => ({
              symbol: sym,
              count: aggregates[sym].count,
              totalValue: aggregates[sym].totalValue
            }));
            // Perform sort and limits of subsequent pipeline steps
            const sortStep = pipeline.find(s => s.$sort);
            if (sortStep) {
              topList.sort((a, b) => b.count - a.count);
            }
            const limitStep = pipeline.find(s => s.$limit);
            return limitStep ? topList.slice(0, limitStep.$limit) : topList;
          }
        }
      }
      return [];
    }
  };
};

module.exports = {
  User: createMockModel('users'),
  Stock: createMockModel('stocks'),
  Portfolio: createMockModel('portfolios'),
  Transaction: createMockModel('transactions'),
  Watchlist: createMockModel('watchlists')
};
