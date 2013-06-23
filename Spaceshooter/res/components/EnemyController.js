////////////////////////////////////////////////////////////////////////////////
// Filename: EnemyController.js
// Date: 1-26-2013
// Author(s): Branden Turner
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

TomatoJS.EnemyController = function()
{

}

TomatoJS.EnemyController.prototype.Hover = function(dt)
{
  // See if we need to pick a new movement direction
  this.newDirTimer += dt;
  
  // Decide to turn
  if (Math.random() < this.chanceToTurn && this.newDirTimer > this.turnMinTime)
  {
    this.newDirTimer = 0;
    this.newMoveDir = this.moveDir - this.maxDirChange / 2 + Math.random() * this.maxDirChange;
  }

  // At hoverspeed
  this.moveSpeed = this.hoverSpeed;

  var player = TomatoJS.Core.GetSystem("GameLogic").player;

  // If you're within attack maneuvor distance, start getting in position for an attack
  var distanceToPlayer = this.parent.DistanceTo(player);

  if( distanceToPlayer < this.attackRange )
  {
    this.movement = this.AttackPlayer;
  }
  // Otherwise if the player is within sensing range, seek
  else if( distanceToPlayer < this.seekRange )
  {
    this.movement = this.Seek;
  }
}

TomatoJS.EnemyController.prototype.Seek = function(dt)
{
  // Face the player
  var player = TomatoJS.Core.GetSystem("GameLogic").player; 
  this.newMoveDir = Math.atan2(player.y - this.parent.y, player.x - this.parent.x) - 3.14 / 2;

  // Move at seek speed
  this.moveSpeed = this.seekSpeed;

  var distanceToPlayer = this.parent.DistanceTo(player);

  // If within attack distance, switch to attacking state
  if( distanceToPlayer < this.attackRange )
  {
    this.movement = this.AttackPlayer;
  }
  // If the ship gets too far away, switch to hover 
  else if( distanceToPlayer > this.seekRange )
  {
    this.movement = this.Hover;
  }
}

TomatoJS.EnemyController.prototype.AttackPlayer = function(dt)
{
  this.barrageTimer += dt;

  // Face the player
  var player = TomatoJS.Core.GetSystem("GameLogic").player;  
  this.newMoveDir = Math.atan2(player.y - this.parent.y, player.x - this.parent.x) - 3.14 / 2;

  // Move backwards slowly
  this.moveSpeed = -this.seekSpeed / 5.0;

  // If the player is too far away, seek
  var distanceToPlayer = this.parent.DistanceTo(player);
  if( this.barrageTimer > this.barrageDuration && distanceToPlayer > this.attackRange )
  {
    this.barrageTimer = 0;
    this.movement = this.Seek;
  }
}

TomatoJS.EnemyController.prototype.Malfunction = function(dt)
{
  this.malfunctionTimer += dt;

  // If your malfunction time is up, go back to hover
  if( this.malfunctionTimer > this.malfunctionDuration )
  {
    this.movement = this.Hover;
  }

  // Spin to show malfunctioning
  this.moveDir += 0.02 * dt;

  // No movement
  this.moveSpeed = 0;
}

TomatoJS.EnemyController.prototype.Retreat = function(dt)
{
  // Face away from the player
  var player = TomatoJS.Core.GetSystem("GameLogic").player;  
  this.newMoveDir = Math.atan2(this.parent.y - player.y, this.parent.x - player.x) - 3.14 / 2;

  // At retreat speed
  this.moveSpeed = this.retreatSpeed;

  // If far enough away, switch to charge
  var distanceToPlayer = this.parent.DistanceTo(player);
  if( distanceToPlayer > this.seekRange )
  {
    this.movement = this.Charge;
  }
}

TomatoJS.EnemyController.prototype.Charge = function(dt)
{
  // Charge your health up a bit
  this.parent.GetComponent("ShipDataComponent").mHealth += 10 * dt;

  // If your health is high enough start hovering again
  if( this.parent.GetComponent("ShipDataComponent").mHealth > this.retreatHealthLimit * 1.25 )
  {
    this.movement = this.Hover;
  }

  // loop a charging animation

  // No movement, so set speed to zero
  this.moveSpeed = 0;
}


TomatoJS.EnemyController.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
  ++TomatoJS.Core.GetSystem("GameLogic").numEnemies;
  ++TomatoJS.Core.GetSystem("GameLogic").enemiesThisWave;

  this.barrageTimer = 0;
  this.barrageDuration = 3.0;

  this.attackRange = 100;
  this.seekRange = 300;

  // Speeds for different forms of movement.
  this.moveSpeed = 18;
  this.seekSpeed = 50;
  this.hoverSpeed = 18;
  this.retreatSpeed = 16;

  this.chanceToRetreat = 0.1;
  this.retreatHealthLimit = 20;

  this.chanceToMalfunction = 0.05;
  this.malfunctionHealthLimit = 30;
  this.malfunctionDuration = 3.0;

  // If within sight radius, can seek
  this.sightRadius = 100;

  // If within sense radius, can shoot
  this.shotRadius = 30;
  this.viewAngle = Math.PI / 2;

  // Movement
  this.moveDir = Math.random() * Math.PI * 2;
  this.newMoveDir = this.moveDir;
  this.maxDirChange = Math.PI * 2;
  this.turnSpeed = 3;

  this.chanceToTurn = 0.01;
  this.turnMinTime = 5;

  // Timers for attacking, picking new direction, and malfunctioning
  this.attackTimer = 0;
  this.newDirTimer = 0;
  this.malfunctionTimer = 0;

  this.circleRadius = 25;

  this.movement = this.Hover;
}

TomatoJS.EnemyController.prototype.Uninitialize = function()
{
	TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);

  if( TomatoJS.Core.GetSystem("GameLogic").gameOver )
  {
    return;
  }
  
  // Subtract from the number of enemies total
  --TomatoJS.Core.GetSystem("GameLogic").numEnemies;

  // Add to how many enemies we've killed this wave.
  ++TomatoJS.Core.GetSystem("GameLogic").enemiesKilledThisWave;

  TomatoJS.Core.GetSystem("GameLogic").score += 100;

  if( TomatoJS.Core.GetSystem("GameLogic").bossSpawned )
    TomatoJS.Core.GetSystem("GameLogic").Win();
}

TomatoJS.EnemyController.prototype.OnFrameBegin = function(dt)
{
  // Increase timers
  this.attackTimer += dt;

  // Do whatever movement state we're in
  this.movement(dt);

  // Turn based on our new turn direction decided in movement state
  if (Math.abs(this.newMoveDir - this.moveDir) > 0.001)
  {
    var moveAmount = ((this.newMoveDir - this.moveDir) / 2) * dt * this.turnSpeed;
    this.moveDir += moveAmount;
  }

  // Turn and move in that direction
	var renderable = this.parent.GetComponent("Renderable");
  renderable.rotation =  this.moveDir + Math.PI / 2 ;

  var vel = []; 
  vel[0] = Math.cos(renderable.rotation) * this.moveSpeed;
  vel[1] = Math.sin(renderable.rotation) * this.moveSpeed;

  this.parent.GetComponent("PhysicsComponent").SetVelocity(vel);

  // If your health is low enough, switch to retreat mode at some low percentage chance every tryRetreatTime seconds
  if (Math.random() < (this.chanceToRetreat * dt) && this.parent.GetComponent("ShipDataComponent").mHealth <= this.retreatHealthLimit )
  {
    this.movement = this.Retreat;
  }

  // If you're under 50% health, you have a small chance to malfunction every checkMalfunctionTime seconds
  if (Math.random() < (this.chacneToMalfunction * dt) && this.parent.GetComponent("ShipDataComponent").mHealth <= this.malfunctionHealthLimit )
  {
    this.movement = this.Malfunction;
  }

  TomatoJS.Core.GetSystem( "GameLogic" ).WrapObject(this.parent);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));