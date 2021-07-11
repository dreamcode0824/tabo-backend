const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

const customQueries = {};

fs.readdirSync(path.join(__dirname))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js') && file !== basename;
    })
    .forEach(file => {
        customQueries[file.replace('.js', '')] = require(path.join(__dirname, file));
    });

module.exports = customQueries;
