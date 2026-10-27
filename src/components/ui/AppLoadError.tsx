"use client";
import { logout } from "@/store/account";
import { Button } from "./Button";

/** Shown instead of an app when the account or its data could not be loaded. */
export function AppLoadError({ message }: { message: string }) {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="grid max-w-[420px] gap-4 text-center">
        <h1 className="text-xl font-semibold text-ink">Aplikasi belum bisa dibuka</h1>
        <p className="text-[16px] leading-relaxed text-body">{message}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Coba lagi</Button>
          <Button variant="soft" onClick={() => void logout()}>Keluar dan masuk lagi</Button>
        </div>
      </div>
    </div>
  );
}
