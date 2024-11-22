import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import moment from "moment-timezone";

dayjs.extend(utc);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);

export const getLocalizedDateString = (timestamp, format = "YYYY-MM-DD HH:mm:ss z") => {
  return moment(timestamp).local().format(format);
};

export const getLocalizedDateObject = (timestamp) => {
  return moment(timestamp).local().toDate();
};

export const getDateStringInTimeZone = (timestamp, timeZone, format = "YYYY-MM-DD HH:mm:ss z") => {
  return moment(timestamp).tz(timeZone).format(format);
};

export const getDateObjectInTimeZone = (timestamp, timeZone) => {
  return moment.tz(timestamp, timeZone).toDate();
};

export const getDateMoment = (timestamp) => {
  let timeZone = "Europe/London";

  if (window.COOL_GLOBALS && !!window.COOL_GLOBALS?.USER && window.COOL_GLOBALS?.USER?.timeZone) {
    timeZone = window.COOL_GLOBALS?.USER?.timeZone;
  }

  return moment(timestamp).tz(timeZone).fromNow();
};

export const dateUtcTimeStamp = (dateObj) => {
  return moment(dateObj).utc().valueOf();
};

export const getDateStringByUserTimeZone = (timestamp, format) => {
  let defaultFormat = "DD/MM/YYYY";

  if (format) {
    defaultFormat = format;
  }

  let timeZone = "Europe/London";

  if (window.COOL_GLOBALS && !!window.COOL_GLOBALS?.USER && window.COOL_GLOBALS?.USER?.timeZone) {
    timeZone = window.COOL_GLOBALS?.USER?.timeZone;
  }

  if (!format && window.COOL_GLOBALS && window.COOL_GLOBALS?.TENANT && window.COOL_GLOBALS?.TENANT?.preferredDateFormat) {
    const preferred_format = window.COOL_GLOBALS.TENANT.preferredDateFormat;

    if (preferred_format === "default") {
      return moment(timestamp).tz(timeZone).fromNow();
    }

    if (preferred_format === "dateTime") {
      defaultFormat = "DD/MM/YYYY HH:mm";
    } else if (preferred_format === "dateTimeHr") {
      defaultFormat = "DD/MM/YYYY hh:mm a";
    } else if (preferred_format === "usdate") {
      defaultFormat = "MM/DD/YYYY";
    } else if (preferred_format === "usdateTime") {
      defaultFormat = "MM/DD/YYYY HH:mm";
    } else if (preferred_format === "usdateTimeHr") {
      defaultFormat = "MM/DD/YYYY hh:mm a";
    }
  }

  return moment(timestamp).tz(timeZone).format(defaultFormat);
};

export const dateRanges = {
  TODAY: {
    start: moment().utc().startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  YESTERDAY: {
    start: moment().utc().subtract(1, "day").startOf("day").valueOf(),
    end: moment().utc().subtract(1, "day").endOf("day").valueOf(),
  },
  THIS_WEEK: {
    start: moment().utc().startOf("week").valueOf(),
    end: moment().utc().endOf("week").valueOf(),
  },
  THIS_WEEK_SO_FAR: {
    start: moment().utc().startOf("week").valueOf(),
    end: moment().utc().valueOf(),
  },
  LAST_WEEK: {
    start: moment().utc().subtract(1, "week").startOf("week").valueOf(),
    end: moment().utc().subtract(1, "week").endOf("week").valueOf(),
  },
  THIS_MONTH: {
    start: moment().utc().startOf("month").valueOf(),
    end: moment().utc().endOf("month").valueOf(),
  },
  LAST_MONTH: {
    start: moment().utc().subtract(1, "month").startOf("month").valueOf(),
    end: moment().utc().subtract(1, "month").endOf("month").valueOf(),
  },
  THIS_QUARTER: {
    start: moment().utc().startOf("quarter").valueOf(),
    end: moment().utc().endOf("quarter").valueOf(),
  },
  LAST_QUARTER: {
    start: moment().utc().subtract(1, "quarter").startOf("quarter").valueOf(),
    end: moment().utc().subtract(1, "quarter").endOf("quarter").valueOf(),
  },
  THIS_YEAR: {
    start: moment().utc().startOf("year").valueOf(),
    end: moment().utc().endOf("year").valueOf(),
  },
  THIS_YEAR_SO_FAR: {
    start: moment().utc().startOf("year").valueOf(),
    end: moment().utc().valueOf(),
  },
  LAST_YEAR: {
    start: moment().utc().subtract(1, "year").startOf("year").valueOf(),
    end: moment().utc().subtract(1, "year").endOf("year").valueOf(),
  },
  LAST_7_DAYS: {
    start: moment().utc().subtract(7, "days").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_14_DAYS: {
    start: moment().utc().subtract(14, "days").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_30_DAYS: {
    start: moment().utc().subtract(30, "days").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_60_DAYS: {
    start: moment().utc().subtract(60, "days").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_90_DAYS: {
    start: moment().utc().subtract(90, "days").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_180_DAYS: {
    start: moment().utc().subtract(180, "days").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_365_DAYS: {
    start: moment().utc().subtract(365, "days").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_1_YEAR: {
    start: moment().utc().subtract(1, "year").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_2_YEAR: {
    start: moment().utc().subtract(2, "years").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
  LAST_3_YEAR: {
    start: moment().utc().subtract(3, "years").startOf("day").valueOf(),
    end: moment().utc().endOf("day").valueOf(),
  },
};

export const dateRangesList = [
  {
    label: "Today",
    value: [dayjs().utc().startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Yesterday",
    value: [dayjs().utc().subtract(1, "day").startOf("day"), dayjs().utc().subtract(1, "day").endOf("day")],
  },
  {
    label: "This Week",
    value: [dayjs().utc().startOf("week"), dayjs().utc().endOf("week")],
  },
  {
    label: "This Week So Far",
    value: [dayjs().utc().startOf("week"), dayjs().utc()],
  },
  {
    label: "Last Week",
    value: [dayjs().utc().subtract(1, "week").startOf("week"), dayjs().utc().subtract(1, "week").endOf("week")],
  },
  {
    label: "This Month",
    value: [dayjs().utc().startOf("month"), dayjs().utc().endOf("month")],
  },
  {
    label: "Last Month",
    value: [dayjs().utc().subtract(1, "month").startOf("month"), dayjs().utc().subtract(1, "month").endOf("month")],
  },
  {
    label: "This Quarter",
    value: [dayjs().utc().startOf("quarter"), dayjs().utc().endOf("quarter")],
  },
  {
    label: "Last Quarter",
    value: [dayjs().utc().subtract(1, "quarter").startOf("quarter"), dayjs().utc().subtract(1, "quarter").endOf("quarter")],
  },
  {
    label: "This Year",
    value: [dayjs().utc().startOf("year"), dayjs().utc().endOf("year")],
  },
  {
    label: "This Year So Far",
    value: [dayjs().utc().startOf("year"), dayjs().utc()],
  },
  {
    label: "Last Year",
    value: [dayjs().utc().subtract(1, "year").startOf("year"), dayjs().utc().subtract(1, "year").endOf("year")],
  },
  {
    label: "Last 7 Days",
    value: [dayjs().utc().subtract(6, "days").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 14 Days",
    value: [dayjs().utc().subtract(13, "days").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 30 Days",
    value: [dayjs().utc().subtract(29, "days").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 60 Days",
    value: [dayjs().utc().subtract(59, "days").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 90 Days",
    value: [dayjs().utc().subtract(89, "days").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 180 Days",
    value: [dayjs().utc().subtract(179, "days").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 365 Days",
    value: [dayjs().utc().subtract(364, "days").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 1 Year",
    value: [dayjs().utc().subtract(1, "year").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 2 Years",
    value: [dayjs().utc().subtract(2, "years").startOf("day"), dayjs().utc().endOf("day")],
  },
  {
    label: "Last 3 Years",
    value: [dayjs().utc().subtract(3, "years").startOf("day"), dayjs().utc().endOf("day")],
  },
];
