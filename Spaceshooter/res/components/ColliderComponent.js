////////////////////////////////////////////////////////////////////////////////
// Filename: ColliderComponent.js
// Date: 2-4-2013
// Author(s): Dane Curbow
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

TomatoJS.ColliderComponent = function()
{
  //the x and y extent are the values to go along the x and y of the object when
  //its rotation is 0 to determine collision
  this.mXExtent;
  this.mYExtent;
  this.mIsProjectile;
}

TomatoJS.ColliderComponent.prototype.Initialize = function()
{

}

TomatoJS.ColliderComponent.prototype.PostInitialize = function()
{

}

TomatoJS.ColliderComponent.prototype.Uninitialize = function()
{
  if(this.mIsProjectile)
    TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

//the point should be an array of size 2 with [0] being x and [1] being y
TomatoJS.ColliderComponent.prototype.CheckCollision = function(point)
{
  //First we are going to get the cos and sin of the rotated rectangle,
  //then we are going to unrotate the point relative to the rectange
  //followed by treating the rectangle as if it too is not rotated and
  //checking for the collision
  var angle = this.parent.GetComponent("Renderable").rotation;
  var cos = Math.cos(angle*Math.PI/180);
  var sin = Math.sin(angle*Math.PI/180);
  //rotate the position
  var pointX = this.parent.x + cos * (point[0] - this.parent.x) - sin * (point[1] - this.parent.y);
  var pointY = this.parent.y + sin * (point[0] - this.parent.x) + cos * (point[1] - this.parent.y);
  //get the min and max
  var minX = this.parent.x - this.mXExtent;
  var minY = this.parent.y - this.mYExtent;
  var maxX = this.parent.x + this.mXExtent;
  var maxY = this.parent.y + this.mYExtent;
  //check if the point is within the collision
  if( minX < pointX && maxX > pointX )
    if( minY < pointY && maxY > pointY )
      return true;
  return false;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));