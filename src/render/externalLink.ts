/**
 * @fileoverview 外部 http(s) リンクに付ける target / rel の判定。
 *
 * http(s) 以外の href には属性を付けない。
 */

/** 外部リンクを新しいタブで開くときの target。 */
export const EXTERNAL_LINK_TARGET = "_blank";
/** 外部リンクのタブ閉じ対策用 rel。 */
export const EXTERNAL_LINK_REL = "noopener noreferrer";

/**
 * href が http または https で始まるか。
 *
 * @param href - a の href または URL 文字列
 */
export function isHttpUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

/**
 * 外部リンク向けの target / rel。http(s) でなければ `undefined`。
 *
 * @param href - a の href
 */
export function externalLinkAttributes(
  href: string,
):
  | { target: typeof EXTERNAL_LINK_TARGET; rel: typeof EXTERNAL_LINK_REL }
  | undefined {
  if (!isHttpUrl(href)) {
    return undefined;
  }
  return { target: EXTERNAL_LINK_TARGET, rel: EXTERNAL_LINK_REL };
}
