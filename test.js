var MongoClient = require('mongodb').MongoClient;


const crrentTiem = time(Math.round(new Date() / 1000));
console.log(crrentTiem );

function time(time) {

var url = "mongodb://127.0.0.1:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log(err)
        }
  console.log("Database created!");
  db.close();
});

  const str = new Date(time*1000).toLocaleString('en-US',{
    timeZone: "Asia/shanghai",
  });
  console.log(str);
const date = new Date(str);

//console.log(date.getHours());
   const Y = `${date.getFullYear()}-`;
  const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
  const D = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()} `;
   const h = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
  const m = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`;
  const s = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
    return Y + M + D + h + m + s
}
