import { Button, Form, Input, message } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values: any) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/password-reset/", values);
      messageApi.success("Token sent to your email.");
      setEmailSent(true);

      setTimeout(() => {
        navigate("/reset-password");
      }, 2000);
    } catch (err) {
      messageApi.error("Email not found.");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100">
      {contextHolder}
      <div className="p-6 bg-white shadow-lg rounded w-[25rem]">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
          Forgot Password
        </h2>
        {emailSent ? (
          <div className="text-center text-green-600">
            Token sent to your email.
          </div>
        ) : (
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Send Token
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
