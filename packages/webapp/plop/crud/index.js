const moduleActions = require('./actions/module');
const componentsActions = require('./actions/components');

module.exports = (plop) => {
  plop.setGenerator('crud', {
    description: 'Generate a CRUD',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
      },
      {
        type: 'input',
        name: 'apiUrl',
        message: 'API URL:',
      },
    ],
    actions: [...moduleActions, ...componentsActions],
  });
};
