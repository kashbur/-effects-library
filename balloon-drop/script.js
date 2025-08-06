document.getElementById('dropBtn').addEventListener('click', dropBalloons);

function dropBalloons() {
  const container = document.getElementById("container");
  const images = ["img/19.png", "img/20.png", "img/21.png"]; // your balloon images

  for (let i = 0; i < 20; i++) {
    const balloon = document.createElement("img");
    balloon.src = images[Math.floor(Math.random() * images.length)];
    balloon.classList.add("balloon");

    const size = 80 + Math.random() * 40;
    balloon.style.width = size + "px";
    balloon.style.left = Math.random() * 100 + "%";
    balloon.style.setProperty("--rotate", (Math.random() * 60 - 30) + "deg");
    balloon.style.setProperty("--sway", (10 + Math.random() * 20) + "px");

    const delay = Math.random() * 2 * 0.8;
    const dropDuration = (2.5 + Math.random() * 2) * 0.8;
    const swayDuration = (2 + Math.random() * 2) * 0.8;

    balloon.style.animation =
      `balloonDrop ${dropDuration}s linear ${delay}s forwards, ` +
      `balloonSway ${swayDuration}s ease-in-out ${delay}s infinite`;

    container.appendChild(balloon);
    balloon.addEventListener("animationend", () => balloon.remove());
  }
}