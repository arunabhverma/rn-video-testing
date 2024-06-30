import moment from "moment";

export const formatDuration = (time: number) => {
  return moment.utc(time).format("m:ss");
};

export const calculateTimeDifference = (
  startMillis: number,
  endMillis: number
) => {
  const differenceInMillis = endMillis - startMillis;
  const isPositive = differenceInMillis >= 0;
  const absDifference = Math.abs(differenceInMillis);
  const formattedDifference = formatDuration(absDifference);

  return `${isPositive ? "+" : "-"}${formattedDifference}`;
};
