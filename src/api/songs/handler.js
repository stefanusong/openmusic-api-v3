class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);

    return h
      .response({
        status: 'success',
        message: 'Song has been added',
        data: {
          songId,
        },
      })
      .code(201);
  }

  async getSongsHandler(request) {
    const { title = '', performer = '' } = request.query;

    const songs = await this._service.getSongs(title, performer);

    // if (title) {
    //   songs = songs.filter((x) =>
    //     x.title.toLowerCase().includes(title.toLowerCase())
    //   );
    // }

    // if (performer) {
    //   songs = songs.filter((x) =>
    //     x.performer.toLowerCase().includes(performer.toLowerCase())
    //   );
    // }

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Song has been updated',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Song has been deleted',
    };
  }
}

module.exports = SongsHandler;
