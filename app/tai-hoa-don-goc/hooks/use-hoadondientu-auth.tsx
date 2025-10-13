import { CaptchaDialog } from "@/components/captcha-popup";
import { fetchProfile } from "@/lib/download/hoadon-api";
import { useState } from "react";

export function useHoadonDientuAuth() {
  const [openCaptcha, setOpenCaptcha] = useState(false);
  const [credential, setCredential] = useState<{
    username: string;
    password: string;
  }>();

  async function login(username: string, password: string) {
    let currentJwt = localStorage.getItem(`jwt_${username}`);
    if (currentJwt) {
      try {
        await fetchProfile(currentJwt);
      } catch (e) {
        setCredential({ username, password });
        setOpenCaptcha(true);
      }
      return;
    }

    setOpenCaptcha(true);
  }

  function renderCaptchaDialog() {
    if (!credential) return null;

    return (
      <CaptchaDialog
        open={openCaptcha}
        credential={credential}
        onClose={() => setOpenCaptcha(false)}
        onSuccess={(jwt) => {
          localStorage.setItem(`jwt_${credential?.username}`, jwt);
          setOpenCaptcha(false);
        }}
      />
    );
  }

  function getJwt(username: string, password: string) {
    return localStorage.getItem(`jwt_${username}`);
  }

  return {
    login,
    renderCaptchaDialog,
    getJwt,
  };
}
