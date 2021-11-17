import { ReactComponent as ForumIcon } from "../../assets/icons/forum.svg";
import { ReactComponent as GovIcon } from "../../assets/icons/governance.svg";
import { ReactComponent as DocsIcon } from "../../assets/icons/docs.svg";
import { ReactComponent as SpookySwapIcon } from "../../assets/icons/spookyswap.svg";
import { ReactComponent as SpiritSwapIcon } from "../../assets/icons/spiritswap.svg";
import { ReactComponent as FeedbackIcon } from "../../assets/icons/feedback.svg";
import { SvgIcon } from "@material-ui/core";
import { AccountBalanceOutlined, MonetizationOnOutlined } from "@material-ui/icons";

const externalUrls = [
  // {
  //   title: "Forum",
  //   url: "https://forum.app.hectordao.com/",
  //   icon: <SvgIcon color="primary" component={ForumIcon} />,
  // },
  // {
  //   title: "Governance",
  //   url: "https://vote.app.hectordao.com/",
  //   icon: <SvgIcon color="primary" component={GovIcon} />,
  // },
  {
    title: "Buy on SpookySwap",
    url: "https://spookyswap.finance/swap?inputCurrency=0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E&outputCurrency=0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0",
    icon: <SvgIcon viewBox="0 0 64 64" color="primary" component={SpookySwapIcon} />,
  },
  {
    title: "Buy on SpiritSwap",
    url: "https://swap.spiritswap.finance/#/exchange/swap/0x5c4fdfc5233f935f20d2adba572f770c2e377ab0",
    icon: <SvgIcon viewBox="0 0 155 172" color="primary" component={SpiritSwapIcon} />,
  },
  {
    title: "Hector Lend",
    label: "(Coming soon)",
    icon: <MonetizationOnOutlined viewBox="0 0 20 24" />,
  },
  {
    title: "Hector Borrow",
    label: "(Coming soon)",
    icon: <MonetizationOnOutlined viewBox="0 0 20 24" />,
  },
  {
    title: "Hector PRO",
    label: "(Coming soon)",
    icon: <AccountBalanceOutlined viewBox="0 0 20 24" />,
  },
  {
    title: "Governance",
    url: "https://snapshot.org/#/hectordao.eth",
    icon: <SvgIcon color="primary" component={GovIcon} />,
  },
  {
    title: "Docs",
    url: "https://docs.hectordao.com",
    icon: <SvgIcon color="primary" component={DocsIcon} />,
  },
  // {
  //   title: "Feedback",
  //   url: "https://olympusdao.canny.io/",
  //   icon: <SvgIcon color="primary" component={FeedbackIcon} />,
  // },
];

export default externalUrls;
