"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { LoginButton } from "./login-button";
import { UserNav } from "./user-nav";

export function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return user ? <UserNav /> : <LoginButton />;
}
