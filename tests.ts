import * as asserts from "https://deno.land/std/testing/asserts.ts";
import { Gear, Rod } from "./types.ts";
import { simulate } from "./index.ts";

Deno.test("test OR gate", () => {
  const output_rod: Rod = {
    name: "output",
    kind: "rod",
    connectedRight: [],
    spring: "pull",
    state: "pull",
  };

  const input_rod: Rod = {
    name: "input_rod",
    kind: "rod",
    connectedRight: [{
      kind: "rod-rod",
      component: output_rod,
      rodAttachment: "push",
    }],
    spring: "none",
    state: "pull",
  };

  const input_rod_2: Rod = {
    name: "input_rod_2",
    kind: "rod",
    connectedRight: [{
      kind: "rod-rod",
      component: output_rod,
      rodAttachment: "push",
    }],
    spring: "none",
    state: "pull",
  };

  simulate([input_rod, input_rod_2], ["pull", "pull"]);
  asserts.assertEquals(output_rod.state, "pull");

  simulate([input_rod, input_rod_2], ["push", "pull"]);
  asserts.assertEquals(output_rod.state, "push");

  simulate([input_rod, input_rod_2], ["pull", "push"]);
  asserts.assertEquals(output_rod.state, "push");

  simulate([input_rod, input_rod_2], ["push", "push"]);
  asserts.assertEquals(output_rod.state, "push");
});

Deno.test("test NOT gate", () => {
  const output_rod: Rod = {
    name: "output",
    kind: "rod",
    connectedRight: [],
    spring: "pull",
    state: "pull",
  };

  const gear: Gear = {
    name: "not gear",
    kind: "gear",
    teeth: 2,
    connectedRight: [{
      kind: "gear-rod",
      component: output_rod,
      gearOffset: 1,
      teeth: 2,
    }],
    state: 0,
  };

  const input_rod: Rod = {
    name: "input_rod",
    kind: "rod",
    connectedRight: [{
      kind: "gear-rod",
      component: gear,
      gearOffset: 0,
      teeth: 2,
    }],
    spring: "none",
    state: "pull",
  };

  simulate([input_rod], ["pull"]);
  asserts.assertEquals(output_rod.state, "push");

  simulate([input_rod], ["push"]);
  asserts.assertEquals(output_rod.state, "pull");
});
