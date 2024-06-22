import moment from "moment";

export const formatDuration = (time: number) => {
  return moment.utc(time).format("mm:ss");
};
