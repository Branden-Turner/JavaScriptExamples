////////////////////////////////////////////////////////////////////////////////
// Filename: CameraComponent.js
// Date: 3-19-2013
// Author(s): Dane Curbow
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{
  
TomatoJS.CameraComponent = function()
{
  this.mInterpolationSpeed = 0.75;
  this.mCamera;
  this.mWidth;
  this.mHeight;
}

TomatoJS.CameraComponent.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
  
  this.mCamera = TomatoJS.Core.GetSystem("Graphics").camera;

  this.mHalfWidth = TomatoJS.Core.configData["canvasSize"][0]/2; 
  this.mHalfHeight = TomatoJS.Core.configData["canvasSize"][1]/2;

  this.mCurPos = [this.parent.x, this.parent.y]; //index 0 for x, 1 for y
  this.mCamera.x = this.mCurPos[0] - this.mHalfWidth;
  this.mCamera.y = this.mCurPos[1] - this.mHalfHeight;
}

TomatoJS.CameraComponent.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.CameraComponent.prototype.OnFrameBegin = function(dt)
{
  //we want the camera to follow the player controlled ship so we are going
  //to have the camera interpolate towards the ships current position. DONE!
  var parentPos = [this.parent.x, this.parent.y];
  var newPosX = this.mCurPos[0] + (( parentPos[0] - this.mCurPos[0] ) * this.mInterpolationSpeed * dt );
  var newPosY = this.mCurPos[1] + (( parentPos[1] - this.mCurPos[1] ) * this.mInterpolationSpeed * dt );

  this.mCurPos[0] = newPosX;
  this.mCurPos[1] = newPosY;
  this.mCamera.x = newPosX - this.mHalfWidth;
  this.mCamera.y = newPosY - this.mHalfHeight;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));