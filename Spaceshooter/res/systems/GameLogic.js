////////////////////////////////////////////////////////////////////////////////
// Filename: GameLogic.js
// Date: 1-26-2013
// Author(s): Branden Turner
////////////////////////////////////////////////////////////////////////////////
(function (TomatoJS, $, undefined)
{

TomatoJS.GameLogic = function()
{
  this.gameOverMenu = null;
  this.mainMenu = null;
  this.waveArray = [];
  this.explosionTimer = 0;
  this.explosionInterval = 1.7;
  this.UpdateCameraBounds();
  this.backGround = null;
} 

function SpawnerData( blueprintName, numEnemies, timeBetweeSpawns )
{
  this.blueprintName = blueprintName;
  this.numEnemies = numEnemies;
  this.timeBetweeSpawns = timeBetweeSpawns;
}

function WaveData( numEnemies, spawners )
{
  this.numEnemies = numEnemies;
  this.spawners = spawners;
}

TomatoJS.GameLogic.prototype.WrapObject = function( object )
{
  if( object.x < this.cameraLeft )
     object.x = this.cameraRight;
  else if( object.x > this.cameraRight )
    object.x = this.cameraLeft;

  if( object.y < this.cameraTop )
    object.y = this.cameraBottom;
  else if( object.y > this.cameraBottom )
    object.y = this.cameraTop;
}

TomatoJS.GameLogic.prototype.LoadPlayer = function()
{
  this.player = TomatoJS.Core.LoadGameObject("test_player.blueprint");
  this.player.x = 100.0;
  this.player.y = 100.0;
  
  var cannon1 = TomatoJS.Core.LoadGameObject("cannon.json");
  var offset = [0, 30];
  cannon1.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon1.GetComponent("WeaponCannonComponent").SetParent(this.player);
  cannon1.GetComponent("WeaponCannonComponent").SetRotationOffset(3.14);
  cannon1.GetComponent("WeaponCannonComponent").SetPlayerControlled(true);
  cannon1.GetComponent("Renderable").currentAnimation = "Idle";
  this.player.GetComponent("WeaponsControlComponent").mPlayerControlled = true;
  
  var cannon2 = TomatoJS.Core.LoadGameObject("cannon.json");
  offset = [0, -30];
  cannon2.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon2.GetComponent("WeaponCannonComponent").SetParent(this.player);
  cannon2.GetComponent("WeaponCannonComponent").SetPlayerControlled(true);
  cannon2.GetComponent("Renderable").currentAnimation = "Idle";

  var cannon3 = TomatoJS.Core.LoadGameObject("cannon.json");
  offset = [-55, 30];
  cannon3.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon3.GetComponent("WeaponCannonComponent").SetParent(this.player);
  cannon3.GetComponent("WeaponCannonComponent").SetRotationOffset(3.14);
  cannon3.GetComponent("WeaponCannonComponent").SetPlayerControlled(true);
  cannon3.GetComponent("Renderable").currentAnimation = "Idle";

  var cannon4 = TomatoJS.Core.LoadGameObject("cannon.json");
  offset = [-55, -30];
  cannon4.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon4.GetComponent("WeaponCannonComponent").SetParent(this.player);
  cannon4.GetComponent("WeaponCannonComponent").SetPlayerControlled(true);
  cannon4.GetComponent("Renderable").currentAnimation = "Idle";

  this.playerDead = false;
}

TomatoJS.GameLogic.prototype.PurgeUI = function()
{
  if( this.gameOverMenu )
  {
    this.gameOverMenu.Remove();
    this.gameOverMenu = null;
  }

  if( this.mainMenu )
  {
    this.mainMenu.Remove();
    this.mainMenu = null;
  }

  if( this.hudUI )
  {
    this.hudUI.Remove();
    this.hudUI = null;
  }

  if( this.credits )
  {
    this.credits.Remove();
    this.credits = null;
  }

  if( this.htp )
  {
    this.htp.Remove();
    this.htp = null;    
  }
}


TomatoJS.GameLogic.prototype.Restart = function()
{
  this.UpdateCameraBounds();

  // Load the player on the first frame.
  this.gameOver = false;
  this.playerDead = true;

  this.PurgeUI();
    
  // Destroy all current game objects
  TomatoJS.Core.DestroyAllGameObjectsNow();
  this.LoadBG();

  // Load sounds and set up any game logic data we need to.
  this.maxEnemies = 200;
  this.numEnemies = 0;

  this.maxEnemiesThisWave = 10;
  this.maxEnemiesNextWave = 20;
  this.enemiesThisWave = 0;

  this.enemiesKilledThisWave = 0;

  this.totalSeconds = 0;

  this.score = 0;
  this.waveNumber = 0;

  this.currentSpawner = -1;

  this.waveArray = [ new WaveData( 2, [ new SpawnerData( "enemySpawner.json", 2, 2 ) ] ), new WaveData( 4, [ new SpawnerData( "enemySpawner.json", 2, 5 ), new SpawnerData("enemySpawner.json", 2, 2) ] )  ];
  this.spawnerArray = [ this.waveArray[0].spawners ];

  this.bossSpawned = false;
  this.gameOver = false;

  this.NextWave();

  var uiSys = TomatoJS.Core.GetSystem("UISystem");
  this.hudUI = uiSys.LoadUIPage("hud.json");
  uiSys.AddChildToRoot(this.hudUI);
}

TomatoJS.GameLogic.prototype.LoadBG = function()
{
  this.backGround = TomatoJS.Core.LoadGameObject("starBG.json");

  // Set to center of camera
  this.backGround.x = this.cameraLeft + TomatoJS.Core.configData["canvasSize"][0] / 2.0;
  this.backGround.y = this.cameraTop + TomatoJS.Core.configData["canvasSize"][1] / 2.0;
}

TomatoJS.GameLogic.prototype.UpdateBG = function(dt)
{
  // Set to center of camera
  this.backGround.x = this.cameraLeft + TomatoJS.Core.configData["canvasSize"][0] / 2.0;
  this.backGround.y = this.cameraTop + TomatoJS.Core.configData["canvasSize"][1] / 2.0;
  var renderable = this.backGround.GetComponent("Renderable");
  renderable.rotation += 0.01 * dt;
}

TomatoJS.GameLogic.prototype.Initialize = function()
{
  this.MainMenu();
  TomatoJS.Core.GetSystem("UISystem").AddStyleSheet("hud.css");
}

TomatoJS.GameLogic.prototype.MainMenu = function()
{
  // Destroy all current game objects
  TomatoJS.Core.DestroyAllGameObjectsNow();
  this.LoadBG();
  this.PurgeUI();
    
  var uiSys = TomatoJS.Core.GetSystem("UISystem");
  this.mainMenu = uiSys.LoadUIPage("MainMenu.json");
  uiSys.AddChildToRoot(this.mainMenu);

  var that = this;
  uiSys.AddEventListener("click", '#Start', function(){ that.Restart(); } );
  uiSys.AddEventListener("click", '#Credits', function(){ that.Credits(); } );
  uiSys.AddEventListener("click", '#HTP', function(){ that.HTP(); } );
}

TomatoJS.GameLogic.prototype.NextWave = function()
{
  // There are no more waves after the boss.
  if( this.bossSpawned )
    return;

  // Reset wave kill counter
  this.enemiesKilledThisWave = 0;
  this.enemiesThisWave = 0;

  // If we're at the last wave, we should spawn the boss
  if( this.waveNumber >= this.waveArray.length )
  {
    this.maxEnemiesThisWave = 1;
    this.SpawnBoss();
  }
  // Otherwise just get the next wave out of our array.
  else
  {
    // We're on the next wave
    this.waveNumber++;

    var nextWave = this.waveArray[ this.waveNumber - 1 ];

    // How many enemies will spawn this wave?
    this.maxEnemiesThisWave = nextWave.numEnemies;

    // Make the first spawner
    this.currentSpawner = -1;
    this.spawnerArray = nextWave.spawners;
    this.NextSpawner();
  }
}

function getRandomInt (min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

TomatoJS.GameLogic.prototype.CreateSpawner = function()
{
  // Get the initialization data for the spawner
  var data = this.spawnerArray[ this.currentSpawner ];

  // Create the spawner at a random position within the screen
  var obj = TomatoJS.Core.LoadGameObject( data.blueprintName );

  obj.x = getRandomInt( this.cameraLeft * 0.6, this.cameraRight * 0.6);
  obj.y = getRandomInt( this.cameraTop * 0.6, this.cameraBottom * 0.6);

  obj.GetComponent("EnemySpawner").spawnTime = data.timeBetweeSpawns;
  obj.GetComponent("EnemySpawner").spawnMax = data.numEnemies;
}

TomatoJS.GameLogic.prototype.NextSpawner = function()
{
  // Increment our current spawner index
  this.currentSpawner++;

  // If the spawners are all gone for this wave start back at the first spawner
  if( this.currentSpawner >= this.spawnerArray.length )
  {
    this.currentSpawner = 0;
  }

  // Don't make another spawner if we've spawned all our enemies
  if( this.enemiesThisWave < this.maxEnemiesThisWave )
  {
    this.CreateSpawner();
  }
}

TomatoJS.GameLogic.prototype.UpdateUI = function()
{
  // Update Score
  $( '#Score' ).text("Score: " + this.score);

  // Update Enemy Counter
  $( '#EnemyCounter' ).text("Enemies Killed: " + ( this.enemiesKilledThisWave ) + " / " + this.maxEnemiesThisWave );

  // Update Wave Counters
  $( '#WaveCounter' ).text("Wave: " + this.waveNumber + " / " + this.waveArray.length );
}

TomatoJS.GameLogic.prototype.GameOver = function(message)
{
  this.PurgeUI();

  this.gameOver = true;
    
  var uiSys = TomatoJS.Core.GetSystem("UISystem");
  this.gameOverMenu = uiSys.LoadUIPage("GameOver.json");
  uiSys.AddChildToRoot(this.gameOverMenu);

  $( '#GameOverMessage' ).text("Game Over! " + message );
  var that = this;
  uiSys.AddEventListener("click", '#Restart', function(){ that.Restart(); } );
  uiSys.AddEventListener("click", '#Quit', function(){ that.MainMenu(); } );
}

TomatoJS.GameLogic.prototype.Credits = function()
{
  this.PurgeUI();
    
  var uiSys = TomatoJS.Core.GetSystem("UISystem");
  this.credits = uiSys.LoadUIPage("Credits.json");
  uiSys.AddChildToRoot(this.credits);

  var that = this;
  uiSys.AddEventListener("click", '#Back', function(){ that.MainMenu(); } );
}

TomatoJS.GameLogic.prototype.HTP = function()
{
  this.PurgeUI();
  this.LoadPlayer();
    
  var uiSys = TomatoJS.Core.GetSystem("UISystem");
  this.htp = uiSys.LoadUIPage("HTP.json");
  uiSys.AddChildToRoot(this.htp);

  var that = this;
  uiSys.AddEventListener("click", '#Back', function(){ that.MainMenu(); } );
}

TomatoJS.GameLogic.prototype.Win = function()
{
  this.GameOver("You Win!");
}

TomatoJS.GameLogic.prototype.Lose = function()
{
  this.GameOver("You Lose!");
  this.playerDead = true;
}

TomatoJS.GameLogic.prototype.SpawnBoss = function()
{
  this.bossSpawned = true;

  var obj = TomatoJS.Core.LoadGameObject("boss1.json");
  obj.x = getRandomInt( this.cameraLeft, this.cameraRight );
  obj.y = getRandomInt( this.cameraTop, this.cameraBottom );

  var cannon1 = TomatoJS.Core.LoadGameObject("cannon.json");
  var offset = [0, 30];
  cannon1.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon1.GetComponent("WeaponCannonComponent").SetParent(obj);
  cannon1.GetComponent("WeaponCannonComponent").SetRotationOffset(3.14);
  cannon1.GetComponent("WeaponCannonComponent").SetPlayerControlled(false);
  cannon1.GetComponent("Renderable").currentAnimation = "Idle";
  
  var cannon2 = TomatoJS.Core.LoadGameObject("cannon.json");
  offset = [0, -30];
  cannon2.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon2.GetComponent("WeaponCannonComponent").SetParent(obj);
  cannon2.GetComponent("WeaponCannonComponent").SetPlayerControlled(false);
  cannon2.GetComponent("Renderable").currentAnimation = "Idle";

  var cannon3 = TomatoJS.Core.LoadGameObject("cannon.json");
  offset = [-55, 30];
  cannon3.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon3.GetComponent("WeaponCannonComponent").SetParent(obj);
  cannon3.GetComponent("WeaponCannonComponent").SetRotationOffset(3.14);
  cannon3.GetComponent("WeaponCannonComponent").SetPlayerControlled(false);
  cannon3.GetComponent("Renderable").currentAnimation = "Idle";

  var cannon4 = TomatoJS.Core.LoadGameObject("cannon.json");
  offset = [-55, -30];
  cannon4.GetComponent("WeaponCannonComponent").SetOffset(offset);
  cannon4.GetComponent("WeaponCannonComponent").SetParent(obj);
  cannon4.GetComponent("WeaponCannonComponent").SetPlayerControlled(false);
  cannon4.GetComponent("Renderable").currentAnimation = "Idle";
}

TomatoJS.GameLogic.prototype.Explosions = function(dt)
{
  this.explosionTimer += dt;

  if( this.explosionTimer > this.explosionInterval )
  {
    this.explosionTimer = 0;

    // Spawn an explosion at a random point within the camera's world bounds.
    var obj = TomatoJS.Core.LoadGameObject("bgexplosion.json");
    obj.x = getRandomInt( this.cameraLeft, this.cameraRight );
    obj.y = getRandomInt( this.cameraTop, this.cameraBottom );
  }
}

TomatoJS.GameLogic.prototype.UpdateCameraBounds = function()
{
  var camera = TomatoJS.Core.GetSystem("Graphics").camera;

  this.cameraLeft = camera.x;
  this.cameraRight = camera.x + TomatoJS.Core.configData["canvasSize"][0];
  this.cameraTop = camera.y;
  this.cameraBottom = camera.y + TomatoJS.Core.configData["canvasSize"][1];
}

TomatoJS.GameLogic.prototype.Update = function(dt)
{
  if( this.playerDead && !this.gameOver )
    this.LoadPlayer();

  this.UpdateCameraBounds();

  this.totalSeconds += dt;
  this.UpdateUI();
  this.Explosions(dt);
  this.UpdateBG(dt);

  // Move to next wave if we should
  if( this.enemiesKilledThisWave >= this.maxEnemiesThisWave )
    TomatoJS.Core.GetSystem("GameLogic").NextWave();
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));