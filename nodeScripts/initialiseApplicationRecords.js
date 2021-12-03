'use strict';

const config = require('./shared/config');
const { firebase, app, db } = require('./shared/admin.js');
const initialiseApplicationRecords = require('../functions/actions/applicationRecords')(config, firebase, db);

// untested

const main = async () => {
  return initialiseApplicationRecords({
    // qualifyingTestId: 'sKqACHtcOYBFfHcVQry8',
  });
};

main()
  .then((result) => {
    console.log(result);
    app.delete();
    return process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
