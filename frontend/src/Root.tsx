import React, { useEffect } from "react";
import App from "./App";

const ipbe = import.meta.env.VITE_IPBE;

const Root: React.FC = () => {
  useEffect(() => {
    const getStoreSettings = async () => {
      try {
        const res = await fetch(`${ipbe}:5000/api/admin/settings`);
        const data = await res.json();

        if (data.storeName) document.title = data.storeName;
        if (data.storeLogo) {
          const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
          if (favicon) favicon.href = data.storeLogo;
        }
      } catch (error) {
        console.error("Gagal mengambil store name:", error);
      }
    };

    getStoreSettings();
  }, []);

  return <App />;
};

export default Root;
