export const EXTERNAL_LINK_TARGET = "_blank";
export const EXTERNAL_LINK_REL = "noopener noreferrer";

export function isHttpUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

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
