/**
 * @fileoverview HTML テキスト埋め込み用のエスケープ。
 *
 * `&` `<` `>` `"` を実体参照にする。属性値と本文の両方で使う。
 */

/**
 * テキストを HTML へ安全に埋め込める文字列にする。
 *
 * @param text - エスケープ前の文字列
 * @returns 実体参照に置換した文字列
 */
export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
