////////////////////////////////////////////////////////////////////////////////
// Filename: Physics.js
// Date: 1-22-2013
// Author(s): Dane Curbow
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

TomatoJS.Physics = function()
{
  this.mPhysicsComponents = {};
  this.mColliderComponents = {};
}

TomatoJS.Physics.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnObjectInitialized", this);
  TomatoJS.Core.AddEventListener("OnObjectUninitialized", this);
}

TomatoJS.Physics.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnObjectInitialized", this);
  TomatoJS.Core.RemoveEventListener("OnObjectUninitialized", this);
}

TomatoJS.Physics.prototype.Update = function(dt)
{
  //integrate objects
  for( var i in this.mPhysicsComponents )
    this.mPhysicsComponents[i].Integrate(dt);
}

//listen for objects being created and grab their physics component ( if they have one )
TomatoJS.Physics.prototype.OnObjectInitialized = function(gameObject)
{
  var comp = gameObject.GetComponent("PhysicsComponent");
  if ( comp != null )
    this.mPhysicsComponents[gameObject.id] = comp;

  var collider = gameObject.GetComponent("ColliderComponent");
  if ( collider != null )
    this.mColliderComponents[gameObject.id] = collider;
}

TomatoJS.Physics.prototype.GetColliders = function()
{
  return this.mColliderComponents;
}

TomatoJS.Physics.prototype.OnObjectUninitialized = function(gameObject)
{
  delete this.mPhysicsComponents[gameObject.id];
  delete this.mColliderComponents[gameObject.id];
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));