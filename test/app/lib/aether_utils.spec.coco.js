
  let levenshteinDistance, solutionsByLanguage;

  solutionsByLanguage = {
    javascript: {},
    lua: {},
    python: {},
    coffeescript: {},
    java: {},
    cpp: {}
  };

  solutionsByLanguage.javascript.dungeonsOfKithgard = "// Move towards the gem.\n// Don’t touch the spikes!\n// Type your code below and click Run when you’re done.\n\nhero.moveRight();\nhero.moveDown();\nhero.moveRight();";

  solutionsByLanguage.javascript.peekABoom = "// Build traps on the path when the hero sees a munchkin!\n\nwhile(true) {\n    let enemy = hero.findNearestEnemy();\n    if(enemy) {\n        // Build a \"fire-trap\" at the Red X (41, 24)\n        hero.buildXY(\"fire-trap\", 41, 24);\n    }\n    // Add an else below to move back to the clearing\n    else {\n        // Move to the Wooden X (19, 19)\n        hero.moveXY(19, 19);\n    }\n}";

  solutionsByLanguage.javascript.woodlandCleaver = "// Use your new \"cleave\" skill as often as you can.\n\nhero.moveXY(23, 23);\nwhile(true) {\n    let enemy = hero.findNearestEnemy();\n    if(hero.isReady(\"cleave\")) {\n        // Cleave the enemy!\n        hero.cleave(enemy);\n    } else {\n        // Else (if cleave isn't ready), do your normal attack.\n        hero.attack(enemy);\n    }\n}";

  solutionsByLanguage.javascript.aFineMint = "// Peons are trying to steal your coins!\n// Write a function to squash them before they can take your coins.\n\nfunction pickUpCoin() {\n    let coin = hero.findNearestItem();\n    if(coin) {\n        hero.moveXY(coin.pos.x, coin.pos.y);\n    }\n}\n\n// Write the attackEnemy function below.\n// Find the nearest enemy and attack them if they exist!\nfunction attackEnemy() {\n    let enemy = hero.findNearestEnemy();\n    if(enemy) {\n        hero.attack(enemy);\n    }\n}\n\nwhile(true) {\n    attackEnemy(); // Δ Uncomment this line after you write an attackEnemy function.\n    pickUpCoin();\n}";

  solutionsByLanguage.javascript.libraryTactician = "// Hushbaum has been ambushed by ogres!\n// She is busy healing her soldiers, you should command them to fight!\n// The ogres will send more troops if they think they can get to Hushbaum or your archers, so keep them inside the circle!\n\nlet archerTarget = null;\n// Soldiers spread out in a circle and defend.\nfunction commandSoldier(soldier, soldierIndex, numSoldiers) {\n    let angle = Math.PI * 2 * soldierIndex / numSoldiers;\n    let defendPos = {x: 41, y: 40};\n    defendPos.x += 10 * Math.cos(angle);\n    defendPos.y += 10 * Math.sin(angle);\n    hero.command(soldier, \"defend\", defendPos);\n}\n\n// Find the strongest target (most health)\n// This function returns something! When you call the function, you will get some value back.\nfunction findStrongestTarget() {\n    let mostHealth = 0;\n    let bestTarget = null;\n    let enemies = hero.findEnemies();\n    // Figure out which enemy has the most health, and set bestTarget to be that enemy.\n    for(let i=0; i < enemies.length; i++) {\n        let enemy = enemies[i];\n        if(enemy.health > mostHealth) {\n            bestTarget = enemy;\n            mostHealth = enemy.health;\n        }\n    }\n    // Only focus archers' fire if there is a big ogre.\n    if (bestTarget && bestTarget.health > 15) {\n        return bestTarget;\n    } else {\n        return null;\n    }\n}\n\n\n// If the strongestTarget has more than 15 health, attack that target. Otherwise, attack the nearest target.\nfunction commandArcher(archer) {\n    let nearest = archer.findNearestEnemy();\n    if(archerTarget) {\n        hero.command(archer, \"attack\", archerTarget);\n    } else if(nearest) {\n        hero.command(archer, \"attack\", nearest);\n    }\n}\n\n\nwhile(true) {\n    // If archerTarget is defeated or doesn't exist, find a new one.\n    if(!archerTarget || archerTarget.health <= 0) {\n        // Set archerTarget to be the target that is returned by findStrongestTarget()\n        archerTarget = findStrongestTarget();\n    }\n    let soldiers = hero.findByType(\"soldier\");\n    // Create a letiable containing your archers.\n    let archers = hero.findByType(\"archer\");\n    for(let i=0; i < soldiers.length; i++) {\n        let soldier = soldiers[i];\n        commandSoldier(soldier, i, soldiers.length);\n    }\n    // use commandArcher() to command your archers\n    for(i=0; i < archers.length; i++) {\n        let archer = archers[i];\n        commandArcher(archer);\n    }\n}";

  solutionsByLanguage.javascript.snowdrops = "// We need to clear the forest of traps!\n// The scout prepared a map of the forest.\n// But be careful where you shoot! Don't start a fire.\n\n// Get the map of the forest.\nlet forestMap = hero.findNearest(hero.findFriends()).forestMap;\n\n// The map is a 2D array where 0 is a trap.\n// The first sure shot.\nhero.say(\"Row \" + 0 + \" Column \" + 1 + \" Fire!\");\n\n// But for the next points, check before shooting.\n// There are an array of points to check.\nlet cells = [{row: 0, col: 4}, {row: 1, col: 0}, {row: 1, col: 2}, {row: 1, col: 4},\n    {row: 2, col: 1}, {row: 2, col: 3}, {row: 2, col: 5}, {row: 3, col: 0},\n    {row: 3, col: 2}, {row: 3, col: 4}, {row: 4, col: 1}, {row: 4, col: 2},\n    {row: 4, col: 3}, {row: 5, col: 0}, {row: 5, col: 3}, {row: 5, col: 5},\n    {row: 6, col: 1}, {row: 6, col: 3}, {row: 6, col: 4}, {row: 7, col: 0}];\n\nfor (let i = 0; i < cells.length; i++) {\n    let row = cells[i].row;\n    let col = cells[i].col;\n    // If row is less than forestMap length:\n    if (row < forestMap.length) {\n        // If col is less than forestMap[row] length:\n        if (col < forestMap[row].length) {\n            // Now, we know the cell exists.\n            // If it is 0, say where to shoot:\n            if (forestMap[row][col] === 0) {\n                hero.say(\"Row \" + row + \" Column \" + col + \" Fire!\");\n            }\n        }\n    }\n}";

  solutionsByLanguage.lua.dungeonsOfKithgard = "-- Move towards the gem.\n-- Don’t touch the spikes!\n-- Type your code below and click Run when you’re done.\n\nhero:moveRight()\nhero:moveDown()\nhero:moveRight()";

  solutionsByLanguage.lua.peekABoom = "-- Build traps on the path when the hero sees a munchkin!\n\nwhile true do\n    local enemy = hero:findNearestEnemy()\n    if enemy then\n        -- Build a \"fire-trap\" at the Red X (41, 24)\n        hero:buildXY(\"fire-trap\", 41, 24)\n    -- Add an else below to move back to the clearing\n    else\n        -- Move to the Wooden X (19, 19)\n        hero:moveXY(19, 19)\n    end\nend";

  solutionsByLanguage.lua.woodlandCleaver = "-- Use your new \"cleave\" skill as often as you can.\n\nhero:moveXY(23, 23)\nwhile true do\n    local enemy = hero:findNearestEnemy()\n    if hero:isReady(\"cleave\") then\n        -- Cleave the enemy!\n        hero:cleave(enemy)\n    else\n        -- Else (if cleave isn't ready), do your normal attack.\n        hero:attack(enemy)\n    end\nend";

  solutionsByLanguage.lua.aFineMint = "-- Peons are trying to steal your coins!\n-- Write a function to squash them before they can take your coins.\n\nfunction pickUpCoin()\n    local coin = hero:findNearestItem()\n    if coin then\n        hero:moveXY(coin.pos.x, coin.pos.y)\n    end\nend\n\n-- Write the attackEnemy function below.\n-- Find the nearest enemy and attack them if they exist!\nfunction attackEnemy()\n    local enemy = hero:findNearestEnemy()\n    if enemy then\n        hero:attack(enemy)\n    end\nend\n\nwhile true do\n    attackEnemy() -- Δ Uncomment this line after you write an attackEnemy function.\n    pickUpCoin()\nend";

  solutionsByLanguage.lua.libraryTactician = "-- Hushbaum has been ambushed by ogres!\n-- She is busy healing her soldiers, you should command them to fight!\n-- The ogres will send more troops if they think they can get to Hushbaum or your archers, so keep them inside the circle!\n\nlocal archerTarget = nil\n-- Soldiers spread out in a circle and defend.\nfunction commandSoldier(soldier, soldierIndex, numSoldiers)\n    local angle = Math.PI * 2 * soldierIndex / numSoldiers\n    local defendPos = {x=41, y=40}\n    defendPos.x = defendPos.x + 10 * Math.cos(angle)\n    defendPos.y = defendPos.y + 10 * Math.sin(angle)\n    hero:command(soldier, \"defend\", defendPos)\nend\n\n-- Find the strongest target (most health)\n-- This function returns something! When you call the function, you will get some value back.\nfunction findStrongestTarget()\n    local mostHealth = 0\n    local bestTarget = nil\n    local enemies = hero:findEnemies()\n    -- Figure out which enemy has the most health, and set bestTarget to be that enemy.\n    for i, enemy in pairs(enemies) do\n        if enemy.health > mostHealth then\n            bestTarget = enemy\n            mostHealth = enemy.health\n        end\n    end\n    -- Only focus archers' fire if there is a big ogre.\n    if bestTarget and bestTarget.health > 15 then\n        return bestTarget\n    else\n        return nil\n    end\nend\n\n\n-- If the strongestTarget has more than 15 health, attack that target. Otherwise, attack the nearest target.\nfunction commandArcher(archer)\n    local nearest = archer:findNearestEnemy()\n    if archerTarget then\n        hero:command(archer, \"attack\", archerTarget)\n    elseif nearest then\n        hero:command(archer, \"attack\", nearest)\n    end\nend\n\n\nwhile true do\n    -- If archerTarget is defeated or doesn't exist, find a new one.\n    if not archerTarget or archerTarget.health <= 0 then\n        -- Set archerTarget to be the target that is returned by findStrongestTarget()\n        archerTarget = findStrongestTarget()\n    end\n    local soldiers = hero:findByType(\"soldier\")\n    -- Create a letiable containing your archers.\n    local archers = hero:findByType(\"archer\")\n    for i, soldier in pairs(soldiers) do\n        commandSoldier(soldier, i, #soldiers)\n    end\n    -- use commandArcher() to command your archers\n    for i, archer in pairs(archers) do\n        commandArcher(archer)\n    end\nend";

  solutionsByLanguage.lua.snowdrops = "-- We need to clear the forest of traps!\n-- The scout prepared a map of the forest.\n-- But be careful where you shoot! Don't start a fire.\n\n-- Get the map of the forest.\nlocal forestMap = hero:findNearest(hero:findFriends()).forestMap\n\n-- The map is a 2D array where 0 is a trap.\n-- The first sure shot.\nhero:say(\"Row \" + 0 + \" Column \" + 1 + \" Fire!\")\n\n-- But for the next points, check before shooting.\n-- There are an array of points to check.\nlocal cells = {{row=0, col=4}, {row=1, col=0}, {row=1, col=2}, {row=1, col=4},\n    {row=2, col=1}, {row=2, col=3}, {row=2, col=5}, {row=3, col=0},\n    {row=3, col=2}, {row=3, col=4}, {row=4, col=1}, {row=4, col=2},\n    {row=4, col=3}, {row=5, col=0}, {row=5, col=3}, {row=5, col=5},\n    {row=6, col=1}, {row=6, col=3}, {row=6, col=4}, {row=7, col=0}}\n\nfor i in pairs(cells) do\n    local row = cells[i].row\n    local col = cells[i].col\n    -- If row is less than forestMap length:\n    if row < #forestMap then\n        -- If col is less than forestMap[row] length:\n        if col < #forestMap[row + 1] then\n            -- Now, we know the cell exists.\n            -- If it is 0, say where to shoot:\n            if forestMap[row + 1][col + 1] == 0 then\n                hero:say(\"Row \" + row + \" Column \" + col + \" Fire!\")\n            end\n        end\n    end\nend";

  solutionsByLanguage.python.dungeonsOfKithgard = "# Move towards the gem.\n# Don’t touch the spikes!\n# Type your code below and click Run when you’re done.\n\nhero.moveRight()\nhero.moveDown()\nhero.moveRight()";

  solutionsByLanguage.python.peekABoom = "# Build traps on the path when the hero sees a munchkin!\n\nwhile True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        # Build a \"fire-trap\" at the Red X (41, 24)\n        hero.buildXY(\"fire-trap\", 41, 24)\n    # Add an else below to move back to the clearing\n    else:\n        # Move to the Wooden X (19, 19)\n        hero.moveXY(19, 19)";

  solutionsByLanguage.python.woodlandCleaver = "# Use your new \"cleave\" skill as often as you can.\n\nhero.moveXY(23, 23)\nwhile True:\n    enemy = hero.findNearestEnemy()\n    if hero.isReady(\"cleave\"):\n        # Cleave the enemy!\n        hero.cleave(enemy)\n    else:\n        # Else (if cleave isn't ready), do your normal attack.\n        hero.attack(enemy)";

  solutionsByLanguage.python.aFineMint = "# Peons are trying to steal your coins!\n# Write a function to squash them before they can take your coins.\n\ndef pickUpCoin():\n    coin = hero.findNearestItem()\n    if coin:\n        hero.moveXY(coin.pos.x, coin.pos.y)\n\n# Write the attackEnemy function below.\n# Find the nearest enemy and attack them if they exist!\ndef attackEnemy():\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        hero.attack(enemy)\n\nwhile True:\n    attackEnemy() # Δ Uncomment this line after you write an attackEnemy function.\n    pickUpCoin()";

  solutionsByLanguage.python.libraryTactician = "# Hushbaum has been ambushed by ogres!\n# She is busy healing her soldiers, you should command them to fight!\n# The ogres will send more troops if they think they can get to Hushbaum or your archers, so keep them inside the circle!\n\narcherTarget = None\n# Soldiers spread out in a circle and defend.\ndef commandSoldier(soldier, soldierIndex, numSoldiers):\n    angle = Math.PI * 2 * soldierIndex / numSoldiers\n    defendPos = {\"x\": 41, \"y\": 40}\n    defendPos.x += 10 * Math.cos(angle)\n    defendPos.y += 10 * Math.sin(angle)\n    hero.command(soldier, \"defend\", defendPos)\n\n# Find the strongest target (most health)\n# This function returns something! When you call the function, you will get some value back.\ndef findStrongestTarget():\n    mostHealth = 0\n    bestTarget = None\n    enemies = hero.findEnemies()\n    # Figure out which enemy has the most health, and set bestTarget to be that enemy.\n    for i in range(len(enemies)):\n        enemy = enemies[i]\n        if enemy.health > mostHealth:\n            bestTarget = enemy\n            mostHealth = enemy.health\n    # Only focus archers' fire if there is a big ogre.\n    if bestTarget and bestTarget.health > 15:\n        return bestTarget\n    else:\n        return None\n\n\n# If the strongestTarget has more than 15 health, attack that target. Otherwise, attack the nearest target.\ndef commandArcher(archer):\n    nearest = archer.findNearestEnemy()\n    if archerTarget:\n        hero.command(archer, \"attack\", archerTarget)\n    elif nearest:\n        hero.command(archer, \"attack\", nearest)\n\n\nwhile True:\n    # If archerTarget is defeated or doesn't exist, find a new one.\n    if not archerTarget or archerTarget.health <= 0:\n        # Set archerTarget to be the target that is returned by findStrongestTarget()\n        archerTarget = findStrongestTarget()\n    soldiers = hero.findByType(\"soldier\")\n    # Create a letiable containing your archers.\n    archers = hero.findByType(\"archer\")\n    for i in range(len(soldiers)):\n        soldier = soldiers[i]\n        commandSoldier(soldier, i, len(soldiers))\n    # use commandArcher() to command your archers\n    for i in range(len(archers)):\n        archer = archers[i]\n        commandArcher(archer)";

  solutionsByLanguage.python.snowdrops = "# We need to clear the forest of traps!\n# The scout prepared a map of the forest.\n# But be careful where you shoot! Don't start a fire.\n\n# Get the map of the forest.\nforestMap = hero.findNearest(hero.findFriends()).forestMap\n\n# The map is a 2D array where 0 is a trap.\n# The first sure shot.\nhero.say(\"Row \" + 0 + \" Column \" + 1 + \" Fire!\")\n\n# But for the next points, check before shooting.\n# There are an array of points to check.\ncells = [{\"row\": 0, \"col\": 4}, {\"row\": 1, \"col\": 0}, {\"row\": 1, \"col\": 2}, {\"row\": 1, \"col\": 4},\n    {\"row\": 2, \"col\": 1}, {\"row\": 2, \"col\": 3}, {\"row\": 2, \"col\": 5}, {\"row\": 3, \"col\": 0},\n    {\"row\": 3, \"col\": 2}, {\"row\": 3, \"col\": 4}, {\"row\": 4, \"col\": 1}, {\"row\": 4, \"col\": 2},\n    {\"row\": 4, \"col\": 3}, {\"row\": 5, \"col\": 0}, {\"row\": 5, \"col\": 3}, {\"row\": 5, \"col\": 5},\n    {\"row\": 6, \"col\": 1}, {\"row\": 6, \"col\": 3}, {\"row\": 6, \"col\": 4}, {\"row\": 7, \"col\": 0}]\n\nfor i in range(len(cells)):\n    row = cells[i].row\n    col = cells[i].col\n    # If row is less than forestMap length:\n    if row < len(forestMap):\n        # If col is less than forestMap[row] length:\n        if col < len(forestMap[row]):\n            # Now, we know the cell exists.\n            # If it is 0, say where to shoot:\n            if forestMap[row][col] == 0:\n                hero.say(\"Row \" + row + \" Column \" + col + \" Fire!\")";

  solutionsByLanguage.coffeescript.dungeonsOfKithgard = "# Move towards the gem.\n# Don’t touch the spikes!\n# Type your code below and click Run when you’re done.\n\nhero.moveRight()\nhero.moveDown()\nhero.moveRight()";

  solutionsByLanguage.coffeescript.peekABoom = "# Build traps on the path when the hero sees a munchkin!\n\nloop\n    enemy = hero.findNearestEnemy()\n    if enemy\n        # Build a \"fire-trap\" at the Red X (41, 24)\n        hero.buildXY \"fire-trap\", 41, 24\n    # Add an else below to move back to the clearing\n    else\n        # Move to the Wooden X (19, 19)\n        hero.moveXY 19, 19";

  solutionsByLanguage.coffeescript.woodlandCleaver = "# Use your new \"cleave\" skill as often as you can.\n\nhero.moveXY 23, 23\nloop\n    enemy = hero.findNearestEnemy()\n    if hero.isReady \"cleave\"\n        # Cleave the enemy!\n        hero.cleave enemy\n    else\n        # Else (if cleave isn't ready), do your normal attack.\n        hero.attack enemy";

  solutionsByLanguage.coffeescript.aFineMint = "# Peons are trying to steal your coins!\n# Write a function to squash them before they can take your coins.\n\npickUpCoin = ->\n    coin = hero.findNearestItem()\n    if coin\n        hero.moveXY coin.pos.x, coin.pos.y\n\n# Write the attackEnemy function below.\n# Find the nearest enemy and attack them if they exist!\nattackEnemy = ->\n    enemy = hero.findNearestEnemy()\n    if enemy\n        hero.attack enemy\n\nloop\n    attackEnemy() # Δ Uncomment this line after you write an attackEnemy function.\n    pickUpCoin()";

  solutionsByLanguage.coffeescript.libraryTactician = "# Hushbaum has been ambushed by ogres!\n# She is busy healing her soldiers, you should command them to fight!\n# The ogres will send more troops if they think they can get to Hushbaum or your archers, so keep them inside the circle!\n\narcherTarget = null\n# Soldiers spread out in a circle and defend.\ncommandSoldier = (soldier, soldierIndex, numSoldiers) ->\n    angle = Math.PI * 2 * soldierIndex / numSoldiers\n    defendPos = {x: 41, y: 40}\n    defendPos.x += 10 * Math.cos angle\n    defendPos.y += 10 * Math.sin angle\n    hero.command soldier, \"defend\", defendPos\n\n# Find the strongest target (most health)\n# This function returns something! When you call the function, you will get some value back.\nfindStrongestTarget = ->\n    mostHealth = 0\n    bestTarget = null\n    enemies = hero.findEnemies()\n    # Figure out which enemy has the most health, and set bestTarget to be that enemy.\n    for enemy, i in enemies\n        if enemy.health > mostHealth\n            bestTarget = enemy\n            mostHealth = enemy.health\n    # Only focus archers' fire if there is a big ogre.\n    if bestTarget and bestTarget.health > 15\n        return bestTarget\n    else\n        return null\n\n\n# If the strongestTarget has more than 15 health, attack that target. Otherwise, attack the nearest target.\ncommandArcher = (archer) ->\n    nearest = archer.findNearestEnemy()\n    if archerTarget\n        hero.command archer, \"attack\", archerTarget\n    else if nearest\n        hero.command archer, \"attack\", nearest\n\n\nloop\n    # If archerTarget is defeated or doesn't exist, find a new one.\n    if not archerTarget or archerTarget.health <= 0\n        # Set archerTarget to be the target that is returned by findStrongestTarget()\n        archerTarget = findStrongestTarget()\n    soldiers = hero.findByType \"soldier\"\n    # Create a letiable containing your archers.\n    archers = hero.findByType \"archer\"\n    for soldier, i in soldiers\n        commandSoldier soldier, i, soldiers.length\n    # use commandArcher() to command your archers\n    for archer, i in archers\n        commandArcher archer";

  solutionsByLanguage.coffeescript.snowdrops = "# We need to clear the forest of traps!\n# The scout prepared a map of the forest.\n# But be careful where you shoot! Don't start a fire.\n\n# Get the map of the forest.\nforestMap = hero.findNearest(hero.findFriends()).forestMap\n\n# The map is a 2D array where 0 is a trap.\n# The first sure shot.\nhero.say \"Row \" + 0 + \" Column \" + 1 + \" Fire!\"\n\n# But for the next points, check before shooting.\n# There are an array of points to check.\ncells = [{row: 0, col: 4}, {row: 1, col: 0}, {row: 1, col: 2}, {row: 1, col: 4},\n    {row: 2, col: 1}, {row: 2, col: 3}, {row: 2, col: 5}, {row: 3, col: 0},\n    {row: 3, col: 2}, {row: 3, col: 4}, {row: 4, col: 1}, {row: 4, col: 2},\n    {row: 4, col: 3}, {row: 5, col: 0}, {row: 5, col: 3}, {row: 5, col: 5},\n    {row: 6, col: 1}, {row: 6, col: 3}, {row: 6, col: 4}, {row: 7, col: 0}]\n\nfor i in [0...cells.length]\n    row = cells[i].row\n    col = cells[i].col\n    # If row is less than forestMap length:\n    if row < forestMap.length\n        # If col is less than forestMap[row] length:\n        if col < forestMap[row].length\n            # Now, we know the cell exists.\n            # If it is 0, say where to shoot:\n            if forestMap[row][col] is 0\n                hero.say \"Row \" + row + \" Column \" + col + \" Fire!\"";

  solutionsByLanguage.java.dungeonsOfKithgard = "// Move towards the gem.\n// Don’t touch the spikes!\n// Type your code below and click Run when you’re done.\n\npublic class AI {\n    public static void main(String[] args) {\n        hero.moveRight();\n        hero.moveDown();\n        hero.moveRight();\n    }\n}";

  solutionsByLanguage.java.peekABoom = "// Build traps on the path when the hero sees a munchkin!\n\npublic class AI {\n    public static void main(String[] args) {\n        while(true) {\n            let enemy = hero.findNearestEnemy();\n            if(enemy) {\n                // Build a \"fire-trap\" at the Red X (41, 24)\n                hero.buildXY(\"fire-trap\", 41, 24);\n            }\n            // Add an else below to move back to the clearing\n            else {\n                // Move to the Wooden X (19, 19)\n                hero.moveXY(19, 19);\n            }\n        }\n    }\n}";

  solutionsByLanguage.java.woodlandCleaver = "// Use your new \"cleave\" skill as often as you can.\n\npublic class AI {\n    public static void main(String[] args) {\n        hero.moveXY(23, 23);\n        while(true) {\n            let enemy = hero.findNearestEnemy();\n            if(hero.isReady(\"cleave\")) {\n                // Cleave the enemy!\n                hero.cleave(enemy);\n            } else {\n                // Else (if cleave isn't ready), do your normal attack.\n                hero.attack(enemy);\n            }\n        }\n    }\n}";

  solutionsByLanguage.java.aFineMint = "// Peons are trying to steal your coins!\n// Write a function to squash them before they can take your coins.\n\npublic class AI {\n    public static void pickUpCoin() {\n        let coin = hero.findNearestItem();\n        if(coin) {\n            hero.moveXY(coin.pos.x, coin.pos.y);\n        }\n    }\n    \n    // Write the attackEnemy function below.\n    // Find the nearest enemy and attack them if they exist!\n    public static void attackEnemy() {\n        let enemy = hero.findNearestEnemy();\n        if(enemy) {\n            hero.attack(enemy);\n        }\n    }\n    \n    public static void main(String[] args) {\n        while(true) {\n            attackEnemy(); // Δ Uncomment this line after you write an attackEnemy function.\n            pickUpCoin();\n        }\n    }\n}";

  solutionsByLanguage.java.libraryTactician = "// Hushbaum has been ambushed by ogres!\n// She is busy healing her soldiers, you should command them to fight!\n// The ogres will send more troops if they think they can get to Hushbaum or your archers, so keep them inside the circle!\n\npublic class AI {\n    let archerTarget = null;\n    // Soldiers spread out in a circle and defend.\n    \n    public static void commandSoldier(Object soldier, Object soldierIndex, Object numSoldiers) {\n        let angle = Math.PI * 2 * soldierIndex / numSoldiers;\n        let defendPos = {41, 40};\n        defendPos.x += 10 * Math.cos(angle);\n        defendPos.y += 10 * Math.sin(angle);\n        hero.command(soldier, \"defend\", defendPos);\n    }\n    \n    public static Object findStrongestTarget() {\n        let mostHealth = 0;\n        let bestTarget = null;\n        let enemies = hero.findEnemies();\n        // Figure out which enemy has the most health, and set bestTarget to be that enemy.\n        for(int i=0; i < enemies.length; i++) {\n            let enemy = enemies[i];\n            if(enemy.health > mostHealth) {\n                bestTarget = enemy;\n                mostHealth = enemy.health;\n            }\n        }\n        // Only focus archers' fire if there is a big ogre.\n        if (bestTarget && bestTarget.health > 15) {\n            return bestTarget;\n        } else {\n            return null;\n        }\n    }\n    \n    public static void commandArcher(Object archer) {\n        let nearest = archer.findNearestEnemy();\n        if(archerTarget) {\n            hero.command(archer, \"attack\", archerTarget);\n        } else if(nearest) {\n            hero.command(archer, \"attack\", nearest);\n        }\n    }\n    \n    public static void main(String[] args) {\n        while(true) {\n            // If archerTarget is defeated or doesn't exist, find a new one.\n            if(!archerTarget || archerTarget.health <= 0) {\n                // Set archerTarget to be the target that is returned by findStrongestTarget()\n                archerTarget = findStrongestTarget();\n            }\n            let soldiers = hero.findByType(\"soldier\");\n            // Create a letiable containing your archers.\n            let archers = hero.findByType(\"archer\");\n            for(int i=0; i < soldiers.length; i++) {\n                let soldier = soldiers[i];\n                commandSoldier(soldier, i, soldiers.length);\n            }\n            // use commandArcher() to command your archers\n            for(i=0; i < archers.length; i++) {\n                let archer = archers[i];\n                commandArcher(archer);\n            }\n        }\n    }\n}";

  solutionsByLanguage.java.snowdrops = "int main() {\n    // We need to clear the forest of traps!\n    // The scout prepared a map of the forest.\n    // But be careful where you shoot! Don't start a fire.\n    \n    // Get the map of the forest.\n    auto forestMap = hero.findNearest(hero.findFriends()).forestMap;\n    \n    // The map is a 2D array where 0 is a trap.\n    // The first sure shot.\n    hero.say(\"Row \" + 0 + \" Column \" + 1 + \" Fire!\");\n    \n    // But for the next points, check before shooting.\n    // There are an array of points to check.\n    auto cells = {{0, 4}, {1, 0}, {1, 2}, {1, 4},\n        {2, 1}, {2, 3}, {2, 5}, {3, 0},\n        {3, 2}, {3, 4}, {4, 1}, {4, 2},\n        {4, 3}, {5, 0}, {5, 3}, {5, 5},\n        {6, 1}, {6, 3}, {6, 4}, {7, 0}};\n    \n    for (int i = 0; i < cells.size(); i++) {\n        auto row = cells[i].x;\n        auto col = cells[i].y;\n        // If row is less than forestMap length:\n        if (row < forestMap.length) {\n            // If col is less than forestMap[row] length:\n            if (col < forestMap[row].size()) {\n                // Now, we know the cell exists.\n                // If it is 0, say where to shoot:\n                if (forestMap[row][col] == 0) {\n                    hero.say(\"Row \" + row + \" Column \" + col + \" Fire!\");\n                }\n            }\n        }\n    }\n    return 0;    \n}";

  solutionsByLanguage.cpp.dungeonsOfKithgard = "// Move towards the gem.\n// Don’t touch the spikes!\n// Type your code below and click Run when you’re done.\n\nint main() {\n    hero.moveRight();\n    hero.moveDown();\n    hero.moveRight();\n    return 0;\n}";

  solutionsByLanguage.cpp.peekABoom = "// Build traps on the path when the hero sees a munchkin!\n\nint main() {\n    while(true) {\n        auto enemy = hero.findNearestEnemy();\n        if(enemy) {\n            // Build a \"fire-trap\" at the Red X (41, 24)\n            hero.buildXY(\"fire-trap\", 41, 24);\n        }\n        // Add an else below to move back to the clearing\n        else {\n            // Move to the Wooden X (19, 19)\n            hero.moveXY(19, 19);\n        }\n    }\n    return 0;\n}";

  solutionsByLanguage.cpp.woodlandCleaver = "// Use your new \"cleave\" skill as often as you can.\n\nint main() {\n    hero.moveXY(23, 23);\n    while(true) {\n        auto enemy = hero.findNearestEnemy();\n        if(hero.isReady(\"cleave\")) {\n            // Cleave the enemy!\n            hero.cleave(enemy);\n        } else {\n            // Else (if cleave isn't ready), do your normal attack.\n            hero.attack(enemy);\n        }\n    }\n    return 0;\n}";

  solutionsByLanguage.cpp.aFineMint = "// Peons are trying to steal your coins!\n// Write a function to squash them before they can take your coins.\n\nauto pickUpCoin() {\n    auto coin = hero.findNearestItem();\n    if(coin) {\n        hero.moveXY(coin.pos.x, coin.pos.y);\n    }\n}\n\n// Write the attackEnemy function below.\n// Find the nearest enemy and attack them if they exist!\nauto attackEnemy() {\n    auto enemy = hero.findNearestEnemy();\n    if(enemy) {\n        hero.attack(enemy);\n    }\n}\n\nint main() {\n    while(true) {\n        attackEnemy(); // Δ Uncomment this line after you write an attackEnemy function.\n        pickUpCoin();\n    }\n    return 0;\n}";

  solutionsByLanguage.cpp.libraryTactician = "// Hushbaum has been ambushed by ogres!\n// She is busy healing her soldiers, you should command them to fight!\n// The ogres will send more troops if they think they can get to Hushbaum or your archers, so keep them inside the circle!\n\n// Soldiers spread out in a circle and defend.\nauto commandSoldier(auto soldier, auto soldierIndex, auto numSoldiers) {\n    auto angle = Math.PI * 2 * soldierIndex / numSoldiers;\n    auto defendPos = {41, 40};\n    defendPos.x += 10 * Math.cos(angle);\n    defendPos.y += 10 * Math.sin(angle);\n    hero.command(soldier, \"defend\", defendPos);\n}\n\n// Find the strongest target (most health)\n// This function returns something! When you call the function, you will get some value back.\nauto findStrongestTarget() {\n    auto mostHealth = 0;\n    auto bestTarget = null;\n    auto enemies = hero.findEnemies();\n    // Figure out which enemy has the most health, and set bestTarget to be that enemy.\n    for(int i=0; i < enemies.size(); i++) {\n        auto enemy = enemies[i];\n        if(enemy.health > mostHealth) {\n            bestTarget = enemy;\n            mostHealth = enemy.health;\n        }\n    }\n    // Only focus archers' fire if there is a big ogre.\n    if (bestTarget && bestTarget.health > 15) {\n        return bestTarget;\n    } else {\n        return null;\n    }\n}\n\n// If the strongestTarget has more than 15 health, attack that target. Otherwise, attack the nearest target.\nauto commandArcher(auto archer) {\n    auto nearest = archer.findNearestEnemy();\n    if(archerTarget) {\n        hero.command(archer, \"attack\", archerTarget);\n    } else if(nearest) {\n        hero.command(archer, \"attack\", nearest);\n    }\n}\n\n\nauto archerTarget = null;\n\n\n\nint main() {\n    while(true) {\n        // If archerTarget is defeated or doesn't exist, find a new one.\n        if(!archerTarget || archerTarget.health <= 0) {\n            // Set archerTarget to be the target that is returned by findStrongestTarget()\n            archerTarget = findStrongestTarget();\n        }\n        auto soldiers = hero.findByType(\"soldier\");\n        // Create a letiable containing your archers.\n        auto archers = hero.findByType(\"archer\");\n        for(int i=0; i < soldiers.size(); i++) {\n            auto soldier = soldiers[i];\n            commandSoldier(soldier, i, soldiers.size());\n        }\n        // use commandArcher() to command your archers\n        for(i=0; i < archers.size(); i++) {\n            auto archer = archers[i];\n            commandArcher(archer);\n        }\n    }\n    return 0;\n}";

  solutionsByLanguage.cpp.snowdrops = "// We need to clear the forest of traps!\n// The scout prepared a map of the forest.\n// But be careful where you shoot! Don't start a fire.\n\nint main() {\n    // Get the map of the forest.\n    auto forestMap = hero.findNearest(hero.findFriends()).forestMap;\n    \n    // The map is a 2D array where 0 is a trap.\n    // The first sure shot.\n    hero.say(\"Row \" + 0 + \" Column \" + 1 + \" Fire!\");\n    \n    // But for the next points, check before shooting.\n    // There are an array of points to check.\n    auto cells = {{0, 4}, {1, 0}, {1, 2}, {1, 4},\n        {2, 1}, {2, 3}, {2, 5}, {3, 0},\n        {3, 2}, {3, 4}, {4, 1}, {4, 2},\n        {4, 3}, {5, 0}, {5, 3}, {5, 5},\n        {6, 1}, {6, 3}, {6, 4}, {7, 0}};\n    \n    for (int i = 0; i < cells.size(); i++) {\n        auto row = cells[i].x;\n        auto col = cells[i].y;\n        // If row is less than forestMap length:\n        if (row < forestMap.size()) {\n            // If col is less than forestMap[row] length:\n            if (col < forestMap[row].size()) {\n                // Now, we know the cell exists.\n                // If it is 0, say where to shoot:\n                if (forestMap[row][col] == 0) {\n                    hero.say(\"Row \" + row + \" Column \" + col + \" Fire!\");\n                }\n            }\n        }\n    }\n    return 0;\n}";

  levenshteinDistance = function(str1, str2) {
    let d, i, j, k, l, m, n, o, p, ref, ref1, ref2, ref3;
    m = str1.length;
    n = str2.length;
    d = [];
    if (!m) {
      return n;
    }
    if (!n) {
      return m;
    }
    for (i = k = 0, ref = m; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      d[i] = [i];
    }
    for (j = l = 1, ref1 = n; 1 <= ref1 ? l <= ref1 : l >= ref1; j = 1 <= ref1 ? ++l : --l) {
      d[0][j] = j;
    }
    for (i = o = 1, ref2 = m; 1 <= ref2 ? o <= ref2 : o >= ref2; i = 1 <= ref2 ? ++o : --o) {
      for (j = p = 1, ref3 = n; 1 <= ref3 ? p <= ref3 : p >= ref3; j = 1 <= ref3 ? ++p : --p) {
        if (str1[i - 1] === str2[j - 1]) {
          d[i][j] = d[i - 1][j - 1];
        } else {
          d[i][j] = Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]) + 1;
        }
      }
    }
    return d[m][n];
  };

  describe('Aether / code transpilation utility library', function() {
    let aetherUtils;
    aetherUtils = require('../../../app/lib/aether_utils');
    describe('translateJS(jsCode, "cpp", fullCode)', function() {
      describe('do not add int main if fullCode set false', function() {
        it('if there is no pattern needing translation', function() {
          return expect(aetherUtils.translateJS('hero.moveRight()', 'cpp', false)).toBe('hero.moveRight()');
        });
        it('if there is let x or let y', function() {
          return expect(aetherUtils.translateJS('let x = 2;\nlet y = 3', 'cpp', false)).toBe('float x = 2;\nfloat y = 3');
        });
        it('if there is ===/!==', function() {
          return expect(aetherUtils.translateJS('if (a === 2 && b !== 1)', 'cpp', false)).toBe('if (a == 2 && b != 1)');
        });
        it('if there is other let', function() {
          return expect(aetherUtils.translateJS('let enemy = hero...', 'cpp', false)).toBe('auto enemy = hero...');
        });
        return it('if there is a function definition', function() {
          return expect(aetherUtils.translateJS('function a() {}\n', 'cpp', false)).toBe('auto a() {}\n');
        });
      });
      describe('add int main if fullCode set true', function() {
        it('if there is no pattern needing translation', function() {
          return expect(aetherUtils.translateJS('hero.moveRight();'), 'cpp').toBe('int main() {\n    hero.moveRight();\n    return 0;\n}');
        });
        it('if there is let x or let y', function() {
          return expect(aetherUtils.translateJS('let x = 2;\nlet y = 3;', 'cpp')).toBe('int main() {\n    float x = 2;\n    float y = 3;\n    return 0;\n}');
        });
        it('if there is ===/!==', function() {
          return expect(aetherUtils.translateJS('while (a === 2 && b !== 1)', 'cpp')).toBe('int main() {\n    while (a == 2 && b != 1)\n    return 0;\n}');
        });
        it('if there is other let', function() {
          return expect(aetherUtils.translateJS('let enemy = hero...', 'cpp')).toBe('int main() {\n    auto enemy = hero...\n    return 0;\n}');
        });
        it('if there is a function definition', function() {
          return expect(aetherUtils.translateJS('function a() {}\n', 'cpp')).toBe('auto a() {}\n\nint main() {\n    \n    return 0;\n}');
        });
        it('if there is a function definition with parameter', function() {
          return expect(aetherUtils.translateJS('function a(b) {}\n', 'cpp')).toBe('auto a(auto b) {}\n\nint main() {\n    \n    return 0;\n}');
        });
        return it('if there is a function definition with parameters', function() {
          return expect(aetherUtils.translateJS('function a(b, c) {}\na();', 'cpp')).toBe('auto a(auto b, auto c) {}\n\nint main() {\n    a();\n    return 0;\n}');
        });
      });
      return describe('if there are start comments', function() {
        it('if there is no code', function() {
          return expect(aetherUtils.translateJS('//abc\n//def\n\n', 'cpp')).toBe('//abc\n//def\n\nint main() {\n    \n    return 0;\n}');
        });
        it('if there is code without function definition', function() {
          return expect(aetherUtils.translateJS('//abc\n\nhero.moveRight()', 'cpp')).toBe('//abc\n\nint main() {\n    hero.moveRight()\n    return 0;\n}');
        });
        return it('if there is code with function definition', function() {
          return expect(aetherUtils.translateJS('//abc\n\nfunction a(b, c) {}\nhero.moveRight()', 'cpp')).toBe('//abc\n\nauto a(auto b, auto c) {}\n\nint main() {\n    hero.moveRight()\n    return 0;\n}');
        });
      });
    });
    return describe('translateJS can handle full solutions', function() {
      let language, results, solutions, targetLanguage, targetLevel, unsupported;
      unsupported = [['lua', 'snowdrops'], ['cpp', 'snowdrops'], ['java', 'snowdrops'], ['java', 'libraryTactician'], ['java', 'aFineMint'], ['cpp', 'aFineMint']];
      targetLanguage = '';
      targetLevel = '';
      results = [];
      for (language in solutionsByLanguage) {
        solutions = solutionsByLanguage[language];
        if (language !== 'javascript') {
          results.push((function(language, solutions) {
            return describe('in ' + language, function() {
              let code, level, results1;
              results1 = [];
              for (level in solutions) {
                code = solutions[level];
                results1.push((function(level, code) {
                  let f;
                  if (_.find(unsupported, function(arg) {
                    let lang, lev;
                    lang = arg[0], lev = arg[1];
                    return lang === language && lev === level;
                  })) {
                    f = xit;
                  } else if (!targetLevel && !targetLanguage) {
                    f = it;
                  } else if ((targetLevel && level === targetLevel) || (targetLanguage && language === targetLanguage)) {
                    f = fit;
                  } else {
                    f = it;
                  }
                  return f('properly translates ' + level, function() {
                    let editDistance, js, translated;
                    js = solutionsByLanguage.javascript[level];
                    translated = aetherUtils.translateJS(js, language, true);
                    editDistance = levenshteinDistance(translated, code);
                    expect('\n' + translated).toEqual('\n' + code);
                    return expect(editDistance).toEqual(0);
                  });
                })(level, code));
              }
              return results1;
            });
          })(language, solutions));
        }
      }
      return results;
    });
  });