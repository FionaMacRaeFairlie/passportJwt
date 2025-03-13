const Datastore = require("gray-nedb");

class UserDAO {
  constructor(dbFilePath) {
    if (dbFilePath) {
      //embedded
      this.db = new Datastore({
        filename: dbFilePath.filename,
        autoload: true,
      });
    } else {
      //in memory
      this.db = new Datastore();
    }
  }
  // for the demo the password is the bcrypt of the user name
  init() {}
  
  findOne(user) {
    return new Promise((resolve, reject) => {
      this.db.find({ user: user.user }, function (err, user) {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

}

const dao = new UserDAO({ filename: "user.db", autoload: true });
dao.init();

module.exports = dao;
