import { useState, useRef, useCallback } from "react";

export default function useModalToggle(initial = false, lockTime = 700) {
  const [visible, setVisible] = useState(initial);
  const isLocked = useRef(false);

  const open = useCallback(() => {
    if (isLocked.current) return;
    isLocked.current = true;
    setVisible(true);
    setTimeout(() => {
      isLocked.current = false;
    }, lockTime);
  }, [lockTime]);

  const close = useCallback(() => setVisible(false), []);

  const toggle = useCallback(() => {
    if (visible) close();
    else open();
  }, [visible, open, close]);

  return { visible, open, close, toggle };
}