//サイトを見てる人がログインしている本人かどうかの確認。

//  headers().get("cookie")等を読む。headersは補足情報のこと。
import { headers } from "next/headers";
import { auth } from "@/features/auth/server";

// ホテルのカウンターで例えると

// async機能により、awaitの処理が終わったら動く
export async function getAuthSession() {
  // お客さんの身分証を受け取る。
  const requestHeaders = await headers();

  // 警備システムに身分証は本物？と確認。
  return auth.api.getSession({
    // ROM専であるNext.jsのheaders()を、Web標準のnew Headers()に変換する。
    headers: new Headers(requestHeaders),
  });
}
