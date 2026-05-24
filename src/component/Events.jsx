import React, { useState, useEffect } from "react";
import './Events.css';

const LOSTARK_EVENTS_API_URL =
    "https://developer-lostark.game.onstove.com/news/events";
const LOSTARK_API_KEY = import.meta.env.VITE_LOSTARK_API_KEY;

const Events = () => {
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                if (!LOSTARK_API_KEY) {
                    throw new Error("VITE_LOSTARK_API_KEY가 설정되지 않았습니다.");
                }

                const response = await fetch(LOSTARK_EVENTS_API_URL, {
                    headers: {
                        accept: "application/json",
                        authorization: `bearer ${LOSTARK_API_KEY}`,
                    },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("진행중인 이벤트 API 요청 실패");
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("진행중인 이벤트 응답 형식 오류");
                }
                setEventsData(data);
                setError(null);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("이벤트 리스트 불러오기 오류", error);
                    setError(error);
                    
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
    }, []);
    return (<div className="viewEvents">
        {loading ? (
            <p >진행중인 이벤트를 불러오는 중입니다.</p>
        ) : error ? (
                <p>이벤트 목록을 불러오지 못했습니다.</p>
            ) : (
                eventsData.map(({ Title, Thumbnail, Link, StartDate, EndDate }) => (
                    <a
                        key={Link}
                        className="eventThumbnail"
                        href={Link}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img className="thumbnail" src={Thumbnail} alt={Title} />
                        {/*
                        <strong>{Title}</strong>
                        <span>{StartDate} ~ {EndDate}</span>
                        */}
                    </a>
        )))}
        
    </div>)
}
export default Events;
