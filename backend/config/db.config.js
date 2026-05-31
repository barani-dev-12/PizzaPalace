require("dotenv").config();

const getMongoUrl = () => {
  const uri = process.env.MONGO_URI?.trim();
  if (uri) return uri;

  const host = process.env.DB_HOST?.trim();
  const name = process.env.DB_NAME?.trim();
  if (host && name) {
    return `mongodb://${host}/${name}`;
  }

  return null;
};

module.exports = {
  getMongoUrl,
  get url() {
    return getMongoUrl();
  },
};
