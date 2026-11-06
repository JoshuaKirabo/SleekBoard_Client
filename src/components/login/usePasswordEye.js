import { useLayoutEffect, useRef, useState } from "react";

// Whether a password field shows what was typed, and the eye's toggle for it. Takes the field itself, so it can put the
// caret back where you left off: Chrome sends it to the start when a field switches between hidden and shown.
export default function usePasswordEye(field)
  {
    const [shown, setShown] = useState(false);
    // Where the caret was when the eye was pressed.
    const caret = useRef(null);

    const toggle = () =>
      {
        caret.current = [field.current.selectionStart, field.current.selectionEnd];
        setShown((now) => !now);
      };

    // Puts the caret back once the field has switched. Chrome then moves it to the start a few milliseconds later, as it
    // takes another look at the field, so it's put back once more just after that, well before anyone can type.
    useLayoutEffect(() =>
      {
        const spot = caret.current;
        if(!spot) return;
        caret.current = null;
        const putBack = () => field.current.setSelectionRange(...spot);
        putBack();
        const timer = setTimeout(putBack, 60);
        return () => clearTimeout(timer);
      }, [shown, field]);

    return [shown, toggle];
  }
