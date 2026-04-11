'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { Admin, sequelize } = require('../src/models');

(async () => {
  try {
    const admin = await Admin.findOne({ where: { email: 'jainamps18@gmail.com' } });

    if (!admin) {
      console.error('Admin not found. Existing admins:');
      const all = await Admin.findAll({ attributes: ['id', 'email', 'name'] });
      all.forEach(a => console.log(' -', a.email, '|', a.name));
      process.exit(1);
    }

    console.log('Found admin:', admin.email);

    admin.password = 'jainam30';
    admin.email = 'jainamps18@gmail.com';
    await admin.save();

    console.log('Done!');
    console.log('Updated email:', admin.email);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
