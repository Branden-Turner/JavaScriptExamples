////////////////////////////////////////////////////////////////////////////////
// Filename: PlayerController.js
// Date: 1-22-2013
// Author(s): Dane Curbow
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

//constructor
TomatoJS.PlayerController = function()
{

}

TomatoJS.PlayerController.prototype.Die = function() 
{
  TomatoJS.Core.GetSystem("GameLogic").Lose();
}

TomatoJS.PlayerController.prototype.Initialize = function() 
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);

  this.mSpeed = 0.0;
  this.mMaxSpeed = 180.0;
  this.mAcceleration = 1.5;
  this.mRotationSpeed = 0.005;
}

TomatoJS.PlayerController.prototype.Uninitialize = function() 
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);

  if( this.parent.GetComponent("ShipDataComponent").mHealth <= 0 && !TomatoJS.Core.GetSystem("GameLogic").gameOver )
    this.Die();
}

TomatoJS.PlayerController.prototype.OnFrameBegin = function(dt)
{
  //basic ship rotation and movement for testing purposes
  var renderable = this.parent.GetComponent("Renderable");
  
  //let us update and control the speed
  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.W))
  {
    this.IncreaseSpeed();
    this.UpdateVelocityDir();
  }

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.S))
  {
    this.DecreaseSpeed();
    this.UpdateVelocityDir();
  }

  //rotation
  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.A))
  {
    renderable.rotation -= this.mRotationSpeed;
    this.UpdateVelocityDir();
  }

  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.D))
  {
    renderable.rotation += this.mRotationSpeed;
    this.UpdateVelocityDir();
  }

  TomatoJS.Core.GetSystem("GameLogic").WrapObject( this.parent );
}

TomatoJS.PlayerController.prototype.IncreaseSpeed = function()
{
  if ( this.mSpeed < this.mMaxSpeed )
    this.mSpeed += this.mAcceleration;
}

TomatoJS.PlayerController.prototype.DecreaseSpeed = function()
{
  if ( this.mSpeed > 0.0 )
    this.mSpeed -= this.mAcceleration;
}

TomatoJS.PlayerController.prototype.UpdateVelocityDir = function()
{
  var renderable = this.parent.GetComponent("Renderable");
  var vel = []; 
  vel[0] = Math.cos(renderable.rotation) * this.mSpeed;
  vel[1] = Math.sin(renderable.rotation) * this.mSpeed;

  this.parent.GetComponent("PhysicsComponent").SetVelocity(vel);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));