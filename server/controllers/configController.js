const Config = require('../models/Config');

exports.getConfig = async (req, res) => {
  try {
    const taxRate = await Config.findOne({ key: 'taxRate' }) || { value: 0.08 };
    const shippingRate = await Config.findOne({ key: 'shippingRate' }) || { value: 5.00 };
    res.json({ taxRate: taxRate.value, shippingRate: shippingRate.value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateConfig = async (req, res) => {
  const { taxRate, shippingRate } = req.body;
  try {
    if (taxRate !== undefined) {
      await Config.updateOne({ key: 'taxRate' }, { value: taxRate }, { upsert: true });
    }
    if (shippingRate !== undefined) {
      await Config.updateOne({ key: 'shippingRate' }, { value: shippingRate }, { upsert: true });
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};