const stringSimilarity = require('string-similarity');

module.exports = {
    name: 'userUpdate',
    async execute (oldUser, newUser) {
        console.log(oldUser, newUser);
    }
}