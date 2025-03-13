import { Rubik } from "./rubik";

const rubik = Rubik();

window.addEventListener("resize", rubik.resize);
document.addEventListener("keyup", (e) => {
  if (e.code == "Escape") rubik.resetView();
});
window.addEventListener("mousedown", rubik.onMouseDown);
window.addEventListener("mousemove", rubik.onMouseMove);
window.addEventListener("mouseup", rubik.resetValues);
window.addEventListener("touchstart", rubik.onMouseDown);
window.addEventListener("touchmove", rubik.onMouseMove);
window.addEventListener("touchend", resetValues);
