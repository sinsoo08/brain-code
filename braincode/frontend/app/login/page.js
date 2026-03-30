"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "../login.css";
import { login } from "../../apis/auth";

export default function LoginPage() {
  const router = useRouter();
  const hideTimerRef = useRef(null);
  const navigateTimerRef = useRef(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [alertState, setAlertState] = useState({
    visible: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, []);

  const showAlert = (message, type = "error") => {
    setAlertState({
      visible: true,
      message,
      type,
    });

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setAlertState((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    const email = form.email.trim();
    const password = form.password;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      showAlert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    if (!emailPattern.test(email)) {
      showAlert("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    try {
      await login({ email, password });
      showAlert("로그인되었습니다.", "success");

      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
      navigateTimerRef.current = setTimeout(() => {
        router.push("/game");
      }, 1000);
    } catch (err) {
      showAlert(err?.message || "서버에 연결할 수 없습니다. 백엔드 서버를 확인해 주세요.");
    }
  };

  return (
    <div className="login-page">
      <nav className="navbar">
        <Link href="/" className="nav-left">
          <img src="/img/brain-blue.png" className="brain-logo" alt="브레인 코드 로고" />
          <span className="logo-text">브레인 코드</span>
        </Link>
        <ul className="menu">
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>
            <Link href="/signup">회원가입</Link>
          </li>
        </ul>
      </nav>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="logo-wrap">
              <img src="/img/brain-blue.png" alt="브레인 코드 로고" />
            </div>
            <h1>로그인</h1>
            <p>브레인 코드에 다시 오신 것을 환영해요.</p>
          </div>

          <div className="field">
            <label htmlFor="emailInput">이메일</label>
            <div className="input-wrap">
              <input
                type="email"
                id="emailInput"
                name="email"
                value={form.email}
                placeholder="example@email.com"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="passwordInput">비밀번호</label>
            <div className="input-wrap">
              <input
                type="password"
                id="passwordInput"
                name="password"
                value={form.password}
                placeholder="비밀번호를 입력해 주세요"
                onChange={handleChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleLogin();
                }}
              />
            </div>
          </div>

          <button className="login-btn" type="button" onClick={handleLogin}>
            로그인
          </button>

          <div className="signup-link">
            계정이 없으신가요? <Link href="/signup">회원가입</Link>
          </div>
        </div>
      </div>

      <div id="alert-box" className={`${alertState.type} ${alertState.visible ? "show" : ""}`.trim()}>
        {alertState.message}
      </div>
    </div>
  );
}
