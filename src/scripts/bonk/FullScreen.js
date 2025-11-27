(() => {
    let expandbutton = document.createElement("button");
expandbutton.innerHTML = "Fullscreen";
document.body.appendChild(expandbutton);
expandbutton.id = "expandbutton";
expandbutton.style.position = "fixed";
expandbutton.style.top = 370;
expandbutton.style.left = 10;

expandbutton.onclick = function () {
  let EXPAND = document.getElementById("bonkiocontainer");

  EXPAND.style.height = "100%";
  EXPAND.style.width = EXPAND.clientHeight * 1.46;
};

let ad3 = document.getElementById("bonk_d_1");
ad3.remove();

let ad4 = document.getElementById("bonk_d_2");
ad4.remove();

document.getElementById("adboxverticalleftCurse").onclick = function () {
  let ad1 = document.getElementById("adboxverticalleftCurse");
  ad1.remove();
};

})