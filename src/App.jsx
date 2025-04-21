import React, { useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import styles from "./app.module.css";

const App = () => {
  const timeout = 1000 * 30; // 30 seconds
  const promptBeforeIdle = 1000 * 10; // show prompt 10 seconds before idle

  const [remaining, setRemaining] = useState(0);
  const [lastIdleDuration, setLastIdleDuration] = useState(0);
  const [activeDuration, setActiveDuration] = useState(0);
  const [isUserIdle, setIsUserIdle] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const idleStartTime = useRef(null);

  const onIdle = () => {
    console.log("User is idle");
    idleStartTime.current = Date.now(); // start idle timer
  };

  const onActive = () => {
    if (idleStartTime.current) {
      const idleTime = Math.round((Date.now() - idleStartTime.current) / 1000);
      // setLastIdleDuration((prevIdleTime) => prevIdleTime + idleTime);
      console.log(`User was idle for ${idleTime} seconds`);
      idleStartTime.current = null;
    }
  };

  const onAction = (event) => {
    console.log(`User did ${event.type} — timer reset`);
    setShowPrompt(false);
  };

  const onPrompt = () => {
    console.log("Prompting user to stay active");
    setShowPrompt(true);
  };

  const handleStillHere = () => {
    console.log("User clicked 'I'm still here'");
    activate();
  };

  const { getRemainingTime, isIdle, activate } = useIdleTimer({
    timeout,
    promptBeforeIdle,
    onPrompt,
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
    crossTab: true, // Optional if using multiple tabs
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isIdle()) {
        setIsUserIdle(false);
        setActiveDuration((prev) => prev + 1);
      } else {
        setShowPrompt(false);
        setIsUserIdle(true);
        setLastIdleDuration((prev) => prev + 1);
      }

      setRemaining(Math.round(getRemainingTime() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>React Idle Timer Example</h1>
      <p className={styles.description}>
        You will be logged out after 30 seconds of inactivity.
      </p>
      <p
        className={styles.status}
        style={{
          color: isUserIdle ? "red" : "green",
        }}
      >
        {isUserIdle ? "🛑 You are idle" : "✅ You are active"}
      </p>
      <div className={styles.timer}>
        <p>
          <strong>Remaining time to idle:</strong> {remaining} seconds
        </p>
        <p>
          <strong>Total idle duration:</strong> {lastIdleDuration} seconds
        </p>
        <p>
          <strong>Total active duration:</strong> {activeDuration} seconds
        </p>
      </div>
      {showPrompt && (
        <>
          <p className={styles.prompt}>⚠️ You are about to become idle! </p>
          <button className={styles.button} onClick={handleStillHere}>
            Im still here
          </button>
        </>
      )}
    </div>
  );
};

export default App;
