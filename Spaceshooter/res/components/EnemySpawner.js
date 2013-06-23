////////////////////////////////////////////////////////////////////////////////
// Filename: EnemySpawner.js
// Date: 1-26-2013
// Author(s): Branden Turner
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

TomatoJS.EnemySpawner = function()
{
  this.spawnTime = 5;
  this.spawnTimer = 0;
  this.spawnOffsetX = 0;
  this.spawnOffsetY = 0;

  this.spawnMax = 5;
  this.spawnCount = 0;
}

TomatoJS.EnemySpawner.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.EnemySpawner.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
  TomatoJS.Core.GetSystem("GameLogic").NextSpawner();
}

TomatoJS.EnemySpawner.prototype.SpawnEnemy = function()
{
  var obj = TomatoJS.Core.LoadGameObject("test_enemy.json");
  obj.x = this.parent.x + this.spawnOffsetX;
  obj.y = this.parent.y + this.spawnOffsetY;

  // Spawn enemy cannons
  var enemyCannon = TomatoJS.Core.LoadGameObject("cannon.json");
  var offset = [0, 0];
  enemyCannon.GetComponent("WeaponCannonComponent").SetOffset(offset);
  enemyCannon.GetComponent("WeaponCannonComponent").SetParent(obj);
  enemyCannon.GetComponent("WeaponCannonComponent").SetRotationOffset(3.14 / 2);
  enemyCannon.GetComponent("WeaponCannonComponent").SetPlayerControlled(false);
  enemyCannon.GetComponent("Renderable").currentAnimation = "Idle";

  ++this.spawnCount;
}

TomatoJS.EnemySpawner.prototype.OnFrameBegin = function(dt)
{
  this.spawnTimer += dt;

  var numEnemies = TomatoJS.Core.GetSystem("GameLogic").enemiesThisWave;
  var maxEnemies = TomatoJS.Core.GetSystem("GameLogic").maxEnemiesThisWave;

  // Spawning logic
  if( this.spawnTimer >= this.spawnTime && numEnemies < maxEnemies )
  {
    this.spawnTimer = 0;
    this.SpawnEnemy();

    if( this.spawnCount >= this.spawnMax )
    	this.parent.Destroy();
  }
  else if( numEnemies >= maxEnemies )
  {
    this.parent.Destroy();
  }
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));