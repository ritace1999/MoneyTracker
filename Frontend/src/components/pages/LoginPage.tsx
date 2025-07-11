import { Button, Form, Input, Spin, message } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.jpg";

const LoginPage = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        values
      );
      localStorage.setItem("access", response.data.token);

      messageApi.success("Login Successful!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error(error);
      messageApi.error("Login Failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {contextHolder}
      <div className="w-[60rem] h-[32rem] bg-white shadow-xl rounded-md flex overflow-hidden">
        <div
          style={{ backgroundImage: `url(${bgImage})` }}
          className="w-[50%]  bg-cover bg-center bg-no-repeat text-white   flex flex-col items-center justify-center p-10"
        ></div>

        <div className="w-[50%] p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">
            Welcome
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spin size="large" />
            </div>
          ) : (
            <Form
              form={form}
              name="login"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please enter your username" },
                ]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                  Login
                </Button>
              </Form.Item>

              <div className="flex justify-center text-sm">
                <p>
                  Don't have an account?{" "}
                  <span
                    onClick={() => navigate("/register")}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Sign Up
                  </span>
                </p>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
