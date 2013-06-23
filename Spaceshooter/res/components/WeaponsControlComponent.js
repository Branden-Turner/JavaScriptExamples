////////////////////////////////////////////////////////////////////////////////
// Filename: WeaponsControlComponent.js
// Date: 1-24-2013
// Author(s): Dane Curbow
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

TomatoJS.WeaponsControlComponent = function()
{
  this.mWeapons = [];
  this.mPlayerControlled = false;
  this.mWeaponGroups = {};
  this.mWeaponGroups["1"] = {};
  this.mWeaponGroups["2"] = {};
  this.mWeaponGroups["3"] = {};
  this.mWeaponGroups["4"] = {};
  this.mWeaponGroups["5"] = {};
}

TomatoJS.WeaponsControlComponent.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.WeaponsControlComponent.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
  for ( var i in this.mWeapons )
    this.mWeapons[i].parent.Destroy();
}

TomatoJS.WeaponsControlComponent.prototype.OnFrameBegin = function(dt)
{
  // If not player controlled, try to fire all your weapons every frame, because why not?
  if( !this.mPlayerControlled )
  {
    for ( var i in this.mWeapons )
        this.mWeapons[i].Fire();
  }
  //check for control + number for weapon groups and then numbers for
  //selecting grouped weapons
  if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.SPACE ))
  {
    for ( var i in this.mWeapons )
      if( this.mWeapons[i].mSelected )
        this.mWeapons[i].Fire();
  }  

  if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.C ))
  {
    //check for number presses
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM1 ))
    {
      delete this.mWeaponGroups["1"];
      this.mWeaponGroups["1"] = {};
      for ( var i in this.mWeapons )
        if( this.mWeapons[i].mSelected )
          this.mWeaponGroups["1"][i] = true;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM2 ))
    {
      delete this.mWeaponGroups["2"];
      this.mWeaponGroups["2"] = {};
      for ( var i in this.mWeapons )
        if( this.mWeapons[i].mSelected )
          this.mWeaponGroups["2"][i] = true;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM3 ))
    {
      delete this.mWeaponGroups["3"];
      this.mWeaponGroups["3"] = {};
      for ( var i in this.mWeapons )
        if( this.mWeapons[i].mSelected )
          this.mWeaponGroups["3"][i] = true;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM4 ))
    {
      delete this.mWeaponGroups["4"];
      this.mWeaponGroups["4"] = {};
      for ( var i in this.mWeapons )
        if( this.mWeapons[i].mSelected )
          this.mWeaponGroups["4"][i] = true;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM5 ))
    {
      delete this.mWeaponGroups["5"];
      this.mWeaponGroups["5"] = {};
      for ( var i in this.mWeapons )
        if( this.mWeapons[i].mSelected )
          this.mWeaponGroups["5"][i] = true;
    }
  } 
  else
  {
    //check for number presses
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM1 ))
    {
      for ( var i in this.mWeapons )
        if ( i in this.mWeaponGroups["1"] )
          this.mWeapons[i].mSelected = true;
        else
          this.mWeapons[i].mSelected = false;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM2 ))
    {
      for ( var i in this.mWeapons )
        if ( i in this.mWeaponGroups["2"] )
          this.mWeapons[i].mSelected = true;
        else
          this.mWeapons[i].mSelected = false;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM3 ))
    {
      for ( var i in this.mWeapons )
        if ( i in this.mWeaponGroups["3"] )
          this.mWeapons[i].mSelected = true;
        else
          this.mWeapons[i].mSelected = false;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM4 ))
    {
      for ( var i in this.mWeapons )
        if ( i in this.mWeaponGroups["4"] )
          this.mWeapons[i].mSelected = true;
        else
          this.mWeapons[i].mSelected = false;
    }
    if ( TomatoJS.Core.input.IsDown( TomatoJS.Core.input.NUM5 ))
    {
      for ( var i in this.mWeapons )
        if ( i in this.mWeaponGroups["5"] )
          this.mWeapons[i].mSelected = true;
        else
          this.mWeapons[i].mSelected = false;
    }
  } 
}

TomatoJS.WeaponsControlComponent.prototype.AddWeapon = function(weapon)
{
  this.mWeapons.push(weapon);
}

TomatoJS.WeaponsControlComponent.prototype.SelectAllWeapons = function()
{
    for ( var i in this.mWeapons )
      this.mWeapons[i].mSelected = true;       
}

/// Cannon

TomatoJS.WeaponCannonComponent = function()
{
  //these are just so that the names of memebers are available in the file
  //these will have values assigned in their json files for a variety of cannon types
  this.mParentObj;
  this.mOffset = [0,0]; //the vector offset from the center position
  this.mRotationOffset = 0;
  this.mReloadTime = 5;
  this.mReloadingTime = this.mReloadTime;
  //
  this.mSelected = false;
  this.mReadyToFire = false;
  this.mPrevParentAngle = 0;
  //
  this.mBulletSpeed = 100;
  this.mDamage = 15;
  this.mFriendly;
}

TomatoJS.WeaponCannonComponent.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
  TomatoJS.Core.AddEventListener("OnMouseDown", this);
}

TomatoJS.WeaponCannonComponent.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
  TomatoJS.Core.RemoveEventListener("OnMouseDown", this);
}

TomatoJS.WeaponCannonComponent.prototype.Fire = function(dt)
{
  if ( this.mReadyToFire )
  {
    // Play fire sound.
    TomatoJS.Core.audio.PlaySound("Explosion", false, 0.6);

    //create a bullet at the cannons position, plus a little bit forward
    var renderable = this.parent.GetComponent("Renderable");
    var bullet = TomatoJS.Core.LoadGameObject("test_bullet.json");
    bullet.x = this.parent.x;
    bullet.y = this.parent.y;
    bullet.GetComponent("Renderable").rotation = renderable.rotation;
    //set the friendly status of the projectile and its damage (the cannon knows its own damage output)
    //var shipData = this.parent.GetComponent("ShipDataComponent");
    bullet.GetComponent("ProjectileComponent").mFriendly = this.mFriendly;
    bullet.GetComponent("ProjectileComponent").mDamage = this.mDamage;
    //start the particle animation for shooting the cannon
    var explosion = TomatoJS.Core.LoadGameObject("test_cannon_shot.json");
    explosion.GetComponent("ParticleEmitter").spawnDirection = renderable.rotation - Math.PI/2.0 ;
    explosion.x = this.parent.x;
    explosion.y = this.parent.y;
    //set the bullets velocity
    var vel = TomatoJS.Vec2FromAngle(renderable.rotation - Math.PI/2.0);
    vel = TomatoJS.Vec2Scale(vel, this.mBulletSpeed);
    bullet.GetComponent("PhysicsComponent").SetVelocity(vel);
    //handle the weapons shooting cycle
    this.mReadyToFire = false;
    this.mReloadingTime = this.mReloadTime;
    //this.parent.GetComponent("Renderable").currentAnimation = "FiredSelected";
  }
}

TomatoJS.WeaponCannonComponent.prototype.OnFrameBegin = function(dt)
{
  //update the cannons position relative to the parent object(a spaceship)
  //get the parents rotation to rotate the offset vectors
  var parentRotation = this.mParentObj.GetComponent("Renderable").rotation;
  this.parent.GetComponent("Renderable").rotation = parentRotation + this.mRotationOffset;
  //rotate the offset vector if there was a delta in the parents rotation
  var rotationDelta = parentRotation - this.mPrevParentAngle;
  if ( rotationDelta )
  {
    var cs = Math.cos(rotationDelta);
    var sn = Math.sin(rotationDelta);
    var newX = this.mOffset[0] * cs - this.mOffset[1] * sn; 
    var newY = this.mOffset[0] * sn + this.mOffset[1] * cs;
    this.mOffset = [newX, newY];
    this.mPrevParentAngle = parentRotation;
  }
  //
  this.parent.x = this.mParentObj.x + this.mOffset[0];
  this.parent.y = this.mParentObj.y + this.mOffset[1];

  //check the weapon is reloading
  if( this.mReloadingTime > 0 )
    this.mReloadingTime -= dt;
  if( this.mReloadingTime < 0 )
  {
    this.mReloadingTime = 0;
    this.mReadyToFire = true;
  }

  if( this.mSelected )
  {
    if( this.mReadyToFire )
      this.parent.GetComponent("Renderable").currentAnimation = "IdleSelected";
    else
      this.parent.GetComponent("Renderable").currentAnimation = "FiredSelected";
  }
  else
  {
    if( this.mReadyToFire )
      this.parent.GetComponent("Renderable").currentAnimation = "Idle";
    else
      this.parent.GetComponent("Renderable").currentAnimation = "Fired";
  }

}

TomatoJS.WeaponCannonComponent.prototype.OnMouseDown = function(eventData)
{ 
  //without this check you can select and control enemy guns
  if ( !this.mPlayerControlled )
    return;

  if ( eventData.which == TomatoJS.Core.input.LEFT_MOUSE )
  {
    var collider = this.parent.GetComponent("ColliderComponent");
    var mousePosition = [eventData.canvasX, eventData.canvasY];
    mousePosition[0] += TomatoJS.Core.GetSystem("Graphics").camera.x;
    mousePosition[1] += TomatoJS.Core.GetSystem("Graphics").camera.y;
    if( collider.CheckCollision(mousePosition) )
    {
      if( this.mSelected )
        this.mSelected = false;
      else
        this.mSelected = true;
    }
  }
}

TomatoJS.WeaponCannonComponent.prototype.SetParent = function(parentObj)
{
  parentObj.GetComponent("WeaponsControlComponent").AddWeapon(this);

  var renderable = this.parent.GetComponent("Renderable");
  
  this.mParentObj = parentObj;
  this.mPrevParentAngle = this.mParentObj.GetComponent("Renderable").rotation;
}

TomatoJS.WeaponCannonComponent.prototype.SetOffset = function(offset)
{
  this.mOffset[0] = offset[0];
  this.mOffset[1] = offset[1];
}

TomatoJS.WeaponCannonComponent.prototype.SetRotationOffset = function(radians)
{
  this.mRotationOffset = radians;
}

TomatoJS.WeaponCannonComponent.prototype.SetPlayerControlled = function(bool)
{
  this.mPlayerControlled = bool;
  this.mFriendly = bool;
}

/// Rocket
TomatoJS.WeaponRocketComponent = function()
{
  this.mSelected = false;
  this.mReadyToFire = true;
}

TomatoJS.WeaponRocketComponent.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.WeaponRocketComponent.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.WeaponRocketComponent.prototype.OnFrameBegin = function(dt)
{
  
}

TomatoJS.WeaponRocketComponent.prototype.OnMouseDown = function(eventData)
{

}

TomatoJS.WeaponRocketComponent.prototype.SetParent = function(parentObj)
{
  this.mParentObj = parentObj;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));