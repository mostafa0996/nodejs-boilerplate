const User = require('../schema');

const create = async (payload) => User.create(payload);

const find = async (selector = {}, options = {}) => {
  const { sort, skip, limit, select } = options;
  return User.find(selector).select(select).sort(sort).skip(skip).limit(limit);
};

const findById = async (id, options = {}) => {
  const { select } = options;
  return User.findById(id).select(select);
};

const findOne = async (selector, options = {}) => {
  const { select } = options;
  return User.findOne(selector).select(select);
};

const updateById = async (id, updatePaylod) => {
  return User.findByIdAndUpdate(id, updatePaylod, {
    new: true,
    runValidators: true,
    context: 'query',
  });
};

const updateOne = async (selector, updatePaylod) => {
  return User.findOneAndUpdate(selector, updatePaylod, {
    new: true,
    runValidators: true,
  });
};

const update = async (selector, updatePaylod) => {
  return User.updateMany(selector, updatePaylod, {
    new: true,
    runValidators: true,
    multi: true,
  });
};

const deleteById = async (id) => User.findByIdAndDelete(id);

const deleteOne = async (selector) => User.deleteOne(selector);

const deleteMany = async (selector) => User.deleteMany(selector);

const count = async (selector = {}) => {
  return User.countDocuments(selector);
};

module.exports = {
  create,
  find,
  findById,
  findOne,
  updateById,
  updateOne,
  update,
  deleteById,
  deleteOne,
  deleteMany,
  count,
};
