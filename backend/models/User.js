const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let UserModel;

// Check if we should use Mock Database Fallback
if (global.useMockDb) {
  UserModel = require('../config/mockDb').User;
} else {
  const userSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, 'Please add a name'],
      },
      email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
    },
    {
      timestamps: true,
    }
  );

  // Hash password pre-save
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  // Password matching method
  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  UserModel = mongoose.model('User', userSchema);
}

// Wrap export to dynamically resolve at call time in controllers
module.exports = {
  countDocuments: (q) => global.useMockDb ? require('../config/mockDb').User.countDocuments(q) : UserModel.countDocuments(q),
  find: (q) => global.useMockDb ? require('../config/mockDb').User.find(q) : UserModel.find(q),
  findOne: (q) => global.useMockDb ? require('../config/mockDb').User.findOne(q) : UserModel.findOne(q),
  findById: (id) => global.useMockDb ? require('../config/mockDb').User.findById(id) : UserModel.findById(id),
  create: (data) => global.useMockDb ? require('../config/mockDb').User.create(data) : UserModel.create(data),
  insertMany: (items) => global.useMockDb ? require('../config/mockDb').User.insertMany(items) : UserModel.insertMany(items),
  findByIdAndUpdate: (id, u) => global.useMockDb ? require('../config/mockDb').User.findByIdAndUpdate(id, u) : UserModel.findByIdAndUpdate(id, u),
  distinct: (f) => global.useMockDb ? require('../config/mockDb').User.distinct(f) : UserModel.distinct(f),
  deleteOne: (q) => global.useMockDb ? require('../config/mockDb').User.deleteOne(q) : UserModel.deleteOne(q),
  deleteMany: (q) => global.useMockDb ? require('../config/mockDb').User.deleteMany(q) : UserModel.deleteMany(q)
};
