import { ThemeConfig, theme } from "antd/lib";

export const ohifTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1454d4", // OHIF blue
    colorBgBase: "#050615", // Dark background
    colorTextBase: "#ffffff", // White text
    colorText: "#dcdcdc", // Slightly muted white
    colorBorder: "#1b6ef3", // Subtle border
    colorBgContainer: "#090c29", // Panel background
    colorFillSecondary: "#252a74", // Input or card fill
    controlItemBgHover: "#252a74", // Input or card fill
  }
};
