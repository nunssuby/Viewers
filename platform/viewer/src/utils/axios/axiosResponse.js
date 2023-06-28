import axios from "axios";

const VITE_BACKEND_URL = 'http://grk-backend.medical-lab.co.kr/'
const request = axios.create({
  timeout: 30000,
  baseURL: VITE_BACKEND_URL,
  responseType: false,
  headers: {
    "Content-Type": "applicatipn/json",
    Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
  },
});

request.interceptors.request.use((config) =>{
  const jwt = sessionStorage.getItem("jwt");

  if(jwt === null){
    window.location.href = "/login";
  }else{
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401){
      window.location.href = "/login"
    }
    return Promise.reject(error);
  }
)
export default request;
