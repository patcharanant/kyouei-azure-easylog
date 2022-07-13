var express = require('express');
var router = express.Router();
var fs = require('fs');
var moment = require('moment-timezone');

moment().tz("Asia/Bangkok").format();
console.log('init index router')
router.post('/easylog_1', function(req, res, next) {
  try {
    console.log('request body is ===============================')
    console.log(req.body)
    let jsonData = JSON.stringify(req.body)
    let dateNow = moment().format('MM-DD-YYYY(HH:mm:ss)')
    console.log(dateNow)
    fs.writeFile(`temp/${dateNow}.json`, jsonData, function(error) {
      if (error) {
          console.log('write file error')
          console.log(error);
      } 
    });
    console.log('waiting to delete')
    // setTimeout( function(){
    //     fs.unlink(`temp/${dateNow}.json`, (err) => {
    //       if (err) {
    //         console.error(err)
    //         return
    //       }
    //     })
    //   console.log('deleted')
    // }, 5000)
    
    res.status(200).send('OK');
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
