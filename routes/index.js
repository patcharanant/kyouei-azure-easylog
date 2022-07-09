var express = require('express');
var router = express.Router();

console.log('init index router')
router.post('/easylog_1', function(req, res, next) {
  console.log('in')
  try {
    console.log('request body is ===============================')
    console.log(req.body);
    res.status(200).send('wut');
  } catch (err) {
    console.log(err)
    res.status(500).send('error');
  }
  
});

router.post('/', function(req, res, next) {
  console.log(req.body)
  res.status(400).send('OK');
});

module.exports = router;
