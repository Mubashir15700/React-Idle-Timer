import React, { useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";

const App = () => {
  const [remaining, setRemaining] = useState(0);
  const [lastIdleDuration, setLastIdleDuration] = useState(0);
  const [activeDuration, setActiveDuration] = useState(0);

  const idleStartTime = useRef(null);

  const onIdle = () => {
    console.log("User is idle");
    idleStartTime.current = Date.now(); // start idle timer
  };

  const onActive = () => {
    if (idleStartTime.current) {
      const idleTime = Math.round((Date.now() - idleStartTime.current) / 1000);
      setLastIdleDuration((prevIdleTime) => prevIdleTime + idleTime);
      console.log(`User was idle for ${idleTime} seconds`);
      idleStartTime.current = null;
    }
  };

  const onAction = (event) => {
    console.log(`User did ${event.type} — timer reset`);
  };

  const { getRemainingTime, isIdle } = useIdleTimer({
    timeout: 1000 * 30,
    onIdle,
    onActive,
    onAction,
    debounce: 500,
    events: [
      // "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isIdle()) {
        setActiveDuration((prev) => prev + 1);
      }

      setRemaining(Math.round(getRemainingTime() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime]);

  return (
    <div>
      <h1>React Idle Timer Example</h1>
      <p>You will be logged out after 30 seconds of inactivity.</p>
      <p style={{ color: isIdle() ? "red" : "green" }}>
        -----------------------------------------------------------------
      </p>
      <p>Remaining time to logout: {remaining} seconds</p>
      <p>Last idle duration: {lastIdleDuration} seconds</p>
      <p>Current active duration: {activeDuration} seconds</p>
    </div>
  );
};

export default App;
