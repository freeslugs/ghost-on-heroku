// Ghost Configuration for Heroku

var fs = require('fs');
var path = require('path');
var url = require('url');

function createConfig() {
  var fileStorage, storage;

  if (!!process.env.S3_ACCESS_KEY_ID) {
    fileStorage = true
    storage = {
      active: 's3',
      's3': {
        accessKeyId:     process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
        bucket:          process.env.S3_BUCKET_NAME,
        region:          process.env.S3_BUCKET_REGION,
        assetHost:       process.env.S3_ASSET_HOST_URL
      }
    }
  } else if (!!process.env.BUCKETEER_AWS_ACCESS_KEY_ID) {
    fileStorage = true
    storage = {
      active: 's3',
      's3': {
        accessKeyId:     process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
        bucket:          process.env.BUCKETEER_BUCKET_NAME,
        region:          process.env.S3_BUCKET_REGION,
        assetHost:       process.env.S3_ASSET_HOST_URL
      }
    }
  } else {
    fileStorage = false
    storage = {}
  }

  config = {
    url: process.env.PUBLIC_URL,
    logging: {
      level: "info",
      transports: ["stdout"]
    },
    mail: {
      transport: 'SMTP',
      options: {
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_SMTP_LOGIN,
          pass: process.env.MAILGUN_SMTP_PASSWORD
        }
      }
    },
    fileStorage: fileStorage,
    storage: storage,
    database: {
      client: 'mysql',
      connection: getMysqlConfig(process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL),
      debug: false
    },
    server: {
      host: '0.0.0.0',
      port: process.env.PORT
    },
    paths: {
      contentPath: path.join(__dirname, '/content/')
    }
  };

  return config;
}

function getMysqlConfig(connectionUrl) {
  if (connectionUrl == null) {
    return {};
  }

  var dbConfig = url.parse(connectionUrl);
  if (dbConfig == null) {
    return {};
  }

  var dbAuth = dbConfig.auth ? dbConfig.auth.split(':') : [];
  var dbUser = dbAuth[0];
  var dbPassword = dbAuth[1];

  if (dbConfig.pathname == null) {
    var dbName = 'ghost';
  } else {
    var dbName = dbConfig.pathname.split('/')[1];
  }

  var dbConnection = {
    host: dbConfig.hostname,
    port: dbConfig.port || '3306',
    user: dbUser,
    password: dbPassword,
    database: dbName
  };
  return dbConnection;
}

var configContents = JSON.stringify(createConfig(), null, 2);
fs.writeFileSync(path.join(__dirname, 'config.production.json'), configContents);
