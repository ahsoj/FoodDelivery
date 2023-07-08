import axios from "@sdk/axios";
import Cookies from "js-cookie";
import jwt_decode from "jwt-decode";
import { UserInfo } from "../pages/types/type";

function getUser() {
  let accessToken = Cookies.get("token");
  if (accessToken) {
    const _accessToken = jwt_decode(accessToken);
    return _accessToken as UserInfo;
  } else {
    return null;
  }
}

function Login(
  email?: string,
  password?: string,
  remember?: boolean
): Promise<object> {
  return new Promise((resolve, reject) => {
    axios
      .post("/auth/login/user/", { email, password })
      .then((resp) => {
        resolve(resp.data);
        if (resp.data.access) {
          Cookies.set("token", JSON.stringify(resp.data), {
            expires: remember ? 60 : 1,
          });
          axios.defaults.headers.Authorization = `Bearer ${resp.data.access}`;
        }
      })
      .catch(reject);
  });
}

type Role = "customer" | "merchants" | "drivers";

function Register(
  email: string,
  phone: string,
  password: string,
  continueAs: Role
): Promise<object> {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${
          continueAs === "merchants"
            ? "/restaurant"
            : `/auth/register/${continueAs}/`
        }`,
        {
          email,
          phone,
          password,
        }
      )
      .then((resp) => {
        if (resp.status === 201 || resp.data.access === 201) {
          resolve(resp.data);
        }
      })
      .catch(reject);
  });
}

function Logout() {
  try {
    Cookies.remove("token");
    delete axios.defaults.headers.Authorization;
    if (typeof window !== undefined) {
      window.location.href = "/signin";
    }
  } catch (err) {
    console.log(err);
  }
}

export default { getUser, Login, Register, Logout };
