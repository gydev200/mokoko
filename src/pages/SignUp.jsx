import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../component/Logo";
import "./SignUp.css";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { authService, dbService } from "../../firebase.js";
import { doc, setDoc } from "firebase/firestore";

const SignUp = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  // const [id, setId] = useState("");
  // const [password, setPassword] = useState("");
  const [formState, setformState] = useState({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const handleInput = (e) => {
    const { name, value } = e.target;
    setformState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    const { nickname, password, passwordConfirm } = formState;
    const email = formState.email.trim();

    if (nickname.trim() === "") {
      alert("닉네임을 입력해주세요.");
      return;
    }
    if (email === "") {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다. 다시 입력해주세요.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        authService,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: nickname.trim() });

      await setDoc(doc(dbService, "User", user.uid), {
        nickName: nickname.trim(),
        email: email,
        grade: "🌱소중한 자모",
        profileImg: "",
        visitCount: 0,
        postNumber: 0,
        commentNumber: 0,
      });

      alert("🌱 가입이 완료되었습니다. 자라나는 모코코에 오신 것을 환영합니다");
      navigate("/");
    } catch (error) {
      let nextErrorMsg = "회원가입에 실패했습니다. 다시 시도해주세요.";
      switch (error.code) {
        case "auth/weak-password":
          nextErrorMsg = "비밀번호가 너무 짧습니다. 6자리 이상으로 설정해주세요.";
          break;
        case "auth/invalid-email":
          nextErrorMsg = "잘못된 이메일 주소입니다. 다시 입력해주세요.";
          break;
        case "auth/email-already-in-use":
          nextErrorMsg = "이미 가입되어 있는 계정입니다";
          break;
      }
      setErrorMsg(nextErrorMsg);
      alert(nextErrorMsg);
    }

    //파이어베이스 인증작업
  };
  return (
    <div className="signUp">
      <div className="formContainer">
        <Logo />
        <p></p>
        <form onSubmit={handleRegister}>
          <input
            className="signupForm"
            type="text"
            name="nickname"
            placeholder="닉네임 (자모에서 사용하는 닉네임)"
            onChange={handleInput}
          />
          <input
            className="signupForm"
            type="text"
            name="email"
            placeholder="이메일(비밀번호 재설정용)"
            autoComplete="username"
            onChange={handleInput}
          />
          <input
            className="signupForm"
            type="password"
            name="password"
            placeholder="비밀번호"
            autoComplete="new-password"
            onChange={handleInput}
          />
          <input
            className="signupForm"
            type="password"
            name="passwordConfirm"
            placeholder="비밀번호 확인"
            autoComplete="new-password"
            onChange={handleInput}
          />
          <button className="signupButton" type="submit">
            가입하기
          </button>
        </form>
        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
};
export default SignUp;
