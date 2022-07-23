import * as asserts from "https://deno.land/std/testing/asserts.ts";
import { Gear, Rod } from "./src/types.ts";
import { simulate } from "./src/simulate.ts";

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
        name: "gear",
        kind: "gear",
        teeth: 2,
        connectedRight: [{
            kind: "gear-rod",
            component: output_rod,
            gearOffset: 1,
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
        }],
        spring: "none",
        state: "pull",
    };

    simulate([input_rod], ["pull"]);
    asserts.assertEquals(output_rod.state, "push");

    simulate([input_rod], ["push"]);
    asserts.assertEquals(output_rod.state, "pull");
});


Deno.test("test analog adder", () => {
    const outputGear: Gear = {
        name: "output gear",
        kind: "gear",
        teeth: 20,
        connectedRight: [],
        state: 0,
    };

    const sumGear: Gear = {
        name: "summer gear",
        kind: "gear",
        teeth: 20,
        connectedRight: [{
            kind: "gear-gear",
            component: outputGear,
        }],
        state: 0,
    };

    const gear1: Gear = {
        name: "gear1",
        kind: "gear",
        teeth: 10,
        connectedRight: [{ kind: "gear-gear", component: sumGear}],
        state: 0,
    };

    const gear2: Gear = {
        name: "gear2",
        kind: "gear",
        teeth: 10,
        connectedRight: [{ kind: "gear-gear", component: sumGear }],
        state: 0,
    };

    simulate([gear1, gear2], [3, 6]);
    asserts.assertEquals(outputGear.state, 9);
});

Deno.test("test analog subtracter", () => {
    const outputGear: Gear = {
        name: "output gear",
        kind: "gear",
        teeth: 20,
        connectedRight: [],
        state: 0,
    };

    const sumGear: Gear = {
        name: "summer gear",
        kind: "gear",
        teeth: 20,
        connectedRight: [{
            kind: "gear-gear",
            component: outputGear,
        }],
        state: 0,
    };

    const gear1: Gear = {
        name: "gear1",
        kind: "gear",
        teeth: 10,
        connectedRight: [{ kind: "gear-gear", component: sumGear }],
        state: 0,
    };

    const gear2: Gear = {
        name: "gear2",
        kind: "gear",
        teeth: 10,
        connectedRight: [{ kind: "gear-gear", component: outputGear }],
        state: 0,
    };

    // calc gear1 - gear2
    // Note that gear1 rotates clockwise, thus rotating sumGear counterclockwise.
    // sumGear then rotates outputGear clockwise, thus increasing the total sum.
    // gear2 rotates clockwise as well, which turns the sumGear counterclockwise,
    // thereby decreasing the total sum.

    simulate([gear1, gear2], [9, 6]);
    asserts.assertEquals(outputGear.state, 3);
});