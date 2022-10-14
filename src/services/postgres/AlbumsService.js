const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { albumMapper } = require('../../utils/mapper');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Failed to create album');
    }

    return rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album is not found');
    }

    return rows.map(albumMapper)[0];
  }

  async getAlbumSongsById(id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async editAlbumCoverById(id, filename) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [filename, id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Albums is not found');
    }
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album is not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album is not found');
    }
  }

  async verifyAlbumExists(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new NotFoundError('Album is not found');
    }
  }

  async verifyAlbumLikeExists(albumId, userId) {
    await this.verifyAlbumExists(albumId);

    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const { rowCount } = await this._pool.query(query);
    return rowCount;
  }

  async addUserAlbumLike(userId, albumId) {
    const id = `useralbumlike-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3)',
      values: [id, userId, albumId],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new InvariantError('Failed to add album like');
    }

    await this._cacheService.delete(`albumlike:${albumId}`);
  }

  async deleteUserAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const { rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new InvariantError('Failed to delete album like');
    }

    await this._cacheService.delete(`albumlike:${albumId}`);
  }

  async getUserAlbumLikesCount(albumId) {
    try {
      const likeCounts = await this._cacheService.get(`albumlike:${albumId}`);
      return {
        count: JSON.parse(likeCounts),
        isFromCache: true,
      };
    } catch {
      const query = {
        text: 'SELECT user_id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const { rowCount } = await this._pool.query(query);
      if (!rowCount) {
        throw new NotFoundError('Album is not found');
      }
      await this._cacheService.set(
        `albumlike:${albumId}`,
        JSON.stringify(rowCount),
      );

      return {
        count: rowCount,
        isFromCache: false,
      };
    }
  }
}

module.exports = AlbumsService;
