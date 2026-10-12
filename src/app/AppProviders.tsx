import type { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { colors, fontBody } from '../styles/tokens';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: colors.primary,
          colorLink: colors.primary,
          colorTextBase: colors.text,
          colorBgLayout: colors.paper,
          colorBorderSecondary: colors.line,
          fontFamily: fontBody,
          fontSize: 16,
          borderRadius: 4,
          borderRadiusLG: 6,
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            headerHeight: 72,
            headerPadding: 0,
            footerBg: colors.ink,
            footerPadding: '56px 0 32px',
            bodyBg: colors.paper,
          },
          Menu: {
            itemColor: colors.text,
            itemHoverColor: colors.primary,
            itemSelectedColor: colors.primary,
            horizontalItemSelectedColor: colors.primary,
            horizontalLineHeight: '70px',
            activeBarHeight: 3,
            activeBarBorderWidth: 0,
          },
          Button: {
            fontWeight: 600,
            primaryShadow: 'none',
            defaultShadow: 'none',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
