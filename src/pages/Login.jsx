import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../redux/user"; //Redux Thunk
import "./Login.css";
import Logo from "./../component/Logo";
import Clicked from "../assets/check_on.svg";
import unClicked from "../assets/check_off.svg";

const Login = () => {
  const [userInputData, setUserInputData] = useState({ id: "", password: "" });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isPWHide] = useState(true);
  const [isAutoLoginClicked, setIsAutoLoginClicked] = useState(false);

  const dispatch = useDispatch();
  const idInputRef = useRef();
  const passwordInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setIsButtonDisabled(
      userInputData.id.trim() === "" || userInputData.password === ""
    );
  }, [userInputData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = userInputData.id.trim();
    const password = userInputData.password;

    if (email === "") {
      alert("이메일을 입력해주세요");
      idInputRef.current.focus();
      return;
    } else if (password === "") {
      alert("비밀번호를 입력해주세요");
      passwordInputRef.current.focus();
      return;
    } else {
      dispatch(loginUser({ email, password }))
        .unwrap()
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          console.error("Login Error details", error);
          switch (error.code) {
            case "auth/invalid-credential":
              alert("이메일 또는 비밀번호가 일치하지 않습니다.");
              break;
            case "auth/user-not-found":
              alert("가입되지 않은 사용자 입니다.");
              break;
            case "auth/wrong-password":
              alert("비밀번호가 일치하지 않습니다.");
              break;
            case "auth/invalid-email":
              alert("유효하지 않은 이메일 형식입니다");
              break;
            default:
              alert("로그인에 실패했습니다. 다시 시도해주세요.");
              break;
          }
          // const errorCode = error.code;
          // const errorMessage = error.message;
          // console.log(errorCode);
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInputData((prevData) => {
      const nextData = {
        ...prevData,
        [name]: value,
      };
      setIsButtonDisabled(
        nextData.id.trim() === "" || nextData.password === ""
      );
      return nextData;
    });
  };

  //자동로그인 버튼
  const handleAutoLogin = (e) => {
    if (!isAutoLoginClicked) {
      setIsAutoLoginClicked(true);
    } else setIsAutoLoginClicked(false);
  };
  const onClickButton = (e) => {
    //회원가입/아이디찾기 버튼
    if (e.target.className === "SignUp") {
      navigate("/signup");
    } else {
      navigate("/findid");
    }
  };
  return (
    <>
      <div className="box">
        <div className="loginSection">
          <Logo />
          <div className="loginForm">
            <form className="loginForm" onSubmit={handleSubmit}>
              <p></p>
              <input
                ref={idInputRef}
                className="inputForm"
                value={userInputData.id}
                type="text"
                name="id"
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
                inputMode="email"
                autoComplete="username"
              />
              <input
                ref={passwordInputRef}
                className="inputForm showPassword hidePassword"
                type={isPWHide ? "password" : "text"}
                name="password"
                onChange={handleChange}
                value={userInputData.password}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />
              {/* <button
                type="button"
                className="isPWHideButton hidePassword showPassword"
              ></button> */}
              <label className="isAutoLogin">
                <img
                  src={isAutoLoginClicked ? Clicked : unClicked}
                  alt="자동 로그인"
                  onClick={handleAutoLogin}
                  className="autoLogin"
                />
                자동로그인
              </label>
              <button
                type="submit"
                className={`clickLogin ${isButtonDisabled ? "disabled" : ""}`}
                disabled={isButtonDisabled}
              >
                로그인
              </button>
            </form>
          </div>
          <div className="buttonGroup">
            <button className="SignUp" onClick={onClickButton}>
              회원가입
            </button>
            <button className="FindId" onClick={onClickButton}>
              아이디 / 비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Login;
