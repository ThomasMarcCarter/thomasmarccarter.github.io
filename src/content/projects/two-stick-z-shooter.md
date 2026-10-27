---
title: Two-Stick Z Shooter
description: A top-down twin-stick zombie roguelike made in Unity, played through a flickering green-phosphor military terminal.
date: 2026-10-15
tags: [Unity, C#, URP, HLSL, Blender]
repo: https://github.com/ThomasMarcCarter/Two-Stick-Z-Shooter
featured: true
skin: radar
cover:
  src: ../../assets/projects/two-stick-z-shooter/cover.jpg
  alt: The player firing an AK-47 at the Surgeon boss in a red-lit hospital arena, inside its lunge warning ring
media:
  - type: video
    src: projects/two-stick-z-shooter/highlight-reel.mp4
    poster: ../../assets/projects/two-stick-z-shooter/highlight-reel-poster.jpg
    alt: A highlight reel of the main menu, room fights across all four zones, three bosses, the hideout, the zone map and the death screen
    caption: Highlight reel
  - type: video
    src: projects/two-stick-z-shooter/hospital-room-clear.mp4
    poster: ../../assets/projects/two-stick-z-shooter/hospital-room-clear-poster.jpg
    alt: The player steps into a hospital ward, the doors lock and the room is cleared with an AK-47
    caption: Clearing a hospital ward
  - type: video
    src: projects/two-stick-z-shooter/hospital-boss-the-surgeon.mp4
    poster: ../../assets/projects/two-stick-z-shooter/hospital-boss-the-surgeon-poster.jpg
    alt: The Surgeon boss telegraphs each lunge with a red aim line, then dashes across the arena
    caption: "Boss fight: the Surgeon"
  - type: video
    src: projects/two-stick-z-shooter/military-base-combat.mp4
    poster: ../../assets/projects/two-stick-z-shooter/military-base-combat-poster.jpg
    alt: The player fighting through Military Base barracks with an M4A1, lit by flashlight and muzzle flash
    caption: Military Base barracks
  - type: video
    src: projects/two-stick-z-shooter/shopping-mall-shotgun-combat.mp4
    poster: ../../assets/projects/two-stick-z-shooter/shopping-mall-shotgun-combat-poster.jpg
    alt: The player using a pump-action shotgun through a Shopping Mall stockroom and into the food court
    caption: Shotgun through the Shopping Mall
  - type: video
    src: projects/two-stick-z-shooter/airport-room-clear.mp4
    poster: ../../assets/projects/two-stick-z-shooter/airport-room-clear-poster.jpg
    alt: The player clearing an Airport room with an MP5 as zombies drop ammo and crafting materials
    caption: Clearing an Airport room
  - type: video
    src: projects/two-stick-z-shooter/airport-boss-the-handler.mp4
    poster: ../../assets/projects/two-stick-z-shooter/airport-boss-the-handler-poster.jpg
    alt: The Handler boss, a baggage handler, hurling suitcases across the arena
    caption: "Boss fight: the Handler"
  - type: video
    src: projects/two-stick-z-shooter/hideout-tour.mp4
    poster: ../../assets/projects/two-stick-z-shooter/hideout-tour-poster.jpg
    alt: A walk through the survivor hideout past the intel desk, training dummy, survivors and upgrade stations
    caption: The survivor hideout
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/hospital-room-entry.jpg
    alt: The doors of a hospital room locked shut as zombies close in
    caption: Doors lock until every zombie is dead
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/military-base-firefight.jpg
    alt: Close-quarters M4A1 fire in the Military Base barracks
    caption: Military Base firefight
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/shopping-mall-food-court.jpg
    alt: A firefight across the Shopping Mall's checkered food court
    caption: The Shopping Mall food court
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/shopping-mall-boss-warden.jpg
    alt: The Warden, a riot-shield boss that blocks every shot from the front
    caption: The Warden blocks every shot from the front
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/hospital-boss-surgeon-aim.jpg
    alt: The Surgeon lining up a lunge, with a red line showing where it will go
    caption: The Surgeon lines up a lunge
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/airport-boss-room-loot.jpg
    alt: Consumables, attachments, crafting materials and a supply crate left in the Airport boss room
    caption: Loot after the boss goes down
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/hideout-intel-desk.jpg
    alt: The survivor hideout with the intel desk, a training dummy and a survivor's speech bubble
    caption: The hideout's intel desk
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/inventory.jpg
    alt: The backpack inventory with wireframe item art, an attachment tooltip, quick-use slots and the floor map
    caption: Backpack inventory and attachments
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/tactical-map.jpg
    alt: The full-screen tactical map with room data and a legend
    caption: The tactical map
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/zone-map.jpg
    alt: The military truck's zone map showing the Military Base, Shopping Mall, Hospital and Airport
    caption: Choosing a zone from the truck
  - type: image
    src: ../../assets/projects/two-stick-z-shooter/death-screen.jpg
    alt: The SIGNAL LOST death screen with the run's results
    caption: Signal lost
---

<div class="writeup-cols">
<div>

## Overview

A top-down twin-stick roguelike set after a zombie outbreak. Each run starts in a survivor hideout, and from there you deploy into one of four zones: a Military Base, a Shopping Mall, a Hospital and an Airport. Each zone is a stack of procedurally generated floors. Doors lock the moment you step into a room and don't open until every zombie is dead. Between fights you scavenge guns, attachments, ammo and medkits, then take on the floor's boss and head down to the next floor.

The world is dark. Rooms are lit by flickering fluorescent tubes and your flashlight, and zombies hunt by sight and sound, so gunfire, reloads and footsteps all draw the horde in. You can sneak and melee quietly, or go loud and deal with what comes.

What you bring home carries over between runs. Scrap buys permanent upgrades at the hideout's stations, rescued survivors move in and each has a goal that drives the story, and recovered truck parts unlock travel to the other zones. The last step is finding the radio parts that call in the evacuation helicopter.

It's all shown through a CRT military terminal, with screen curvature, scanlines and a green-phosphor UI. The characters, guns and items are pixel-art sprites in a lit 3D world, so they catch real light and cast real shadows.

## Features

- Procedural floors of shaped rooms joined by doors and corridors, each dressed with themed furniture and clutter
- Zombie AI that sees and hears: vision cones, memory of where it last saw you, and a noise system for footsteps, gunshots, reloads and explosions
- Five zombie types, from fast Runners to Bloaters that burst into acid and Screamers that alert the whole floor
- Twelve bosses across the four zones, each with its own moveset, like the Mannequin that only moves when you aren't looking at it
- Nine guns across a main and sidearm slot, each with its own fire mode, reloads, spread and bloom
- Weapon attachments in five slots, such as suppressors and laser sights, drawn on the held gun
- Medkits, adrenaline, frag grenades, molotovs with spreading fire, and bottles to throw as distractions
- A survivor hideout with upgrade stations, a trader, an intel desk that reveals floor maps and a shooting range
- A story spread across runs, ending in a helicopter evacuation from the airport roof
- A HUD with a radar-style minimap and a full tactical map, all drawn in code as vector line art
- Keyboard and mouse or gamepad, with hot-swapping between them and in-game rebinding

</div>
<div>

## How it's built

- Around 220 C# scripts and 35,000 lines in Unity 6, split by system. The game runs from a single scene, with rooms, walls, pickups, effects, menus and the HUD all built in code at runtime
- Each floor is laid out as a room tree on a grid, with 23 room themes across the four zones, then a NavMesh is baked at runtime so zombies can path around whatever was generated
- Enemies run a Chase, Search and Wander state machine, with line-of-sight checks and a global noise broadcast each enemy hears based on distance and loudness. Boss behaviours are separate components
- A custom CRT post-process in URP for curvature, scanlines and chromatic aberration, with mouse input corrected through the screen curve so aiming stays exact
- A custom SpriteLit shader that lets pixel-art sprites be lit by the 3D lights and cast and receive shadows, with 8-directional facing and guns that point exactly at the crosshair
- Positional audio where footsteps also feed the AI's hearing, crossfading music for the hideout, exploration and bosses, and placeholder sounds synthesised in code
- Low-poly guns, characters, items and props generated with Python scripts in Blender
- One JSON save per profile, written atomically, holding scrap, upgrades, rescued survivors and story progress

</div>
</div>
