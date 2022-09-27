const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, fileData) => {
    fs.writeFile(path.join(exports.dataDir, `${fileData}.txt`), text, (err) => {
      if (err) {
        console.log('error writing file');
      } else {
        callback(null, {id: fileData, text: text});
      }
    });
  });
};



exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw ('error reading data folder');
    }
    var data = _.map(files, (file) => {
      var id = path.basename(file, '.txt');
      var filepath = path.join(exports.dataDir, file);
      return new Promise((resolve, reject) => {
        fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf-8', (err, text) => {
          if (err) {
            reject(err);
          } else {
            resolve({id: id, text: text});
          }
        });
      });
    });
    Promise.all(data)
      .then(items => callback(null, items), err => callback(err));
  });
};



exports.readOne = (id, callback) => {
  let dir = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(dir, 'utf-8', (err, fileData) => {
    if (err) {
      callback(new Error(`Could not find file: ${id}`));
    } else {
      callback(null, {id, text: fileData});
    }
  });
};


exports.update = (id, text, callback) => {
  let dir = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(dir, 'utf-8', (err, fileData) => {
    if (err) {
      callback(new Error(`Could not find file: ${id}`));
    } else {
      fs.writeFile(dir, text, () => {
        callback(null, {id, text});
      });
    }
  });
};

exports.delete = (id, callback) => {
  let dir = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(dir, (err) => {
    if (err) {
      callback(new Error(`Could not find file: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};



