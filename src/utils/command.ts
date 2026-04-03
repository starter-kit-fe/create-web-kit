export function splitCommand(command: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let activeQuote: "\"" | "'" | null = null;
  let escaping = false;

  for (const char of command) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      if (activeQuote === "'") {
        current += char;
      } else {
        escaping = true;
      }
      continue;
    }

    if (activeQuote) {
      if (char === activeQuote) {
        activeQuote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      activeQuote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (escaping) {
    current += "\\";
  }

  if (activeQuote) {
    throw new Error(`Unterminated quote in command: ${command}`);
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}
