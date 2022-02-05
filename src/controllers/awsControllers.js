const aws = require('aws-sdk');

aws.config.update({

    accessKeyId: 'AKIAY3L35MCRRMC6253G',
    secretAccessKey: '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',
    region: 'ap-south-1'
})

let uploadFile = async (file) => {
    return new Promise( function(resolve,reject) {

        let s3 = new aws.S3({apiVersion: "2006-03-01"});

        let uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "Gp13/SCM/" + file.originalname,
            Body: file.buffer 
        }

        s3.upload(uploadParams , function (err, data) {
            if(err) return reject({"error": err})

            return resolve(data.Location);
        });

    });

}

module.exports = {uploadFile}