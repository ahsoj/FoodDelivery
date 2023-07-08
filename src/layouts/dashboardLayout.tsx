import React, { useState, useEffect } from "react";
import {
  PieChartOutlined,
  UserOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme, Space, Badge } from "antd";
import { useRouter } from "next/router";
import { BiAddToQueue, BiBell } from "react-icons/bi";

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Dashboard", "dashboard", <AppstoreOutlined />),
  getItem("Create", "create", <BiAddToQueue />),
  getItem("Store", "store", <PieChartOutlined />),
  getItem("Account", "account", <UserOutlined />),
];

const locateTo = ["", "dashboard", "create", "store", "account"];

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [innerHeight, setInnerHeight] = useState<number>(400);
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  useEffect(() => {
    if (window !== undefined) {
      setInnerHeight(window.innerHeight / 1.5);
    }
  }, []);

  const handleMenuSelect = ({ key }: any) => {
    router.push(`/merchants/${key}/`);
  };
  const activepath = router.pathname.split("/").at(-1) || "dashboard";

  return (
    <Layout style={{ minHeight: "97vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value: boolean | ((prevState: boolean) => boolean)) =>
          setCollapsed(value)
        }
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={[activepath]}
          mode="inline"
          items={items}
          onSelect={handleMenuSelect}
        />
      </Sider>
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 30,
          background: " rgba( 255, 255, 255, 1 )",
          boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
          backdropFilter: "blur( 20px )",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "100%",
          border: "1px solid rgba( 255, 255, 255, 0.18 )",
        }}
      >
        <Space size={10} style={{ padding: "5px 10px" }}>
          <Badge count={10} overflowCount={99}>
            <BiBell fontSize={30} />
          </Badge>
        </Space>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Content style={{ margin: "80px 16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: innerHeight,
              background: colorBgContainer,
            }}
          >
            {children}
          </div>
        </Content>
      </div>
    </Layout>
  );
};

export default BaseLayout;
