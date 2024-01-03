const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./stocks.db', (() => {
  db.all('select * from targets', (err, res) => {
    if (!err) { console.log(JSON.stringify(res)); } else { console.log(err); }
  });
}));
