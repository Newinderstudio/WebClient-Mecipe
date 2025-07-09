import "dayjs/locale/ko";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type DayjsArguType = Parameters<typeof dayjs>;
const dayjsWithTimezone = (...args: DayjsArguType) => dayjs(...args).tz('Asia/Seoul');

const GetSeoulTime = ({
  time,
}: {
  time: string | Date;
  long?: boolean;
}) => {
  if (typeof time !== 'string') {
    time = time.toString();
  }
  return (
    <div >
      <p >{dayjsWithTimezone().month() + 1}월</p>
      <p >{dayjsWithTimezone().date()}일</p>
    </div>
  );
};

export default GetSeoulTime;
