import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Typography, message } from "antd";
import Authentication from "@sdk/Authentication";
import { useRouter } from "next/router";

const { Title, Link } = Typography;

const section = {
  maxWidth: 400,
  alignItems: "center",
  margin: "0 auto",
  padding: "3em 1.4em",
  marginTop: "10em",
  justifyContent: "center",
  background: "rgba( 255, 255, 255, 1 )",
  boxShadow: "0 0 2px rgba( 31, 38, 135, 0.37 )",
  backdropFilter: "blur( 20px )",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "5px",
  border: "1px solid rgba( 255, 255, 255, 0.18 )",
};

const SignIn: React.FC = () => {
  return (
    <div>
      <div style={section}>
        <div style={{ marginBottom: "2em" }}>
          <Title style={{ fontWeight: 900 }}>Welcome back!</Title>
          <Title
            style={{ opacity: 0.6, fontSize: 16, lineHeight: "25px" }}
            level={4}
          >
            Start managing your restaurant or enjoy with your favorite orders
          </Title>
        </div>
        <SignInForm />
      </div>
      <Title
        level={4}
        style={{ opacity: 0.5, fontSize: 14, textAlign: "center" }}
      >
        &copy; 2023 all right reserved
      </Title>
    </div>
  );
};

const SignInForm: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const router = useRouter();

  const onFinish = (values: any) => {
    Authentication.Login(values.email, values.password, values.remember)
      .then((res: any) => {
        toastMessage("Your Signed in Successfully. Redirecting ...", "success");
        if (res.role === "customer") {
          router.push("/home");
        } else if (res.role === "merchant") {
          router.push("/merchants/account");
        } else {
          router.push("/");
        }
      })
      .catch((err) => toastMessage(err.response.data.detail, "error"));
    enterLoading(3);
  };

  const toastMessage = (message: string, type?: any) => {
    messageApi.open({
      type: type,
      content: message,
    });
  };

  const enterLoading = (index: number) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 6000);
  };

  return (
    <>
      {contextHolder}
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input your email address!",
            },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined className="site-form-item-icon" />}
            type="email"
            autoComplete="email"
            placeholder="Email Address"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link href="/signin" style={{ fontWeight: 400, fontSize: "1.1em" }}>
              Forgot password ?
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
            }}
          >
            <Link
              href="/create_new"
              style={{ fontWeight: 500, fontSize: "1.1em" }}
            >
              Create account
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadings[3]}
              className="login-form-button"
              style={{ borderRadius: 3, paddingInline: 30 }}
            >
              Sign In
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

export default SignIn;
