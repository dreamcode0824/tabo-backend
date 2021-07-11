const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

const customerMutations = {};

fs.readdirSync(path.join(__dirname))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js') && file !== basename;
    })
    .forEach(file => {
        customerMutations[file.replace('.js', '')] = require(path.join(__dirname, file));
    });

module.exports = customerMutations;
