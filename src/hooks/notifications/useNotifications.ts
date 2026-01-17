"use client";

import { useState } from "react";
import { api } from "@/lib/sdk-config";
import useSWR from "swr";

export function useNotifications(jwt: string) {

  const [limit, setLimit] = useState(10);

  const listKey = jwt ? ["notifications", "list", jwt, limit] : null;
  const countKey = jwt ? ["notifications", "unread-count", jwt] : null;

  const { 
    data: listData, 
    error: listError, 
    mutate: mutateList, 
    isValidating: isListValidating 
  } = useSWR(
    listKey,
    async () => {
      const response = await api.notification.getNotifications(jwt, { 
        page: 1, 
        limit: limit, 
        sort: "desc" 
      });
      return response; 
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 60000,
    }
  );

  const { 
    data: countData, 
    mutate: mutateCount 
  } = useSWR(
    countKey,
    async () => {
      const response = await api.notification.getUnreadCount(jwt);
      return response;
    },
    { refreshInterval: 30000 }
  );

  const markAsRead = async (notificationId: string) => {
    try {
      await api.notification.markAsRead(notificationId, jwt);
      mutateList();
      mutateCount();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notification.markAllAsRead(jwt);
      mutateList();
      mutateCount();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const hasMore = (listData?.data?.length || 0) < (countData?.count || 0);

  return {
    notifications: listData?.data || [], 
    unreadCount: countData?.count || 0,
    isLoading: !listError && !listData,
    isSyncing: isListValidating,
    isError: listError,
    hasMore,
    loadMore: () => setLimit(prev => prev + 10),
    markAsRead,
    markAllAsRead,
    refresh: () => {
      mutateList();
      mutateCount();
    }
  };
}