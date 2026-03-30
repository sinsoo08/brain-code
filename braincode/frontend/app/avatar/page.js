"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import "../avatar.css";
import { saveKidInfo } from "../../apis/kids";

const AVATARS = [
  { src: "/img/dog.png", name: "강아지", emoji: "🐶" },
  { src: "/img/cat.png", name: "고양이", emoji: "🐱" },
  { src: "/img/axolotl.png", name: "아홀로틀", emoji: "🦎" },
  { src: "/img/raccoon.png", name: "너구리", emoji: "🦝" },
  { src: "/img/bear.png", name: "곰", emoji: "🐻" },
];

export default function AvatarPage() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [imageFallbacks, setImageFallbacks] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setErrorMessage("");
  };

  const handleImageError = (name) => {
    setImageFallbacks((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedAvatar) {
      setErrorMessage("캐릭터를 선택해 주세요.");
      return;
    }

    const kidName = sessionStorage.getItem("kidName");
    const kidBirthYear = sessionStorage.getItem("kidBirthYear");
    const kidBirthDate = sessionStorage.getItem("kidBirthDate");

    try {
      await saveKidInfo({
        name: kidName,
        birthYear: kidBirthYear,
        birthDate: kidBirthDate,
        avatar: selectedAvatar.src,
      });
    } catch (err) {
      setErrorMessage(err?.message || "서버에 연결할 수 없습니다. 백엔드 서버를 확인해 주세요.");
      return;
    }

    sessionStorage.setItem("selectedAvatar", selectedAvatar.src);
    sessionStorage.setItem("selectedAvatarName", selectedAvatar.name);
    router.push("/game");
  };

  return (
    <div className="avatar-page">
      <div className="form-card">
        <div className="card-header">
          <button
            type="button"
            onClick={() => router.push("/kid")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "14px", color: "white", padding: "0 0 8px 0",
              display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            ← 아이 정보 입력으로
          </button>
          <h2>아바타 선택</h2>
          <p>나를 대표할 캐릭터를 골라 보세요.</p>
        </div>

        <div className="preview-section">
          <div className={`preview-wrap ${selectedAvatar ? "has-selection" : ""}`}>
            {!selectedAvatar ? (
              <div className="preview-placeholder">
                <span className="preview-icon">✨</span>
                <span className="preview-hint">캐릭터를 선택해 주세요</span>
              </div>
            ) : imageFallbacks[selectedAvatar.name] ? (
              <div className="preview-selected">
                <span className="preview-emoji">{selectedAvatar.emoji}</span>
              </div>
            ) : (
              <div className="preview-selected">
                <img src={selectedAvatar.src} alt={selectedAvatar.name} />
              </div>
            )}
          </div>
          <p className="preview-name">{selectedAvatar ? selectedAvatar.name : "\u00A0"}</p>
        </div>

        <div className="form-section">
          <div className="section-label">
            <div className="icon">🎨</div>
            캐릭터 선택
          </div>
        </div>

        <div className="avatar-section">
          <div className="avatar-grid">
            {AVATARS.map((avatar) => {
              const useEmoji = imageFallbacks[avatar.name];

              return (
                <button
                  key={avatar.name}
                  className={`avatar-item ${selectedAvatar?.name === avatar.name ? "selected" : ""}`}
                  type="button"
                  onClick={() => handleSelect(avatar)}
                >
                  <div className="avatar-img-wrap">
                    {useEmoji ? (
                      <span className="avatar-emoji">{avatar.emoji}</span>
                    ) : (
                      <img
                        src={avatar.src}
                        alt={avatar.name}
                        onError={() => handleImageError(avatar.name)}
                      />
                    )}
                  </div>
                  <span className="avatar-name">{avatar.name}</span>
                </button>
              );
            })}
          </div>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        </div>

        <div className="form-footer">
          <button className="submit-btn" type="button" onClick={handleSubmit}>
            이 캐릭터로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
