var backgroundImageLoaded = false;
var statusImageLoaded = false;

function doneLoading()
{
  if (backgroundImageLoaded && statusImageLoaded)
  {
    var centerDIVElement = document.getElementById('centerDIV');
    centerDIVElement.style.visibility = "visible";
  }
}
