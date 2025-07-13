import { Button, Form, Input, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ResetPasswordPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/password-reset-confirm/",
        {
          email: values.email,
          token: values.token,
          password: values.password,
        }
      );
      messageApi.success("✅ Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      messageApi.error("❌ Reset failed. Invalid token or email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-100">
      {contextHolder}
      <div className="p-6 bg-white shadow-lg rounded w-[25rem]">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
          Reset Your Password
        </h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            label="Reset Token"
            name="token"
            rules={[{ required: true, message: "Please enter the token" }]}
          >
            <Input placeholder="Enter the token from email" />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="password"
            rules={[{ required: true, message: "Please enter a new password" }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
          >
            Reset Password
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
