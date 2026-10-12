import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { colors } from '../styles/tokens';

/** Re-themes buttons so they stay legible on the dark ink background. */
export function OnDark({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: colors.gold,
            colorPrimaryHover: '#E6B85C',
            colorPrimaryActive: '#C48F2E',
            primaryColor: colors.ink,
            defaultGhostColor: '#ffffff',
            defaultGhostBorderColor: 'rgba(255, 255, 255, 0.7)',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
