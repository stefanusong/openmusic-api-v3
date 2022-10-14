const config = {
  server: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
  },
  s3: {
    bucketName: process.env.AWS_BUCKET_NAME,
  },
  rabbitMq: {
    host: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
  storage: {
    path: process.env.UPLOAD_DIR
      ? process.env.UPLOAD_DIR
      : 'public/images/album',
  },
};

module.exports = config;
