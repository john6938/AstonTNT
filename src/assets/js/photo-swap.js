(function () {
  const img = document.getElementById('dynamicImage');
  if (!img) return;

  const photo  = img.src; // set from the initial src in the HTML
  const xray   = img.src.replace('JB_2025c.png', 'golden_xray.png');
  const xrayDisplayTime = 1000;   // ms to show the x-ray
  let   normalDisplayTime = 20000; // ms to show the normal photo (grows each cycle)

  function showXray() {
    img.src = xray;
    setTimeout(showNormal, xrayDisplayTime);
  }

  function showNormal() {
    img.src = photo;
    normalDisplayTime += 5000; // add 5 seconds each cycle
    setTimeout(showXray, normalDisplayTime);
  }

  setTimeout(showXray, normalDisplayTime);
})();
