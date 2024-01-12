const fs = require('fs');
const TradingView = require('../main');
const sqlite3 = require('sqlite3').verbose();

/**
 * This examples synchronously fetches  some sotock data from 1 indicators
 */

// 'BINANCE:ADAUSDT',  'BINANCE:MATICUSDT'
// const multarget = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:BNBUSDT', 'BINANCE:SOLUSDT', 'BINANCE:XRPUSDT', 'BINANCE:AVAXUSDT'];
// 'SP:S5INFT', 'SP:SPN', 'SP:S5UTIL', 'SP:S5MATR', 'SP:S5REAS', 'SP:SPF', 'SP:S5INDU', 'SP:S5CONS', 'SP:S5COND', 'SP:S5TELS', 'SP:SPSIBI', 'SP:S5HLTH'
const multarget = ['SP:S5INFT', 'SP:SPN', 'SP:S5UTIL', 'SP:S5MATR', 'SP:S5REAS', 'SP:SPF', 'SP:S5INDU', 'SP:S5CONS', 'SP:S5COND', 'SP:S5TELS', 'SP:SPSIBI', 'SP:S5HLTH'];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getIndicDataAsync(target, indicator) {
  const client = new TradingView.Client();
  await delay(2000);
  return new Promise((resolve) => {
    const chart = new client.Session.Chart();
    chart.setMarket(target, {
      timeframe: '240',
      range: 1,
    });
    const STD = new chart.Study(indicator);

    console.log(`Getting "${indicator.description}" for ${target}...`);

    STD.onUpdate(() => {
      resolve({
        goal: target,

        lines: STD.periods.slice(0, 10),
      });
      console.log(`"${indicator.description}" for ${target} done!`);
      client.end();
    });
  });
}

function isPriceNearVegas(closePrice, emaPrice) {
  const isNear = (emaPrice / closePrice >= 0.995) && (emaPrice / closePrice <= 1.005);
  return isNear;
}

function timestampToTime(timestamp) {
  const date = new Date(timestamp * 1000); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  const Y = `${date.getFullYear()}-`;
  const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-`;
  const D = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()} `;
  const h = `${date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()}:`;
  const m = `${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}:`;
  const s = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
  return Y + M + D + h + m + s;
}
async function fetchIndicData() {
  console.log('Getting all indicators...');
  //  USER;a27143fccf634638bd495ebd2640847d
  // "USER;58b1e8b6697a4ca0995c14a5e944e6fe"
  // https://pine-facade.tradingview.com/pine-facade/list?filter=saved  get yourself  all tradingview indicators
  // const indicDataAsync = await Promise.all(
  //   multarget.map(
  //     async (target) => getIndicDataAsync(target, await TradingView.getIndicator('USER;58b1e8b6697a4ca0995c14a5e944e6fe')),
  //   ),
  // );
  const indicData = [];

  for (const target of multarget) {
    const data = await getIndicDataAsync(target, await TradingView.getIndicator('USER;58b1e8b6697a4ca0995c14a5e944e6fe'));
    indicData.push(data);
  }
  const goal = [];
  indicData.forEach((target) => {
    // console.log(target.goal);
    // console.log(target.close);
    // console.log(time);
    let line = target.lines[1];
    let time = line.$time;
    let localtime = timestampToTime(time);
    if (!target.goal.includes('USDT')) {
      if (!localtime.includes('02:')) {
        line = target.lines[0];
        time = line.$time;
        localtime = timestampToTime(time);
        // console.log(localtime);
      } else {
        // console.log(localtime);
      }
    }

    const closeIsNear55 = isPriceNearVegas(line.Close, line.EMA_1);
    const closeIsNear144 = isPriceNearVegas(line.Close, (line.EMA_2 + line.EMA_3) / 2);
    const closeIsNear288 = isPriceNearVegas(line.Close, (line.EMA_4 + line.EMA_5) / 2);
    const closeIsNear576 = isPriceNearVegas(line.Close, (line.EMA_6 + line.EMA_7) / 2);
    const lowIsNear55 = isPriceNearVegas(line.Low, line.EMA_1);
    const lowIsNear144 = isPriceNearVegas(line.Low, (line.EMA_2 + line.EMA_3) / 2);
    const lowIsNear288 = isPriceNearVegas(line.Low, (line.EMA_4 + line.EMA_5) / 2);
    const lowIsNear576 = isPriceNearVegas(line.Low, (line.EMA_6 + line.EMA_7) / 2);
    const highIsNear55 = isPriceNearVegas(line.High, line.EMA_1);
    const highIsNear144 = isPriceNearVegas(line.High, (line.EMA_2 + line.EMA_3) / 2);
    const highIsNear288 = isPriceNearVegas(line.High, (line.EMA_4 + line.EMA_5) / 2);
    const highIsNear576 = isPriceNearVegas(line.High, (line.EMA_6 + line.EMA_7) / 2);

    // console.log(line.Close);
    // console.log(line.EMA_6);
    // console.log(line.EMA_2 + line.EMA_3 - line.EMA_4 - line.EMA_5);
    if (line.Close > line.EMA_6 && (line.EMA_2 + line.EMA_3 - line.EMA_4 - line.EMA_5) > 0) {
      goal.push({
        // eslint-disable-next-line max-len
        target: target.goal,
        time: localtime,
        trend: 'up',
        close_ema55: closeIsNear55,
        close_ema144: closeIsNear144,
        close_ema288: closeIsNear288,
        close_ema576: closeIsNear576,
        low_ema55: lowIsNear55,
        low_ema144: lowIsNear144,
        low_ema288: lowIsNear288,
        low_ema576: lowIsNear576,
        high_ema55: false,
        high_ema144: false,
        high_ema288: false,
        high_ema576: false,
      });
    }
    if (line.Close < line.EMA_6 && (line.EMA_2 + line.EMA_3 - line.EMA_4 - line.EMA_5) < 0) {
      goal.push({
        // eslint-disable-next-line max-len
        target: target.goal,
        time: localtime,
        trend: 'down',
        close_ema55: closeIsNear55,
        close_ema144: closeIsNear144,
        close_ema288: closeIsNear288,
        close_ema576: closeIsNear576,
        low_ema55: false,
        low_ema144: false,
        low_ema288: false,
        low_ema576: false,
        high_ema55: highIsNear55,
        high_ema144: highIsNear144,
        high_ema288: highIsNear288,
        high_ema576: highIsNear576,
      });
    }
  });
  const text = JSON.stringify(goal); /// Import SqliteDB.

  const file = './stocks.db';
  const exists = fs.existsSync(file);

  const db = new sqlite3.Database(file);
  /// create table.
  const createtargetTableSql = `create table if not exists targets(target TEXT, time TEXT, trend TEXT,close_ema55 NUMERIC,close_ema144 NUMERIC,
    close_ema288 NUMERIC,close_ema576 NUMERIC,low_ema55 NUMERIC ,low_ema144 NUMERIC,low_ema288 NUMERIC,low_ema576 NUMERIC,high_ema55 NUMERIC,high_ema144 NUMERIC,high_ema288 NUMERIC,high_ema576  NUMERIC,createTime TEXT );`;

  // db.serialize(() => {
  //   db.run(createtargetTableSql, (err) => {
  //     if (err != null) {
  //       db.printErrorInfo(err);
  //     }
  //   });
  // });
  /// insert data.
  db.run('DELETE FROM targets WHERE 1 = 1', function (err) {
    if (err) {
      return console.log(err.message);
    }
    console.log('deleted targets: ', this);
  });
  const insertTileSql = `insert into targets
  (target, time, trend,close_ema55,close_ema144,close_ema288,close_ema576,low_ema55,low_ema144,low_ema288,low_ema576,high_ema55,high_ema144,high_ema288,high_ema576,createTime) 
  values(?, ?, ?,?, ?, ?,?, ?, ?,?, ?, ?,?, ?, ?,?)`;
  const crrentTiem = timestampToTime(Math.round(new Date() / 1000));
  db.serialize(() => {
    const stmt = db.prepare(insertTileSql);
    for (const x of goal) {
      const arr = [x.target, x.time, x.trend, x.close_ema55, x.close_ema144, x.close_ema288, x.close_ema576, x.low_ema55, x.low_ema144, x.low_ema288, x.low_ema576, x.high_ema55, x.high_ema144, x.high_ema288, x.high_ema576, crrentTiem];
      stmt.run(arr);
    }

    stmt.finalize();
  });

  // console.log(text);
  db.all('select * from targets', (err, row) => {
    console.log(JSON.stringify(row));
  });
 

  db.close();
  // console.log(indicDataAsync);
  console.log('All done !');
}

(async () => {
  await fetchIndicData();
})();
