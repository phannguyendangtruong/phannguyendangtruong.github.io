import { Group, Mesh, type Camera } from 'three';
import type { Kit } from './assets';
import { buildAtmosphere } from './atmosphere';
import { buildBuildings } from './buildings';
import { buildCars } from './cars';
import { buildCityLights } from './citylights';
import { buildDetails } from './details';
import type { ToWorld } from './geometry';
import { buildGround } from './ground';
import { CityPlan } from './layout';
import { buildMagic, type Hologram } from './magic';
import { buildMetro, type Metro } from './metro';
import type { SceneModel } from './model';
import { buildSky } from './sky';
import { buildStations, type Anchors } from './station';
import type { SignFonts } from './textures';
import { buildTrains } from './trains';
import { buildWater } from './water';

export type City = {
  group: Group;
  metro: Metro;
  /** Label points of the stations, the interchanges, "Now" and "You are here". */
  anchors: Anchors;
  /** Holograms of the companies over the line starts. */
  holos: Hologram[];
  /** Brightens (over 1) or dims (under 1) a line: its LED strip, its stream of light and its hologram. */
  emphasize: (line: number, value: number) => void;
  /** Moves the trains, the magic, the water, the mist and the clouds to `time`, for the camera as it stands. */
  update: (time: number, camera: Camera) => void;
  /** Size of the reflection of the water, in pixels. */
  setSize: (width: number, height: number) => void;
  /** Frees what the meshes of the scene do not hold: the render target of the reflecting water. */
  dispose: () => void;
};

/**
 * The night city round the network, all from the model: blocks of buildings on a road grid, trees and street lights,
 * cars at the heads of the trails of light, the river, the viaducts with their stations and trains, the magic over
 * them, the mist, the sky. `lite` builds only the blocks round the trunk and the end, and water that does not reflect;
 * `smallTraffic` keeps the cars to the roads round the trunk and the end (a phone). Every solid part casts and takes
 * the shadows of the sun of the light theme; the cars, placed in their shader, do not. The wake starts from the end
 * (wake.ts).
 */
export function buildCity(
  model: SceneModel,
  at: ToWorld,
  kit: Kit,
  fonts: SignFonts,
  lite: boolean,
  smallTraffic: boolean,
): City {
  const end = at(model.end.xy);
  kit.wake.centre(end.x, end.z);
  const plan = new CityPlan(model, at);
  const buildings = buildBuildings(plan.lots(lite), kit);
  const details = buildDetails(buildings.tops, plan, kit);
  const lights = buildCityLights(buildings.tops, plan, kit);
  const ground = buildGround(plan, kit);
  const cars = buildCars(plan, kit, plan.carArea(smallTraffic));
  const water = buildWater(plan, kit, !lite);
  const metro = buildMetro(model, at, kit);
  const stations = buildStations(model, at, metro, kit);
  const trains = buildTrains(model, metro, kit);
  const magic = buildMagic(model, at, metro, kit, fonts);
  const atmosphere = buildAtmosphere(kit, end, stations.anchors.stations);
  const sky = buildSky(kit);

  const group = new Group();
  group.add(
    sky.group,
    ground,
    cars,
    water.group,
    buildings.mesh,
    details,
    lights,
    metro.group,
    stations.group,
    trains.group,
    magic.group,
    atmosphere.group,
  );
  [buildings.mesh, details, metro.group, stations.group, trains.group].forEach((part) => {
    part.traverse((object) => {
      if (!(object instanceof Mesh) || Array.isArray(object.material) || object.material.transparent) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
  });

  return {
    group,
    metro,
    anchors: stations.anchors,
    holos: magic.holos,
    emphasize: (line, value) => {
      const led = metro.leds.get(line);
      if (led) kit.wake.setEmphasis(led, value);
      magic.emphasize(line, value);
    },
    update: (time, camera) => {
      water.update(time);
      trains.update(time);
      magic.update(time, camera);
      atmosphere.update(time);
      sky.update(camera);
    },
    setSize: water.setSize,
    dispose: water.dispose,
  };
}
