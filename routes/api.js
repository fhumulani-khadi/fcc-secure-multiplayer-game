'use strict';

module.exports = function (app) {
  
  app.route('/api/test')
    .get(function (req, res){
      res.json({ status: 'ok' });
    });
    
};
