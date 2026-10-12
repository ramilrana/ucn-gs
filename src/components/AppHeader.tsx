import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Layout, Menu, type MenuProps } from "antd";
import { site } from "../data/site";
import { colors } from "../styles/tokens";

export function AppHeader() {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems: MenuProps["items"] = site.navItems.map(
    ({ path, label }) => ({
      key: path,
      label: <Link to={path}>{label}</Link>,
    }),
  );

  return (
    <Layout.Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: `1px solid ${colors.line}`,
      }}
    >
      <div className="page-container header-inner">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            {/* {site.monogram} */}
            <img src="/public/SchoolLogo.png" alt={site.officeName} />
          </span>
          <span className="brand__text">
            <span className="brand__name">{site.officeName}</span>
            <span className="brand__sub">{site.universityName}</span>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Main">
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{ justifyContent: "flex-end", borderBottom: "none" }}
          />
        </nav>

        <Button
          className="nav-mobile"
          type="text"
          size="large"
          aria-label="Open menu"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
        />
      </div>

      <Drawer
        title={site.officeName}
        placement="right"
        width={280}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={() => setDrawerOpen(false)}
          style={{ borderInlineEnd: "none" }}
        />
      </Drawer>
    </Layout.Header>
  );
}
