import BotIcon from "../icons/BotIcon";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../api/axiosInstance";

const LoginPage = ({ onLogin }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <div className="text-center p-8">
      <BotIcon className="w-16 h-16 text-teal-400 mx-auto mb-4" />
      <h1 className="text-4xl font-bold mb-2">Xeno Mini CRM</h1>
      <p className="text-slate-400 mb-8">
        Customer Segmentation & Campaign Delivery Platform
      </p>

      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse.credential;
          const userInfo = jwtDecode(idToken);

          try {
            // send token to backend
            const res = await axiosInstance.post("/auth/verify", { idToken });

            if (res.status === 200) {
              const { token, profile } = res.data;

              // save JWT token for later API calls
              sessionStorage.setItem("xeno-crm-token", token);

              // login user
              onLogin({
                name: profile.name || userInfo.name,
                email: profile.email || userInfo.email,
                imageUrl: profile.picture || userInfo.picture,
              });
            } else {
              console.error("Login failed:", res.data.error);
            }
          } catch (err) {
            console.error("Error during login:", err);
          }
        }}
        onError={() => console.log("Login Failed")}
      />
    </div>
  </div>
);

export default LoginPage;