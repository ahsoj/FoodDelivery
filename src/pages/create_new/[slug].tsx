import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, message, Select, Form, Input, Typography } from "antd";
import Authentication from "@sdk/Authentication";
import { useRouter } from "next/router";

const { Title, Link } = Typography;
const { Option } = Select;

const section = {
  maxWidth: 500,
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

const CreateNewAccount: React.FC = () => {
  return (
    <div>
      <div style={section}>
        <Title style={{ fontWeight: 900, textAlign: "center" }}>
          Create New
        </Title>
        <RegisterForm />
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

const prefixSelector = (
  <Form.Item name="prefix" noStyle>
    <Select style={{ width: 70 }}>
      <Option value="86">+86</Option>
      <Option value="87">+87</Option>
    </Select>
  </Form.Item>
);

const RegisterForm: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const router = useRouter();
  let role = router.query.slug;
  const _role =
    role === "customer"
      ? "customer"
      : role === "merchants"
      ? "merchants"
      : role === "drivers"
      ? "drivers"
      : "customer";
  const onFinish = (values: any) => {
    Authentication.Register(values.email, values.phone, values.password, _role)
      .then((res: any) => router.push(`/signin/`))
      .catch((err: any) => {
        if (err?.response?.data?.email) {
          toastMessage(err?.response?.data?.email, "error");
        }
        if (err?.response?.data?.phone) {
          toastMessage(err?.response?.data?.phone, "error");
        }
      });
    console.log("Received values of form: ", values);
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
        layout="vertical"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please enter valid email address!",
            },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined className="site-form-item-icon" />}
            type="email"
            autoComplete="email"
            placeholder="email address"
          />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please input your phone number!" },
          ]}
        >
          <Input
            addonBefore={prefixSelector}
            size="large"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            size="large"
          />
        </Form.Item>
        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
            }}
          >
            <Link href="/signin" style={{ fontWeight: 500, fontSize: "1.1em" }}>
              Sign in
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{ borderRadius: 3, paddingInline: 30 }}
              loading={loadings[3]}
            >
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

export default CreateNewAccount;
