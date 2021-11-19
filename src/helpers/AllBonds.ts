import { StableBond, LPBond, NetworkID, CustomBond, BondType } from "src/lib/Bond";
import { addresses } from "src/constants";

import { ReactComponent as DaiImg } from "src/assets/tokens/DAI.svg";
import { ReactComponent as HecDaiimg } from "src/assets/tokens/HEC-DAI.svg";
import { ReactComponent as wFTMImg } from "src/assets/tokens/wFTM.svg";
import { ReactComponent as UsdcImg } from "src/assets/tokens/USDC.svg";
import { ReactComponent as MimImg } from "src/assets/tokens/mim.svg";
import { ReactComponent as HecUsdcImg } from "src/assets/tokens/HEC-USDC.svg";

import { abi as BondOhmDaiContract } from "src/abi/bonds/OhmDaiContract.json";
import { abi as HecUsdcContract } from "src/abi/bonds/HecUsdcContract.json";

import { abi as DaiBondContract } from "src/abi/bonds/DaiContract.json";
import { abi as ReserveOhmDaiContract } from "src/abi/reserves/OhmDai.json";
import { abi as ReserveHecUsdcContract } from "src/abi/reserves/HecUsdc.json";

import { abi as EthBondContract } from "src/abi/bonds/EthContract.json";

import { abi as ierc20Abi } from "src/abi/IERC20.json";

// TODO(zx): Further modularize by splitting up reserveAssets into vendor token definitions
//   and include that in the definition of a bond
export const dai = new StableBond({
  name: "dai",
  displayName: "DAI",
  bondToken: "DAI",
  bondIconSvg: DaiImg,
  bondContractABI: DaiBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x4099EB0e82Ffa0048E4BF037a9743ca05Ec561D7",
      reserveAddress: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xDea5668E815dAF058e3ecB30F645b04ad26374Cf",
      reserveAddress: "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C",
    },
  },
});

export const ftm = new CustomBond({
  name: "ftm",
  displayName: "wFTM",
  lpUrl: "",
  bondType: BondType.StableAsset,
  bondToken: "WFTM",
  bondIconSvg: wFTMImg,
  bondContractABI: EthBondContract,
  reserveContract: ierc20Abi, // The Standard ierc20Abi since they're normal tokens
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x72De9F0e51cA520379a341318870836FdCaf03B9",
      reserveAddress: "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xca7b90f8158A4FAA606952c023596EE6d322bcf0",
      reserveAddress: "0xc778417e063141139fce010982780140aa0cd5ab",
    },
  },
  customTreasuryBalanceFunc: async function (this: CustomBond, networkID, provider) {
    const ethBondContract = this.getContractForBond(networkID, provider);
    let ethPrice = await ethBondContract.assetPrice();
    ethPrice = ethPrice / Math.pow(10, 8);
    const token = this.getContractForReserve(networkID, provider);
    let ethAmount = await token.balanceOf(addresses[networkID].TREASURY_ADDRESS);
    ethAmount = ethAmount / Math.pow(10, 18);
    return ethAmount * ethPrice;
  },
});

export const usdc = new StableBond({
  name: "usdc",
  displayName: "USDC",
  bondToken: "USDC",
  bondIconSvg: UsdcImg,
  bondContractABI: DaiBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x5d05EF2654B9055895F21D7057095e2D7575f5A2",
      reserveAddress: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xF651283543fB9D61A91f318b78385d187D300738",
      reserveAddress: "0x2F7249cb599139e560f0c81c269Ab9b04799E453",
    },
  },
});

export const mim = new StableBond({
  name: "mim",
  displayName: "MIM",
  bondToken: "MIM",
  bondIconSvg: MimImg,
  bondContractABI: DaiBondContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xb26be27f6f980efb07ae757d0a6a372671eacf7f",
      reserveAddress: "0x82f0B8B456c1A451378467398982d4834b6829c1",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xF651283543fB9D61A91f318b78385d187D300738",
      reserveAddress: "0x2F7249cb599139e560f0c81c269Ab9b04799E453",
    },
  },
});

export const hec_dai = new LPBond({
  name: "hec_dai_lp_v1",
  displayName: "HEC-DAI LP v1",
  bondToken: "DAI",
  bondIconSvg: HecDaiimg,
  bondContractABI: BondOhmDaiContract,
  reserveContract: ReserveOhmDaiContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0xA1224c353cdCB03eB70FbA44dADC137F39E5EF7d",
      reserveAddress: "0xbc0eecdA2d8141e3a26D2535C57cadcb1095bca9",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xcF449dA417cC36009a1C6FbA78918c31594B9377",
      reserveAddress: "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2",
    },
  },
  lpUrl:
    "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
});

export const hec_dai_v2 = new LPBond({
  name: "hec_dai_lp",
  displayName: "HEC-DAI LP v2",
  bondToken: "DAI",
  bondIconSvg: HecDaiimg,
  bondContractABI: BondOhmDaiContract,
  reserveContract: ReserveOhmDaiContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x6c9b3a47a28a39fea65e99d97895e717df1706d0",
      reserveAddress: "0xbc0eecdA2d8141e3a26D2535C57cadcb1095bca9",
    },
    [NetworkID.Testnet]: {
      bondAddress: "0xcF449dA417cC36009a1C6FbA78918c31594B9377",
      reserveAddress: "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2",
    },
  },
  lpUrl:
    "https://spookyswap.finance/add/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
});

export const hec_usdc = new LPBond({
  name: "hec_usdc_lp",
  displayName: "HEC-USDC LP",
  bondToken: "USDC",
  bondIconSvg: HecUsdcImg,
  bondContractABI: HecUsdcContract,
  reserveContract: ReserveHecUsdcContract,
  networkAddrs: {
    [NetworkID.Mainnet]: {
      bondAddress: "0x3C57481f373Be0196A26A7d0a8E29E8CedC63ba1",
      reserveAddress: "0xd661952749f05acc40503404938a91af9ac1473b",
    },
    [NetworkID.Testnet]: {
      // NOTE (appleseed-lusd): using ohm-dai rinkeby contracts
      bondAddress: "0xcF449dA417cC36009a1C6FbA78918c31594B9377",
      reserveAddress: "0x8D5a22Fb6A1840da602E56D1a260E56770e0bCE2",
    },
  },
  lpUrl:
    "https://swap.spiritswap.finance/#/add/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
});

// HOW TO ADD A NEW BOND:
// Is it a stableCoin bond? use `new StableBond`
// Is it an LP Bond? use `new LPBond`
// Add new bonds to this array!!
export const allBonds = [hec_dai_v2, hec_usdc, ftm, dai, usdc, mim];
export const allBondsMap = allBonds.reduce((prevVal, bond) => {
  return { ...prevVal, [bond.name]: bond };
}, {});

// Debug Log
// console.log(allBondsMap);
export default allBonds;
