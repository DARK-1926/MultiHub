export interface UserHandles {
  codeforces: string;
  leetcode: string;
  codechef: string[];
  gfg: string;
  github: string;
}

export const DEFAULT_HANDLES: UserHandles = {
  codeforces: process.env.NEXT_PUBLIC_CF_HANDLE || "",
  leetcode: process.env.NEXT_PUBLIC_LC_HANDLE || "",
  codechef: (process.env.NEXT_PUBLIC_CC_HANDLES || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  gfg: process.env.NEXT_PUBLIC_GFG_HANDLE || "",
  github: process.env.NEXT_PUBLIC_GITHUB_HANDLE || "",
};
