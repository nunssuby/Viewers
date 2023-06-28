import axios from "axios";

VITE_BACKEND_URL = 'http://grk-backend.medical-lab.co.kr/'
const loginRequest = axios.create({
  timeout: 8000,
  baseURL: VITE_BACKEND_URL,
  withCredentials: false,
  headers: { "content-type": "application/x-www-form-urlencoded" },
});

export default loginRequest;
