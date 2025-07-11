import { Button, Form, Input, Spin, message } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.jpg";

const SignUpPage = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        values
      );

      messageApi.success("Sign Up Successful!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      messageApi.error("Sign Up Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {contextHolder}
      <div className="w-[60rem] h-[32rem] bg-white shadow-xl rounded-md flex overflow-hidden">
        {/* Illustration Section */}
        <div
          style={{ backgroundImage: `url(${bgImage})` }}
          className="w-[50%]  bg-cover bg-center bg-no-repeat text-white   flex flex-col items-center justify-center p-10"
        ></div>

        {/* Signup Form Section */}
        <div className="w-[50%] p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">
            Sign Up
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spin size="large" />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Please enter a username" }]}
              >
                <Input placeholder="Enter your username" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please enter an email" }]}
              >
                <Input placeholder="Enter your email address" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter a password" }]}
              >
                <Input.Password placeholder="Choose a strong password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                  Sign Up
                </Button>
              </Form.Item>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login here
                </span>
              </p>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
