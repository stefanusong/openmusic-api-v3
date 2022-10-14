exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(60)",
      primaryKey: true,
    },
    user_id: {
      type: "TEXT",
      notNull: true,
      references: '"users"',
      onDelete: "cascade",
    },
    album_id: {
      type: "TEXT",
      notNull: true,
      references: '"albums"',
      onDelete: "cascade",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("user_album_likes");
};
