import { useState, useEffect } from "react";
import { api } from "@/lib/sdk-config";
import { ServiceFullDetail, ServiceCategoryInfo, Banner } from "@vitalfit/sdk";

export function useEditServiceData(serviceId: string, token: string | null) {
  const [data, setData] = useState<{
    service: ServiceFullDetail | null;
    categories: ServiceCategoryInfo[];
    banners: Banner[];
  }>({ service: null, categories: [], banners: [] });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token || !serviceId) {
        return;
      }
      try {
        const [srv, cats, bans] = await Promise.all([
          api.products.getServiceByID(serviceId, token),
          api.products.getCategories(token),
          api.marketing.getBanner(token),
        ]);
        setData({
          service: srv.data,
          categories: cats.data || [],
          banners: bans.data || [],
        });
      } catch (error) {
        console.error("Error loading edit data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [serviceId, token]);

  return { ...data, isLoading };
}