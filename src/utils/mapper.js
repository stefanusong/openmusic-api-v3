const config = require('./config');

const albumMapper = ({
  id, name, year, cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover
    ? `http://${config.server.host}:${config.server.port}/albums/cover/${cover}`
    : null,
});

module.exports = { albumMapper };
