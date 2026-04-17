export interface ExtractedTheme {
  primary: string | null;
  background: string | null;
  foreground: string | null;
  fontFamily: string | null;
  borderRadius: string | null;
}

const UA =
  "Mozilla/5.0 (compatible; FeedbackIQ-ThemeBot/1.0; +https://feedbackiq.app)";
const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 2_000_000;
const MAX_CSS_BYTES = 1_500_000;
const MAX_STYLESHEETS = 4;

async function fetchWithTimeout(
  url: string,
  maxBytes: number
): Promise<string | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,text/css,*/*" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > maxBytes) return null;
    return new TextDecoder("utf-8", { fatal: false }).decode(buf);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function absolute(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function firstMatch(source: string, pattern: RegExp): string | null {
  const m = source.match(pattern);
  return m ? m[1].trim() : null;
}

function extractMetaThemeColor(html: string): string | null {
  return firstMatch(
    html,
    /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i
  );
}

function extractStylesheetHrefs(html: string, baseUrl: string): string[] {
  const hrefs: string[] = [];
  const re =
    /<link[^>]+rel=["'][^"']*stylesheet[^"']*["'][^>]*href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const abs = absolute(m[1], baseUrl);
    if (abs && /^https?:/.test(abs)) hrefs.push(abs);
    if (hrefs.length >= MAX_STYLESHEETS) break;
  }
  return hrefs;
}

function extractInlineStyles(html: string): string {
  const chunks: string[] = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    chunks.push(m[1]);
  }
  return chunks.join("\n");
}

function pickCssVar(css: string, names: string[]): string | null {
  for (const name of names) {
    const re = new RegExp(`--${name}\\s*:\\s*([^;}\\n]+)`, "i");
    const m = css.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function extractBodyFontFamily(css: string): string | null {
  const m = css.match(
    /(?:^|[{}\s])body\s*\{[^}]*?font-family\s*:\s*([^;}\n]+)/i
  );
  return m ? m[1].trim() : null;
}

function extractBodyBackground(css: string): string | null {
  const m = css.match(
    /(?:^|[{}\s])body\s*\{[^}]*?background(?:-color)?\s*:\s*([^;}\n]+)/i
  );
  return m ? m[1].trim() : null;
}

function extractBodyColor(css: string): string | null {
  const m = css.match(/(?:^|[{}\s])body\s*\{[^}]*?\bcolor\s*:\s*([^;}\n]+)/i);
  return m ? m[1].trim() : null;
}

function sanitize(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v || v.length > 200) return null;
  return v;
}

export async function extractTheme(url: string): Promise<ExtractedTheme> {
  const empty: ExtractedTheme = {
    primary: null,
    background: null,
    foreground: null,
    fontFamily: null,
    borderRadius: null,
  };

  const html = await fetchWithTimeout(url, MAX_HTML_BYTES);
  if (!html) return empty;

  const inline = extractInlineStyles(html);
  const hrefs = extractStylesheetHrefs(html, url);
  const externalCss = (
    await Promise.all(hrefs.map((h) => fetchWithTimeout(h, MAX_CSS_BYTES)))
  )
    .filter((c): c is string => !!c)
    .join("\n");

  const allCss = inline + "\n" + externalCss;

  const metaThemeColor = extractMetaThemeColor(html);

  const primary =
    pickCssVar(allCss, [
      "primary",
      "color-primary",
      "brand",
      "color-brand",
      "accent",
      "color-accent",
    ]) || metaThemeColor;

  const background =
    pickCssVar(allCss, [
      "background",
      "color-background",
      "bg",
      "color-bg",
      "surface",
    ]) || extractBodyBackground(allCss);

  const foreground =
    pickCssVar(allCss, [
      "foreground",
      "color-foreground",
      "text",
      "color-text",
    ]) || extractBodyColor(allCss);

  const fontFamily =
    pickCssVar(allCss, ["font-sans", "font-body", "font-family"]) ||
    extractBodyFontFamily(allCss);

  const borderRadius = pickCssVar(allCss, [
    "radius",
    "border-radius",
    "rounded",
  ]);

  return {
    primary: sanitize(primary),
    background: sanitize(background),
    foreground: sanitize(foreground),
    fontFamily: sanitize(fontFamily),
    borderRadius: sanitize(borderRadius),
  };
}
