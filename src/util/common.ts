import { webhookRegex } from "./constants";

// Rework to use URL struct instead: ~.host, ~.path, ~.searchParams.get(*)
export function formatURL(url: URL | string, pattern: RegExp = webhookRegex): string[] {
  pattern = new RegExp(pattern);
  if (url instanceof URL) url = url.toString();
  if (pattern.test(url)) throw new Error('Invalid url pattern');

  const result: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(url)) !== null) {
    if (match.index === pattern.lastIndex) pattern.lastIndex++;
    match.forEach((match, index) => {
      if (index > 0) result.push(match);
    });
  }

  return result;
}



