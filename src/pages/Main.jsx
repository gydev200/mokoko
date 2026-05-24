import "./Main.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import banner1 from "../assets/banner1.svg";
import banner2 from "../assets/banner2.svg";
import banner3 from "../assets/banner3.svg";
import banner4 from "../assets/banner4.svg";
import Logo from "./../component/Logo";
import SideMenu from "../component/SideMenu";
import DailyContent from "./../component/DailyContent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import SearchCharacter from "../component/SearchMyCharacter";
import { onAuthStateChanged } from "firebase/auth";
import { authService } from "../../firebase.js";
import { useDispatch, useSelector } from "react-redux";
import LoginButton from "../component/LoginButton";
import Profile from "../component/Profile";
import Spinner from "../assets/spinner.gif";
import Events from './../component/Events.jsx'
const Main = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthUser, setisAuthUser] = useState(false);
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user.value);
  const auth = authService;
  const openTalk = () => {
    window.open("https://open.kakao.com/o/gbZ50Xwd");
  };
  const openDiscord = () => {
    window.open("https://discord.gg/Ez5cYeNp");
  };
  const onClickLogin = () => {
    navigate("/login");
  };
  const handleInput = (e) => {
    console.log(e.target.value);
    const inputValue = e.target.value;
    setInputText(inputValue);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authService, (authUser) => {
      if (authUser !== null) {
        console.log("로그인 중!", authUser.displayName);
        setisAuthUser(true);
      } else {
        console.log("로그인 중 인 유저가 없습니다", authUser);
        setisAuthUser(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);
  if (loading) {
    return <img src={Spinner} alt="Loading..." />;
  }

  return (
    <>
      <div className="mainContainer">
        <div className="item loginbox">
          <Logo />
          {isAuthUser ? <Profile /> : <LoginButton />}
          <div className="openLink">
            <label htmlFor="카카오톡" className="linkBtn">
              <button className="kakaotalkLink " onClick={openTalk}></button>
            </label>
            <label htmlFor="" className="linkBtn">
              <button
                className="discordLink linkBtn"
                onClick={openDiscord}
              ></button>
            </label>
          </div>
        </div>
        <div className="sidebar">
          <SideMenu />
        </div>
        <div className="item banner">
          <Swiper
            slidesPerView="auto"
            spaceBetween={30}
            loop={true}
            keyboard={{
              enabled: true,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={true}
            modules={[Keyboard, Pagination, Navigation]}
            className="mySwiper"
          >
            <SwiperSlide>
              <img src={banner1} />
            </SwiperSlide>
            <SwiperSlide>
              <img src={banner2} />
            </SwiperSlide>
            <SwiperSlide>
              <img src={banner3} />
            </SwiperSlide>
            <SwiperSlide>
              <img src={banner4} />
            </SwiperSlide>
          </Swiper>
        </div>

        <div className="item island">
          모험섬 일정
          <DailyContent />
        </div>
        <div className="item event">진행중인 이벤트
          <Events />
        </div>
        <div className="item board1">게시판(최근글)</div>
        <div className="item board2">게시판(인기글)</div>
        <div className="item gallery">갤러리~~</div>
      </div>
    </>
  );
};
export default Main;
