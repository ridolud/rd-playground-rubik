import { Rubik } from "./rubik";

const rubik = Rubik();

window.addEventListener("resize", rubik.resize);
document.addEventListener("keyup", (e) => {
  if (e.ctrlKey && e.code === "KeyZ") rubik.onUndoMove();
  if (e.code == "KeyS") rubik.onScrambling();
  if (e.code == "KeyF") rubik.onToggleFacesHelper();
  if (e.code == "Escape") rubik.resetView();
});
window.addEventListener("mousedown", rubik.onMouseDown);
window.addEventListener("mousemove", rubik.onMouseMove);
window.addEventListener("mouseup", rubik.resetValues);
window.addEventListener("touchstart", rubik.onMouseDown);
window.addEventListener("touchmove", rubik.onMouseMove);
window.addEventListener("touchend", rubik.resetValues);
rubik.onMoveFinishListener((history) => {
  const historyElement = document.getElementsByClassName("items")[0];
  while (historyElement.firstChild) {
    historyElement.removeChild(historyElement.firstChild);
  }
  if (historyElement) {
    history.forEach((item) => {
      const moveElement = document.createElement("li");
      moveElement.textContent = item;
      historyElement.appendChild(moveElement);
    });
  }
});
