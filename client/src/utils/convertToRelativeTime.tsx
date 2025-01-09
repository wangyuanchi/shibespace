import { formatDistanceToNow, parseISO } from "date-fns";

import { toZonedTime } from "date-fns-tz";

// Expects a timestamp that has a timezone
// Will work with TIMESTAMPTZ from PostgreSQL
const convertToRelativeTime = (timestamp: string): string => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateInLocalTime = toZonedTime(parseISO(timestamp), userTimeZone);
  const relativeTime = formatDistanceToNow(dateInLocalTime, {
    addSuffix: true,
  });
  return relativeTime;
};

export default convertToRelativeTime;
