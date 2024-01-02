const TradingView = require('../main');

/**
 * This examples synchronously fetches  some sotock data from 1 indicators
 */

// 'BINANCE:ADAUSDT',  'BINANCE:MATICUSDT'
const multarget = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:BNBUSDT', 'BINANCE:SOLUSDT', 'BINANCE:XRPUSDT', 'BINANCE:AVAXUSDT'];
async function getIndicDataAsync(target, indicator) {



  const client = new TradingView.Client();

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
        close: chart.periods[0].close,
        lines: STD.periods.slice(0, 10),
      });
      console.log(`"${indicator.description}" for ${target} done!`);
      client.end();
    });
  });
}

function isPriceNearVegas(closePrice, emaPrice) {
  const isNear = emaPrice / closePrice >= 0.98 && emaPrice / closePrice <= 1.01;
  return isNear;
}

function timestampToTime(timestamp) {
  timestamp = timestamp ? timestamp : null;
  let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
  let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return Y + M + D + h + m + s;
}

(async () => {
  console.log('Getting all indicators...');
  // USER;a27143fccf634638bd495ebd2640847d
  //"USER;58b1e8b6697a4ca0995c14a5e944e6fe"
  //https://pine-facade.tradingview.com/pine-facade/list?filter=saved  get your  all tradingview indicators 
  const indicDataAsync = await Promise.all(
    multarget.map(
      async (target) => getIndicDataAsync(target, await TradingView.getIndicator('USER;58b1e8b6697a4ca0995c14a5e944e6fe')),
    ),
  );
  indicDataAsync.forEach((target) => {
    //console.log(target.close);
    //console.log(target.goal);
    //console.log(target.lines[1].EMA_1);
    
    const line = target.lines[1];
    const  time= line.$time;
    console.log(time);
    console.log(timestampToTime(line.$time)) ;
    const x = isPriceNearVegas(target.close, line.EMA_1);
    console.log(x);
    if (x) {
      console.log(`${target.goal} is Near`);
    }
  });
  console.log(indicDataAsync);
  console.log('All done !');
})();
