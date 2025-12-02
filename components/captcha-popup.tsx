import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RefreshCwIcon } from "lucide-react";
import { getAuthToken, getCaptcha } from "@/lib/download/hoadon-api";
import { RainbowButton } from "./magicui/rainbow-button";

type CaptchaDialogProps = {
  open: boolean;
  onClose: () => void; // called when user closes manually
  credential: { username: string; password: string };
  onSuccess: (jwt: string) => void; // called when captcha + login succeed
};

export function CaptchaDialog({
  open,
  onClose,
  credential,
  onSuccess,
}: CaptchaDialogProps) {
  const [svg, setSvg] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrMsg] = useState("");

  const captchaKey = useRef("");

  const refreshCaptcha = useCallback(async () => {
    const { key, content } = await getCaptcha();
    captchaKey.current = key;
    setSvg(content);
  }, []);

  // When dialog opens, fetch new captcha and reset state
  useEffect(() => {
    if (!open) return;
    setValue("");
    setErrMsg("");
    refreshCaptcha();
  }, [open, refreshCaptcha]);

  async function handleLogin() {
    setLoading(true);
    const { token, error } = await getAuthToken(
      credential.username,
      credential.password,
      captchaKey.current,
      value,
    );
    setLoading(false);

    if (error) {
      setErrMsg(error);
      return;
    }

    onSuccess(token);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập captcha đăng nhập</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-500">{errorMsg}</p>
          <div className="flex items-center gap-4">
            <div
              aria-label="captcha"
              className="bg-white"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <RefreshCwIcon
              onClick={refreshCaptcha}
              className="cursor-pointer"
            />
          </div>
          <Input
            placeholder="Mã captcha"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <RainbowButton
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            Xác nhận
            {loading && (
              <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            )}
          </RainbowButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
