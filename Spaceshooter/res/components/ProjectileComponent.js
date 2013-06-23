////////////////////////////////////////////////////////////////////////////////
// Filename: ProjectileComponent.js
// Date: 2-6-2013
// Author(s): Dane Curbow
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{
  
TomatoJS.ProjectileComponent = function()
{
  this.mFriendly;
  this.mDamage;
  this.mLifeTime = 5.0;
} 

TomatoJS.ProjectileComponent.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
} 

TomatoJS.ProjectileComponent.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.ProjectileComponent.prototype.OnFrameBegin = function(dt)
{
  var colliders = TomatoJS.Core.GetSystem("Physics").GetColliders();
  //check for collision against non-projectile colliders
  this.mLifeTime -= dt;
  if ( this.mLifeTime < 0 )
  {
    //kill the bullet
    this.parent.Destroy();
    return;
  }

  for( var i in colliders )
  {
    //the object that we have possibly shot
    var shotObj = colliders[i].parent;
    //check if the collider even is a ship, via having a ship data component
    var dataComp = shotObj.GetComponent("ShipDataComponent");
    if( dataComp == null )
      continue;
    //check if the projectile and ship share the same friendly status
    if( dataComp.mFriendly == this.mFriendly )
      continue;
    //if they share the same status, continue, else check collision
    if( !colliders[i].mIsProjectile )
      if( colliders[i].CheckCollision([this.parent.x,this.parent.y]) )
      {
        // Play explosion sound.
        TomatoJS.Core.audio.PlaySound("Explosion", false, 0.6);

        //do a damage calculation on the hit object 
        dataComp.mHealth -= (this.mDamage - dataComp.mArmor);
        //if the ship has 0 health kill it off
        if( dataComp.mHealth <= 0 )
        {
          //spawn a larger explosion for destoying enemies
          var explosion = TomatoJS.Core.LoadGameObject("explosion1.json");
          explosion.x = shotObj.x;
          explosion.y = shotObj.y;

          shotObj.Destroy();
        }
        //remove the projectile regardless
        this.parent.Destroy();
        //make an impact particle explosion
        var explosion = TomatoJS.Core.LoadGameObject("test_cannon_hit.json");
        explosion.x = this.parent.x;
        explosion.y = this.parent.y;
        break;
      }
  }

  TomatoJS.Core.GetSystem("GameLogic").WrapObject( this.parent );
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));