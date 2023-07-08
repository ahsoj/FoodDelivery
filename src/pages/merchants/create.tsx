import BaseLayout from "@layout/dashboardLayout";
import {
  Button,
  Form,
  Upload,
  message,
  InputNumber,
  Select,
  Input,
  Tooltip,
  Switch,
} from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import {
  useCreateRestaurantMenuMutation,
  useGetRestaurantsQuery,
} from "@sdk/redux/api/apiStore";
import Authentication from "@sdk/Authentication";

const { Dragger } = Upload;
const { TextArea } = Input;

const props: UploadProps = {
  name: "file",
  multiple: true,
  maxCount: 1,
  listType: "picture",
};

// const onSearchChange = (value: string) => {
//   console.log(`selected ${value}`);
// };

// const onSearch = (value: string) => {
//   console.log("search:", value);
// };

// const onCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//   console.log("Change:", e.target.value);
// };

const category = [
  {
    value: "jack",
    label: "Jack",
  },
  {
    value: "lucy",
    label: "Lucy",
  },
  {
    value: "tom",
    label: "Tom",
  },
];

interface UserId {
  user_id?: string;
  role?: string;
}

export default function CreateProduct() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const [userId, setUserId] = useState<UserId | null>({});
  const [createMenu, response] = useCreateRestaurantMenuMutation();

  useEffect(() => {
    let user: any = Authentication.getUser();
    if (user !== null) {
      setUserId(user);
    }
  }, []);

  const onFinish = (values: any) => {
    // console.log("Received values of form: ", values);
    if (userId !== null) {
      let formData = {
        menu_name: values.name,
        description: values.caption,
        category: values.category,
        price: values.price,
        ingredients: values.ingredients,
        menu_image: values.image.file.thumbUrl,
        is_active: values.is_ready,
        owner: userId?.user_id,
      };
      console.log(response);
      createMenu(formData)
        .unwrap()
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    } else {
      console.log("you are no allowed to create menuItems");
    }
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
    <BaseLayout>
      {contextHolder}
      <Form
        style={{
          maxWidth: 600,
          margin: "0 auto",
          justifySelf: "center",
          alignItems: "center",
        }}
        id="create_restaurant-menu-form"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="image">
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or upload. max upload size 2MB
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item name="name" label="Name">
          <Input
            placeholder="Product Name"
            style={{ width: "100%", flex: 1 }}
          />
        </Form.Item>
        <Form.Item name="caption" label="Description">
          <TextArea
            showCount
            maxLength={100}
            style={{ height: 120, resize: "none", width: "100%", flex: 1 }}
            // onChange={onCaptionChange}
            placeholder="Production Description"
          />
        </Form.Item>
        <Form.Item name="category" label="Category">
          <Select
            showSearch
            placeholder="Select a Category"
            optionFilterProp="children"
            // onChange={onSearchChange}
            // onSearch={onSearch}
            style={{ width: "100%", flex: 1 }}
            filterOption={(input, option: any) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={category}
          />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          style={{ width: "100%", flex: 1 }}
        >
          <InputNumber style={{ width: "100%", flexGrow: 1 }} />
        </Form.Item>
        <Form.Item name="ingredients">
          <Input
            placeholder="Enter chips"
            suffix={
              <Tooltip title="Extra information">
                <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
              </Tooltip>
            }
          />
        </Form.Item>
        <Form.Item name="is_ready" label="Is Ready To deliver ?">
          <Switch
            // checked={true}
            checkedChildren="Ready"
            unCheckedChildren="Pending"
            // onChange={() => {
            //   setInput(!input);
            // }}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loadings[3]} block>
          Create
        </Button>
      </Form>
    </BaseLayout>
  );
}
