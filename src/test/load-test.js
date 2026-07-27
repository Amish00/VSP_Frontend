import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,      // 50 virtual users
  duration: "30s",
};

export default function () {
  const res = http.get(
    "https://res.cloudinary.com/dgdm5i184/video/upload/v1784275449/videos/videos/848f4de7-2831-458f-a8a1-51a35b349a28.mp4"
  );

  check(res, {
    "Status is 200": (r) => r.status === 200,
  });

  sleep(1);
}