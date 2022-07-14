const express = require('express');
const router = express.Router();
const fs = require('fs');
const moment = require('moment-timezone');
const { BlobServiceClient , StorageSharedKeyCredential } = require('@azure/storage-blob');
const dev = process.env.DEV ?? false;
moment().tz("Asia/Bangkok").format();


/* 
  Getting the environment variables from the Azure Function App.
 */
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw Error("Azure Storage Connection string not found");
}
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER;

if (!AZURE_STORAGE_CONTAINER) {
  throw Error("Azure Storage Container string not found");
}
const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;

if (!AZURE_STORAGE_ACCOUNT) {
  throw Error("Azure Storage Account string not found");
}
const AZURE_STORAGE_KEY = process.env.AZURE_STORAGE_KEY;

if (!AZURE_STORAGE_KEY) {
  throw Error("Azure Storage Key string not found");
}


/* 
  Console Log for developer debugging purpose.
*/
if(dev){
  console.log("Azure Storage Connection string")
  console.log(AZURE_STORAGE_CONNECTION_STRING)
  console.log('=================================')
  console.log("Azure Storage Container string")
  console.log(AZURE_STORAGE_CONTAINER)
  console.log('=================================')
  console.log("Azure Storage Container string")
  console.log(AZURE_STORAGE_ACCOUNT)
  console.log('=================================')
  console.log("Azure Storage Key string")
  console.log(AZURE_STORAGE_KEY)
  console.log('=================================')
}


/* 
This is the code that will be used to connect to the Azure Storage Account.
*/
  const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_KEY);
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = new BlobServiceClient(
    AZURE_STORAGE_CONNECTION_STRING,
    sharedKeyCredential
  );
  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);


/* 
  This is a console log that will be used to check if the router is working. 
*/
console.log('Init logger router')

/* 
This is the code that will be used to accept the request from the client and convert it to a json
file and save it to the /temp folder and upload to azure blob.Then delete it after upload complete
 */
router.post('/easylog_1', function(req, res, next) {
  try {
    // accept request and convert to json file and save to /temp folder
    console.log('======================== request body is ===============================')
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
    let blockBlobClient = containerClient.getBlockBlobClient(`${dateNow}.json`);
    // Upload data to the blob
    blockBlobClient.upload(jsonData, jsonData.length)
    .then( (uploadBlobResponse) =>{
      console.log(uploadBlobResponse)
      console.log(
        "Blob was uploaded successfully. requestId: ",
        uploadBlobResponse.requestId
      )
    })
    function deleteFile(){
        fs.unlink(`temp/${dateNow}.json`, (err) => {
          if (err) {
            console.error(err)
          }
        })
      console.log('deleted')
    }
    
    res.status(200).send('OK');
  } catch (err) {
    console.log(err)
    res.status(500).send('error');
  }
  
});

router.get('/checkblob', async (req, res, next) => {
    try {
        let iter = containerClient.listBlobsFlat();
        let blobItem = await iter.next();
        let data = [];
        let size = 0;
        while (!blobItem.done) {
            size += 1;
            console.log(blobItem.value.name)
            data.push(blobItem.value.name)
            blobItem = await iter.next();
        }
        if (size > 0) {
          console.log('done')
          res.status(200).send(data);
          
        } else {
          console.log('The container does not contain any files.')
          res.status(200).send("The container does not contain any files.");
        }
    } catch (error) {
        console.log(error.message);
    }
});

module.exports = router;
