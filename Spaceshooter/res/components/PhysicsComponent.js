////////////////////////////////////////////////////////////////////////////////
// Filename: PhysicsComponent.js
// Date: 1-22-2013
// Author(s): Dane Curbow
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

TomatoJS.PhysicsComponent = function()
{
  this.mAcceleration = [0,0];
  this.mVelocity = [0,0];
}

TomatoJS.PhysicsComponent.prototype.Initialize = function()
{
  
}

TomatoJS.PhysicsComponent.prototype.Uninitialize = function()
{
  
}
  
TomatoJS.PhysicsComponent.prototype.Integrate = function(dt)
{
  //velocity update
  var velUpdate = TomatoJS.Vec2Scale(this.mAcceleration, dt);
  this.mVelocity[0] += velUpdate[0];
  this.mVelocity[1] += velUpdate[1];

  //then position update
  var pos = [this.parent.x, this.parent.y];
  var posUpdate = TomatoJS.Vec2Scale(this.mVelocity, dt);
  pos[0] += posUpdate[0];
  pos[1] += posUpdate[1];

  //update the actual objects positions
  this.parent.x = pos[0];
  this.parent.y = pos[1];
} 

TomatoJS.PhysicsComponent.prototype.SetVelocity = function(velocity)
{
  this.mVelocity = velocity;
}

TomatoJS.PhysicsComponent.prototype.GetVelocity = function()
{
  return this.mVelocity;
}

TomatoJS.PhysicsComponent.prototype.SetAcceleration = function(acceleration)
{
  this.mAcceleration = acceleration;
}

TomatoJS.PhysicsComponent.prototype.GetAcceleration = function()
{
  return this.mAcceleration;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));