const { roles } = require('../enum/roles');


module.exports = (role) => {
    return role == roles.ADMIN ? 'Admin' : role == roles.MODERATOR ? 'Moderator' : 'Customer';
}