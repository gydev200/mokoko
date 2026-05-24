import React, { useState, useEffect } from "react";
import "./DailyContent.css";

const LOSTARK_CALENDAR_API_URL =
  "https://developer-lostark.game.onstove.com/gamecontents/calendar";
const LOSTARK_API_KEY = import.meta.env.VITE_LOSTARK_API_KEY;
const MAX_REWARD_ICON_COUNT = 6;
const REWARD_NAME_PRIORITY = [
  "골드",
  "겁화의 보석",
  "작열의 보석",
  "각인서",
  "섬의 마음",
];
const REWARD_GRADE_PRIORITY = {
  고대: 4,
  전설: 3,
  영웅: 2,
  일반: 1,
};

const getClosestFutureTime = (startTimes = [], now = new Date()) => {
  return startTimes
    .map((time) => new Date(time))
    .filter((time) => time > now)
    .sort((a, b) => a - b)[0];
};

const getRewardNamePriority = (name = "") => {
  const priorityIndex = REWARD_NAME_PRIORITY.findIndex((keyword) =>
    name.includes(keyword),
  );

  return priorityIndex === -1 ? REWARD_NAME_PRIORITY.length : priorityIndex;
};

const getRewardGradePriority = (grade = "") => {
  return REWARD_GRADE_PRIORITY[grade] ?? 0;
};

const getRewardDedupKey = (item) => {
  if (item.Name?.includes("골드")) {
    return "골드";
  }

  return item.Icon;
};

const getRewardIcons = (rewardItems = []) => {
  const rewardMap = new Map();

  rewardItems
    .flatMap((rewardGroup) => rewardGroup.Items ?? [])
    .filter((item) => item.Icon)
    .forEach((item) => {
      const dedupKey = getRewardDedupKey(item);

      if (!rewardMap.has(dedupKey)) {
        rewardMap.set(dedupKey, {
          name: item.Name,
          icon: item.Icon,
          grade: item.Grade,
        });
      }
    });

  return Array.from(rewardMap.values())
    .sort((a, b) => {
      const namePriorityDiff =
        getRewardNamePriority(a.name) - getRewardNamePriority(b.name);

      if (namePriorityDiff !== 0) {
        return namePriorityDiff;
      }

      return getRewardGradePriority(b.grade) - getRewardGradePriority(a.grade);
    })
    .slice(0, MAX_REWARD_ICON_COUNT);
};

const formatContentTime = (date) => {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getUpcomingContentsByCategory = (contents = [], now = new Date()) => {
  const categoryMap = new Map();

  contents.forEach((content) => {
    const closestStartTime = getClosestFutureTime(content.StartTimes, now);

    if (!closestStartTime) {
      return;
    }

    const categoryName = content.CategoryName ?? "기타";
    const currentContent = categoryMap.get(categoryName);

    if (!currentContent || closestStartTime < currentContent.closestStartTime) {
      categoryMap.set(categoryName, {
        ...content,
        closestStartTime,
        rewardIcons: getRewardIcons(content.RewardItems),
      });
    }
  });

  return Array.from(categoryMap.entries()).map(([categoryName, content]) => ({
    categoryName,
    content,
  }));
};

const DailyContent = () => {
  const [contentData, setContentData] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        if (!LOSTARK_API_KEY) {
          throw new Error("VITE_LOSTARK_API_KEY가 설정되지 않았습니다.");
        }

        const response = await fetch(LOSTARK_CALENDAR_API_URL, {
          headers: {
            accept: "application/json",
            authorization: `bearer ${LOSTARK_API_KEY}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("일일 콘텐츠 API 요청 실패");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("일일 콘텐츠 응답 형식 오류");
        }

        setContentData(data);
        setError(null);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("모험섬 컨텐츠 불러오기 오류", error);
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => clearInterval(timerId);
  }, []);

  const upcomingContents = getUpcomingContentsByCategory(contentData, now);

  return (
    <div className="viewContent">
      <div className="dailyContent">
        {loading ? (
          <p className="dailyContentState">일일 콘텐츠를 불러오는 중입니다.</p>
        ) : error ? (
          <p className="dailyContentState">
            일일 콘텐츠를 불러오지 못했습니다.
          </p>
        ) : upcomingContents.length === 0 ? (
          <p className="dailyContentEmpty">예정된 콘텐츠가 없습니다.</p>
        ) : (
          upcomingContents.map(({ categoryName, content }) => (
            <div key={categoryName} className="contentCard">
              <div className="contentCategory">{categoryName}</div>
              <div className="contentInfo">
                <img
                  src={content.ContentsIcon}
                  alt={content.ContentsName}
                  className="contentIcon"
                />
                <div className="contentText">
                  <strong>{content.ContentsName}</strong>
                  <span>{formatContentTime(content.closestStartTime)}</span>
                  {content.Location && <span>{content.Location}</span>}
                </div>
              </div>
              <div className="rewardIcons">
                {content.rewardIcons.map((item) => (
                  <img
                    key={`${content.ContentsName}-${item.name}-${item.icon}`}
                    src={item.icon}
                    alt={item.name}
                    title={item.name}
                    className="rewardIcon"
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default DailyContent;
