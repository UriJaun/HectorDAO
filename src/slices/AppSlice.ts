import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as OlympusStakingv2 } from "../abi/OlympusStakingv2.json";
import { abi as sOHM } from "../abi/sOHM.json";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sOHMv2 } from "../abi/sOhmv2.json";
import { setAll, getTokenPrice, getMarketPrice } from "../helpers";
import { NodeHelper } from "../helpers/NodeHelper";
import apollo from "../lib/apolloClient.js";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import { calcRunway } from "../helpers/Runway";

const initialState = {
  loading: false,
  loadingMarketPrice: false,
  loadingRunway: false,
};

export const loadAppDetails = createAsyncThunk("app/loadAppDetails", async (thunk: IBaseAsyncThunk, { dispatch }) => {
  const { networkID, provider } = thunk;
  // const protocolMetricsQuery = `
  // query {
  //   _meta {
  //     block {
  //       number
  //     }
  //   }
  //   protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
  //     timestamp
  //     ohmCirculatingSupply
  //     sOhmCirculatingSupply
  //     totalSupply
  //     ohmPrice
  //     marketCap
  //     totalValueLocked
  //     treasuryMarketValue
  //     nextEpochRebase
  //     nextDistributedOhm
  //   }
  // }
  // `;
  //
  // const graphData = await apollo(protocolMetricsQuery);
  //
  // if (!graphData) {
  //   console.error("Returned a null response when querying TheGraph");
  //   return;
  // }

  const stakingContract = new ethers.Contract(
    addresses[networkID].STAKING_ADDRESS as string,
    OlympusStakingv2,
    provider,
  );
  // NOTE (appleseed): marketPrice from Graph was delayed, so get CoinGecko price
  // const marketPrice = parseFloat(graphData.data.protocolMetrics[0].ohmPrice);
  let marketPrice;
  try {
    const originalPromiseResult = await dispatch(
      loadMarketPrice({ networkID: networkID, provider: provider }),
    ).unwrap();
    marketPrice = originalPromiseResult?.marketPrice;
  } catch (rejectedValueOrSerializedError) {
    // handle error here
    console.error("Returned a null response from dispatch(loadMarketPrice)");
    return;
  }
  const sohmMainContract = new ethers.Contract(addresses[networkID].SOHM_ADDRESS as string, sOHMv2, provider);
  const ohmContract = new ethers.Contract(addresses[networkID].OHM_ADDRESS as string, ierc20Abi, provider);
  const hecBalance = await ohmContract.balanceOf(addresses[networkID].STAKING_ADDRESS);
  const stakingTVL = (hecBalance * marketPrice) / 1000000000;
  const circ = await sohmMainContract.circulatingSupply();
  const circSupply = circ / 1000000000;
  const total = await ohmContract.totalSupply();
  const totalSupply = total / 1000000000;
  const marketCap = marketPrice * totalSupply;
  // const treasuryMarketValue = parseFloat(graphData.data.protocolMetrics[0].treasuryMarketValue);
  // const currentBlock = parseFloat(graphData.data._meta.block.number);
  if (!provider) {
    console.error("failed to connect to provider, please connect your wallet");
    return {
      stakingTVL,
      marketPrice,
      marketCap,
      circSupply,
      totalSupply,
      // treasuryMarketValue,
    };
  }
  const currentBlock = await provider.getBlockNumber();

  // Calculating staking
  const epoch = await stakingContract.epoch();
  const stakingReward = epoch.distribute;
  const stakingRebase = stakingReward / circ;
  const fiveDayRate = Math.pow(1 + stakingRebase, 5 * 3) - 1;
  const stakingAPY = Math.pow(1 + stakingRebase, 365 * 3) - 1;
  // Current index
  let currentIndex = await stakingContract.index();
  currentIndex = currentIndex.sub(1300000000);
  const endBlock = epoch.endBlock;

  return {
    currentIndex: ethers.utils.formatUnits(currentIndex, "gwei"),
    currentBlock,
    fiveDayRate,
    stakingAPY,
    stakingTVL,
    stakingRebase,
    marketCap,
    marketPrice,
    circSupply,
    totalSupply,
    // treasuryMarketValue,
    endBlock,
  } as IAppData;
});

export const loadRunway = createAsyncThunk("app/loadRunway", async (thunk: IBaseAsyncThunk, { getState }) => {
  const { networkID, provider } = thunk;
  const state: any = getState();
  let circSupply;
  if (state.app.circSupply) {
    circSupply = state.app.circSupply;
  } else {
    const sohmMainContract = new ethers.Contract(addresses[networkID].SOHM_ADDRESS as string, sOHMv2, provider);
    const circ = await sohmMainContract.circulatingSupply();
    circSupply = circ / 1000000000;
  }
  return { runway: await calcRunway(circSupply, thunk) };
});

/**
 * checks if app.slice has marketPrice already
 * if yes then simply load that state
 * if no then fetches via `loadMarketPrice`
 *
 * `usage`:
 * ```
 * const originalPromiseResult = await dispatch(
 *    findOrLoadMarketPrice({ networkID: networkID, provider: provider }),
 *  ).unwrap();
 * originalPromiseResult?.whateverValue;
 * ```
 */
export const findOrLoadMarketPrice = createAsyncThunk(
  "app/findOrLoadMarketPrice",
  async ({ networkID, provider }: IBaseAsyncThunk, { dispatch, getState }) => {
    const state: any = getState();
    let marketPrice;
    // check if we already have loaded market price
    if (state.app.loadingMarketPrice === false && state.app.marketPrice) {
      // go get marketPrice from app.state
      marketPrice = state.app.marketPrice;
    } else {
      // we don't have marketPrice in app.state, so go get it
      try {
        const originalPromiseResult = await dispatch(
          loadMarketPrice({ networkID: networkID, provider: provider }),
        ).unwrap();
        marketPrice = originalPromiseResult?.marketPrice;
      } catch (rejectedValueOrSerializedError) {
        // handle error here
        console.error("Returned a null response from dispatch(loadMarketPrice)");
        return;
      }
    }
    return { marketPrice };
  },
);

/**
 * - fetches the OHM price from CoinGecko (via getTokenPrice)
 * - falls back to fetch marketPrice from ohm-dai contract
 * - updates the App.slice when it runs
 */
const loadMarketPrice = createAsyncThunk("app/loadMarketPrice", async ({ networkID, provider }: IBaseAsyncThunk) => {
  let marketPrice: number;
  try {
    marketPrice = await getMarketPrice({ networkID, provider });
    marketPrice = marketPrice / Math.pow(10, 9);
  } catch (e) {
    marketPrice = await getTokenPrice("hector");
  }
  return { marketPrice };
});

interface IAppData {
  readonly circSupply: number;
  readonly currentIndex?: string;
  readonly currentBlock?: number;
  readonly fiveDayRate?: number;
  readonly marketCap: number;
  readonly marketPrice: number;
  readonly stakingAPY?: number;
  readonly stakingRebase?: number;
  readonly stakingTVL: number;
  readonly totalSupply: number;
  readonly treasuryBalance?: number;
  readonly treasuryMarketValue?: number;
  readonly endBlock?: number;
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchAppSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAppDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAppDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAppDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      })
      .addCase(loadMarketPrice.pending, (state, action) => {
        state.loadingMarketPrice = true;
      })
      .addCase(loadMarketPrice.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loadingMarketPrice = false;
      })
      .addCase(loadMarketPrice.rejected, (state, { error }) => {
        state.loadingMarketPrice = false;
        console.error(error.name, error.message, error.stack);
      })
      .addCase(loadRunway.pending, (state, action) => {
        state.loadingRunway = true;
      })
      .addCase(loadRunway.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loadingRunway = false;
      })
      .addCase(loadRunway.rejected, (state, { error }) => {
        state.loadingRunway = false;
        console.error(error.name, error.message, error.stack);
      });
  },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
