import axios from "axios";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();

const db = getFirestore();
const lostarkApiKey = defineSecret("LOSTARK_API_KEY");
const LOSTARK_CALENDAR_URL =
  "https://developer-lostark.game.onstove.com/gamecontents/calendar";
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const getNextLostarkResetAt = (now = new Date()) => {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const resetKst = new Date(kstNow);

  resetKst.setUTCHours(6, 0, 0, 0);

  if (kstNow >= resetKst) {
    resetKst.setUTCDate(resetKst.getUTCDate() + 1);
  }

  return new Date(resetKst.getTime() - KST_OFFSET_MS);
};

const isFreshCache = (cache) => {
  return cache?.expiresAt?.toMillis?.() > Date.now();
};

const fetchLostarkCalendar = async () => {
  const response = await axios.get(LOSTARK_CALENDAR_URL, {
    headers: {
      accept: "application/json",
      authorization: `bearer ${lostarkApiKey.value()}`,
    },
  });

  return response.data;
};

export const getDailyContents = onRequest(
  {
    region: "asia-northeast3",
    cors: true,
    secrets: [lostarkApiKey],
  },
  async (req, res) => {
    const cacheRef = db
      .collection("serverCache")
      .doc("lostark-daily-contents");

    try {
      const cacheSnap = await cacheRef.get();
      const cache = cacheSnap.exists ? cacheSnap.data() : null;

      if (isFreshCache(cache)) {
        res.set("X-Cache-Source", "firestore");
        res.status(200).json(cache.data);
        return;
      }

      const data = await fetchLostarkCalendar();

      await cacheRef.set({
        data,
        updatedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(getNextLostarkResetAt()),
      });

      res.set("X-Cache-Source", "lostark-api");
      res.status(200).json(data);
    } catch (error) {
      console.error("Failed to fetch Lost Ark daily contents", error);

      const cacheSnap = await cacheRef.get();

      if (cacheSnap.exists) {
        const cache = cacheSnap.data();

        res.set("X-Cache-Source", "stale-firestore");
        res.status(200).json(cache.data);
        return;
      }

      res.status(500).json({
        message: "일일 콘텐츠 정보를 불러오지 못했습니다.",
      });
    }
  }
);
