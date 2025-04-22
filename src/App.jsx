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
    if (showPrompt) {
      activate();
      localStorage.setItem("showPrompt", false);
      setShowPrompt(false);
    }
  };

  const onPrompt = () => {
    console.log("Prompting user to stay active");
    localStorage.setItem("showPrompt", true);
    setShowPrompt(true);
  };

  // const handleStillHere = () => {
  //   console.log("User clicked 'I'm still here'");
  //   activate();
  // };

  const {
    getRemainingTime,
    isIdle,
    activate,
    getTabId,
    isLeader,
    isLastActiveTab,
  } = useIdleTimer({
    timeout,
    promptBeforeIdle,
    onPrompt,
    onIdle,
    onActive,
    onAction,
    debounce: 500,
    events: [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ],
    crossTab: true, // Optional if using multiple tabs
    leaderElection: true,
    syncTimers: 200,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.round(getRemainingTime() / 1000);
      setRemaining(remaining);

      const idle = isIdle();
      setIsUserIdle(idle);

      if (isLeader()) localStorage.setItem("remainingTime", remaining);

      if (!idle) {
        setActiveDuration((prev) => {
          const updated = prev + 1;
          if (isLeader()) localStorage.setItem("activeDuration", updated);
          return updated;
        });
      } else {
        setShowPrompt(false);
        localStorage.setItem("showPrompt", false);
        setLastIdleDuration((prev) => {
          const updated = prev + 1;
          if (isLeader()) localStorage.setItem("lastIdleDuration", updated);
          return updated;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime, isIdle, isLeader]);

  useEffect(() => {
    const syncDurations = (event) => {
      if (event.key === "activeDuration") {
        setActiveDuration(Number(event.newValue));
      }
      if (event.key === "lastIdleDuration") {
        setLastIdleDuration(Number(event.newValue));
      }
      if (event.key === "remainingTime") {
        setRemaining(Number(event.newValue));
      }
      if (event.key === "showPrompt") {
        setShowPrompt(event.newValue === "true");
      }
    };

    window.addEventListener("storage", syncDurations);
    return () => window.removeEventListener("storage", syncDurations);
  }, []);

  useEffect(() => {
    if (isLeader()) {
      console.log("I am the leader. I will handle API calls.");
    }
  }, [isLeader]);

  const tabId = getTabId() === null ? "loading" : getTabId().toString();
  const lastActiveTab =
    isLastActiveTab() === null ? "loading" : isLastActiveTab().toString();
  const leader = isLeader() === null ? "loading" : isLeader().toString();

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
        <p className={styles.remaining}>
          <strong>Remaining time to idle:</strong> {remaining} seconds
        </p>
        <p>
          <strong>Total idle duration:</strong> {lastIdleDuration} seconds
        </p>
        <p>
          <strong>Total active duration:</strong> {activeDuration} seconds
        </p>
        <p>
          -----------------------------------------------------------------------------------------------------------
        </p>
        <div>
          <p>Tab ID: {tabId}</p>
          <p>Last Active Tab: {lastActiveTab}</p>
          <p>Is Leader Tab: {leader}</p>
        </div>
      </div>
      {showPrompt && (
        <>
          <p className={styles.prompt}>⚠️ You are about to become idle! </p>
          {/* <button className={styles.button} onClick={handleStillHere}>
            I'm still here
          </button> */}
        </>
      )}
    </div>
  );
};

export default App;
