const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

const helpers = {};

fs.readdirSync(path.join(__dirname))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js') && file !== basename;
    })
    .forEach(file => {
        helpers[file.replace('.js', '')] = require(path.join(__dirname, file));
    });

module.exports = helpers;
