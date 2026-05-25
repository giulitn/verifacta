import React from "react";

/**
 * Wrap likely-numeric expressions in an answer string with React nodes so
 * the chat can render them with emphasis (bold + accent colour).
 *
 * The regex deliberately stays conservative: a currency-prefixed number,
 * a thousands-separated integer, a decimal, or a percentage. We are not
 * trying to parse natural language; false negatives (e.g. "twenty
 * thousand") are fine, false positives (highlighting a year as a "key
 * stat") would dilute the signal.
 */
const NUMBER_PATTERN =
  /(\$\s?[\d.,]+(?:\.\d+)?|[\d]{1,3}(?:[.,]\d{3})+(?:\.\d+)?|[\d]+\.\d+|\d+\s?%)/g;

export function highlightNumbers(text: string): React.ReactNode[] {
  const parts = text.split(NUMBER_PATTERN);
  return parts.map((part, index) => {
    if (NUMBER_PATTERN.test(part)) {
      // Reset the lastIndex stateful regex between calls.
      NUMBER_PATTERN.lastIndex = 0;
      return React.createElement(
        "strong",
        {
          key: index,
          className: "font-semibold text-emerald-700",
        },
        part,
      );
    }
    NUMBER_PATTERN.lastIndex = 0;
    return part;
  });
}
