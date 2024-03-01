const fs = require('fs');
const { MongoClient } = require('mongodb');
const TradingView = require('../main');
// const sqlite3 = require('sqlite3').verbose();
/**
 * This examples synchronously fetches  some sotock data from 1 indicators
 */

// 'BINANCE:ADAUSDT',  'BINANCE:MATICUSDT'
const multarget = [
  'BINANCE:BTCUSDT',
  'BINANCE:ETHUSDT',
  'BINANCE:BNBUSDT',
  'BINANCE:SOLUSDT',
  'BINANCE:XRPUSDT',
  'BINANCE:AVAXUSDT',
];
// 'SP:S5INFT', 'SP:SPN', 'SP:S5UTIL', 'SP:S5MATR', 'SP:S5REAS', 'SP:SPF', 'SP:S5INDU', 'SP:S5CONS', 'SP:S5COND', 'SP:S5TELS', 'SP:SPSIBI', 'SP:S5HLTH'
// const multarget = ['SP:S5INFT', 'SP:SPN', 'SP:S5UTIL', 'SP:S5MATR', 'SP:S5REAS', 'SP:SPF', 'SP:S5INDU', 'SP:S5CONS', 'SP:S5COND', 'SP:S5TELS', 'SP:SPSIBI', 'SP:S5HLTH'];
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
  const isNear = emaPrice / closePrice >= 0.995 && emaPrice / closePrice <= 1.005;
  return isNear;
}

function timestampToTime(timestamp) {
  // const date = new Date(timestamp * 1000); // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  const str = new Date(timestamp * 1000).toLocaleString('en-US', {
    timeZone: 'Asia/shanghai',
  });
  const date = new Date(str);

  // console.log(date.getHours());
  const Y = `${date.getFullYear()}-`;
  const M = `${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }-`;
  const D = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()} `;
  const h = `${
    date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
  }:`;
  const m = `${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  }:`;
  const s = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
  return Y + M + D + h + m + s;
}

async function createMultipleListings(client, newListings) {
  const result = await client
    .db('stocktrend')
    .collection('ticker')
    .insertMany(newListings);

  console.log(
    `${result.insertedCount} new listing(s) created with the following id(s):`,
  );
  // console.log(result.insertedIds);
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
    const data = await getIndicDataAsync(
      target,
      await TradingView.getIndicator('USER;58b1e8b6697a4ca0995c14a5e944e6fe'),
    );
    indicData.push(data);
  }
  const goals = [];
  indicData.forEach((target) => {
    // console.log(target.goal);
    // console.log(target.close);
    // console.log(time);
    let line = target.lines[1];
    let time = line.$time;
    let localtime = timestampToTime(time);
    const crrentTime = timestampToTime(Math.round(new Date() / 1000));
    if (!target.goal.includes('USDT')) {
      if (!crrentTime.includes('02:3')) {
        line = target.lines[0];
        time = line.$time;
        localtime = timestampToTime(time);
        // console.log(localtime);
      } else {
        // console.log(localtime);
      }
    }

    const closeIsNear55 = isPriceNearVegas(line.Close, line.EMA_1);
    const closeIsNear144 = isPriceNearVegas(
      line.Close,
      (line.EMA_2 + line.EMA_3) / 2,
    );
    const closeIsNear288 = isPriceNearVegas(
      line.Close,
      (line.EMA_4 + line.EMA_5) / 2,
    );
    const closeIsNear576 = isPriceNearVegas(
      line.Close,
      (line.EMA_6 + line.EMA_7) / 2,
    );
    const lowIsNear55 = isPriceNearVegas(line.Low, line.EMA_1);
    const lowIsNear144 = isPriceNearVegas(
      line.Low,
      (line.EMA_2 + line.EMA_3) / 2,
    );
    const lowIsNear288 = isPriceNearVegas(
      line.Low,
      (line.EMA_4 + line.EMA_5) / 2,
    );
    const lowIsNear576 = isPriceNearVegas(
      line.Low,
      (line.EMA_6 + line.EMA_7) / 2,
    );
    const highIsNear55 = isPriceNearVegas(line.High, line.EMA_1);
    const highIsNear144 = isPriceNearVegas(
      line.High,
      (line.EMA_2 + line.EMA_3) / 2,
    );
    const highIsNear288 = isPriceNearVegas(
      line.High,
      (line.EMA_4 + line.EMA_5) / 2,
    );
    const highIsNear576 = isPriceNearVegas(
      line.High,
      (line.EMA_6 + line.EMA_7) / 2,
    );

    // console.log(line.Close);
    // console.log(line.EMA_6);
    // console.log(line.EMA_2 + line.EMA_3 - line.EMA_4 - line.EMA_5);
    if (
      line.Close > line.EMA_6
      && line.EMA_2 + line.EMA_3 - line.EMA_4 - line.EMA_5 > 0
    ) {
      goals.push({
        // eslint-disable-next-line max-len
        target: target.goal,
        time: localtime,
        trend: 'up',
        type: [
          { text: 'close_ema55', value: closeIsNear55 },
          { text: 'close_ema144', value: closeIsNear144 },
          { text: 'close_ema288', value: closeIsNear288 },
          { text: 'close_ema576', value: closeIsNear576 },
          { text: 'low_ema55', value: lowIsNear55 },
          { text: 'low_ema144', value: lowIsNear144 },
          { text: 'low_ema288', value: lowIsNear288 },
          { text: 'low_ema576', value: lowIsNear576 },
          { text: 'high_ema55', value: false },
          { text: 'high_ema144', value: false },
          { text: 'high_ema288', value: false },
          { text: 'high_ema576', value: false },
        ],
      });
    } else
    if (
      line.Close < line.EMA_6
      && line.EMA_2 + line.EMA_3 - line.EMA_4 - line.EMA_5 < 0
    ) {
      goals.push({
        // eslint-disable-next-line max-len
        target: target.goal,
        time: localtime,
        trend: 'down',
        type: [
          { text: 'close_ema55', value: closeIsNear55 },
          { text: 'close_ema144', value: closeIsNear144 },
          { text: 'close_ema288', value: closeIsNear288 },
          { text: 'close_ema576', value: closeIsNear576 },
          { text: 'low_ema55', value: false },
          { text: 'low_ema144', value: false },
          { text: 'low_ema288', value: false },
          { text: 'low_ema576', value: false },
          { text: 'high_ema55', value: highIsNear55 },
          { text: 'high_ema144', value: highIsNear144 },
          { text: 'high_ema288', value: highIsNear288 },
          { text: 'high_ema576', value: highIsNear576 },
        ],
      });
    } else {
      goals.push({
        target: target.goal,
        time: localtime,
        trend: 'unknown',
        type: [
          { text: 'close_ema55', value: closeIsNear55 },
          { text: 'close_ema144', value: closeIsNear144 },
          { text: 'close_ema288', value: closeIsNear288 },
          { text: 'close_ema576', value: closeIsNear576 },
          { text: 'low_ema55', value: lowIsNear55 },
          { text: 'low_ema144', value: lowIsNear144 },
          { text: 'low_ema288', value: lowIsNear288 },
          { text: 'low_ema576', value: lowIsNear576 },
          { text: 'high_ema55', value: highIsNear55 },
          { text: 'high_ema144', value: highIsNear144 },
          { text: 'high_ema288', value: highIsNear288 },
          { text: 'high_ema576', value: highIsNear576 },
        ],
      });
    }
  });
  const crrentTime = timestampToTime(Math.round(new Date() / 1000));
  console.log(`crrentTime:n${crrentTime}`);
  const url = 'mongodb://edc:qwer1234@13.208.141.165:27017/';
  const mgclient = new MongoClient(url);
  const items = [];
  let i = 1;
  for (const x of goals.sort((a, b) => a.target.localeCompare(b.target))) {
    for (let index = 0; index < x.type.length; index++) {
      const item = {
        no: i,
        target: x.target,
        time: x.time,
        trend: x.trend,
        type: x.type[index].text,
        val: x.type[index].value,
        cretetime: crrentTime,
      };
      items.push(item);
    }
    i++;
  }

  try {
    // Connect to the MongoDB cluster
    await mgclient.connect();

    await createMultipleListings(mgclient, items);
  } catch (e) {
    console.error(e);
  } finally {
    await mgclient.close();
  }
}

(async () => {
  await fetchIndicData();
})();
