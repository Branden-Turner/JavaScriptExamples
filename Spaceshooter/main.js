function main()
{
  // Create engine
  var engine = new TomatoJS.Engine();

  // Add systems
  engine.AddSystem("TileSystem"); //the game will use our own physics engine because lack of integration and down the line we will need a more powerful physics engine for phase 2
  engine.AddSystem("Lighting");
  engine.AddSystem("Physics");
  engine.AddSystem("Graphics");
  engine.AddSystem("UISystem");
  engine.AddSystem("GameLogic");
  
  TomatoJS.Core.GetSystem("Graphics").clearColor = [0,0,0];
  TomatoJS.Core.GetSystem("Lighting").ambientLevel = 0.4;
  
  // Start game
  engine.Start();
}