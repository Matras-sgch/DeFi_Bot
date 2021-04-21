const { default: axios } = require("axios");
const { ChainId, Fetcher, WETH, Route, Token } = require("@uniswap/sdk");
const ethers = require("ethers");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const poolsApiKey = process.env.POOLS_API_KEY;
const coinmarketcapKey = process.env.COINMARKETCAP_KEY;
const etherscanKey = process.env.ETHERSCAN_KEY;
const botToken = process.env.BOT_TOKEN;

const bot = new TelegramBot(botToken, { polling: true });

const chainId = ChainId.MAINNET;

bot.onText(/\/coin (.+)/, (msg, [source, address]) => {
  const id = msg.chat.id;

  axios
    .get(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanKey}`
    )
    .then(async (data) => {
      switch (address) {
        case "0x6b175474e89094c44da98b954eedeac495271d0f": // Dai
          const daiInfo = await getCoinInfo("Dai");

          const dai = new Token(ChainId.MAINNET, address, 18);
          const daiPair = await Fetcher.fetchPairData(dai, WETH[dai.chainId]);
          const daiRoute = new Route([daiPair], WETH[dai.chainId]);
          const daiUsd =
            data.data.result.ethusd / daiRoute.midPrice.toSignificant(6);
          bot.sendMessage(
            id,
            `DAI is ${daiUsd}$; hour change is ${daiInfo[0].quote.USD.percent_change_1h}%`
          );
          break;
        case "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": // Weth
          const wethInfo = await getCoinInfo("Ethereum");
          bot.sendMessage(
            id,
            `WETH is ${data.data.result.ethusd}$; hour change is ${wethInfo[0].quote.USD.percent_change_1h}%`
          );
          break;
        default:
          bot.sendMessage(id, `Sorry. I don't work with such coins`);
      }
    });
});

bot.onText(/\/pools (.+)/, async (msg, [source, address]) => {
  id = msg.chat.id;
  const pools = await getPools(address);
  bot.sendMessage(id, pools);
});

bot.onText(/\/funding/, async (msg) => {
  const id = msg.chat.id;
  const funding = await getFunding();
  bot.sendMessage(id, funding);
});

bot.onText(/\/gas/, async (msg) => {
  const id = msg.chat.id;
  const gas = await getGas();
  bot.sendMessage(id, gas);
});

const getCoinInfo = async (coinName) => {
  const coinResp = await axios.get(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
    { headers: { "X-CMC_PRO_API_KEY": coinmarketcapKey } }
  );

  coinInfo = coinResp.data.data.filter((coin) => coin.name === coinName);
  return coinInfo.flat();
};

const getFunding = async () => {
  const fundingResp = await axios.get(
    "https://fapi.binance.com/fapi/v1/fundingRate"
  );

  let funding = "Binance Futures and Funding rates: ";

  fundingResp.data.forEach(
    (element) =>
      (funding +=
        "\n " + element.symbol + ": " + element.fundingRate * 100 + ";")
  );

  return funding;
};

const getGas = async () => {
  const gasResp = await axios.get(
    `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${etherscanKey}`
  );
  const gas = `fast - ${gasResp.data.result.FastGasPrice} 
Average - ${gasResp.data.result.ProposeGasPrice}
Low - ${gasResp.data.result.SafeGasPrice}`;
  return gas;
};

const getPools = async (address) => {
  const poolsResp = await axios.get(
    `https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges?api-key=${poolsApiKey}`
  );
  let poolsRes = "pools: \n";
  let pools = [];
  poolsResp.data.results.forEach((pool) => {
    let count = 0;
    pool.assets.forEach((asset) => {
      if (asset.address === address) {
        count++;
      }
    });
    if (count > 0) {
      pools.push(pool);
    }
  });
  if (pools.length > 6) {
    pools = pools.slice(0, 6);
  }
  pools.forEach((pool) => {
    let assetsString = "";
    pool.assets.forEach((asset) => {
      assetsString +=
        "\n" +
        asset.symbol +
        ": balance = " +
        asset.balance +
        "; \nweight = " +
        asset.weight +
        "%";
    });
    poolsRes +=
      "\n" +
      pool.poolName +
      "\nVolume = " +
      pool.usdVolume +
      "$" +
      "\nLiquidity = " +
      pool.usdLiquidity +
      "$" +
      assetsString +
      "\n\n\n";
  });
  return poolsRes;
};
