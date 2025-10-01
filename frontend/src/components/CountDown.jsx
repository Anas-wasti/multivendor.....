import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../server";

const CountDown = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (deleted) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (Object.keys(newTimeLeft).length === 0 && !deleted) {
        axios
          .delete(`${server}/delete-shop-event/${data._id}`)
          .then(() => setDeleted(true))
          .catch((err) => console.error(err));
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data._id, data.Finish_Date, deleted]);

  function calculateTimeLeft() {
    const difference = +new Date(data.Finish_Date) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval]) return null;
    return (
      <span key={interval} className="text-[25px] text-[#475ad2]">
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });

  return (
    <div>
      {deleted ? (
        <span className="text-[red] text-[25px]">Event Deleted</span>
      ) : timerComponents.length ? (
        timerComponents
      ) : (
        <span className="text-[red] text-[25px]">Time's Up!</span>
      )}
    </div>
  );
};

export default CountDown;
