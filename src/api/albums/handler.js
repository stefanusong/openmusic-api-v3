class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._albumsService.addAlbum(request.payload);

    return h
      .response({
        status: 'success',
        message: 'Album has been added',
        data: {
          albumId,
        },
      })
      .code(201);
  }

  async postAlbumCoverHandler(request, h) {
    const { cover: data } = request.payload;
    const { id: albumId } = request.params;
    this._validator.validateAlbumCover(data.hapi.headers);

    const fileName = await this._storageService.writeFile(data, data.hapi);
    await this._albumsService.editAlbumCoverById(albumId, fileName);

    return h
      .response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      })
      .code(201);
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._albumsService.getAlbumSongsById(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album has been updated',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album has been deleted',
    };
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const userAlbumLikes = await this._albumsService.verifyAlbumLikeExists(
      albumId,
      credentialId,
    );
    const isAlreadyLiked = userAlbumLikes !== 0;

    if (isAlreadyLiked) {
      await this._albumsService.deleteUserAlbumLike(credentialId, albumId);
      return h
        .response({
          status: 'success',
          message: 'Album has been disliked',
        })
        .code(201);
    }
    await this._albumsService.addUserAlbumLike(credentialId, albumId);

    return h
      .response({
        status: 'success',
        message: 'Album has been liked',
      })
      .code(201);
  }

  async getAlbumLikesCountHandler(request, h) {
    const { id: albumId } = request.params;
    const { count, isFromCache } = await this._albumsService.getUserAlbumLikesCount(albumId);

    const response = {
      status: 'success',
      data: { likes: count },
    };

    if (isFromCache) {
      return h.response(response).header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsHandler;
