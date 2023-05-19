const XLSX = require('xlsx');
const _ = require('lodash');
const { User } = require('../../../common/init/db/init-db');
const ErrorResponse = require('../../../common/utils/errorResponse');
const getUserRoleString = require('../../../common/utils/getUserRolesString');

const _formatXlsxObject = async (users) => {
  const formattedUers = [];
  users.map((user) => {
    const fields = {};
    fields['User ID'] = JSON.stringify(user.id);
    fields['Name'] = user.fullName;
    fields['Email'] = user.email;
    fields['Country'] = user.country;
    fields['Phone'] = user.phoneNumber;
    fields['Status'] = user.verified ? 'Verified' : 'Not Verified';
    fields['Vip'] = user.vip ? 'Yes' : 'No';
    fields['Date'] = user.createdAt;
    fields['Role'] = getUserRoleString(user.role);
    formattedUers.push(fields);
  });

  return formattedUers;
};

const exportUsersService = async () => {
  try {
    const users = await User.findAll();
    const result = await _formatXlsxObject(users);
    const wb = { SheetNames: [], Sheets: {} };
    wb.SheetNames.push('Users');
    wb.Sheets.Users = XLSX.utils.json_to_sheet(result);
    return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  } catch (error) {
    logger.error(`[userService /exportUsersXLSX] ${error.message}`);
    throw new ErrorResponse(
      error.message,
      error.status || INTERNAL_SERVER_ERROR,
      JSON.stringify(error.stack)
    );
  }
};

module.exports = {
  exportUsersService,
};
