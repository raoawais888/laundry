import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [phone, setPhone] = useState("");

  const sendOtp = async () => {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/send-otp`,
      { phone }
    );

    console.log(response);
  };

  return (
    <div>
      <h1>Welcome Back</h1>

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+61 412345678"
      />

      <button onClick={sendOtp}>
        Continue with OTP
      </button>
    </div>
  );
}