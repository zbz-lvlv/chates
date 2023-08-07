import axios from "axios";

// Make POST request with Axios
export const postForm = async (url: string, data: any, headers={}) => {
  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...headers
    },
  });
  return response.data;
}

export const postJson = async (url: string, data: any, headers={}) => {
  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
  });
  return response.data;
}

export const postJsonForArrayBuffer = async (url: string, data: any, headers={}) => {
  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    responseType: "arraybuffer"
  });
  return response.data;
}