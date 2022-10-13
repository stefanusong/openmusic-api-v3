class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const userId = await this._service.addUser(request.payload);

    return h
      .response({
        status: 'success',
        message: 'User has been added',
        data: {
          userId,
        },
      })
      .code(201);
  }
}

module.exports = UsersHandler;
