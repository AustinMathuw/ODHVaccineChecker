'use strict';

var child_process = require("child_process");
module.exports.checkAppointments = async event => {
  var res = child_process.execSync("cd bot & npx nightwatch .\\vaccine_check.js");
  console.log(res);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        botCheck: res.toString(),
        input: event
      },
      null,
      2
    ),
  };
};
