import { Component, Connection, Gear, Rod } from "./types";

type PropogateConnection = {
    leftName: string;
    connection: Connection;
    state: number | "push" | "pull";
    teeth?: number;
}

function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

export function simulate(inputComponents: Component[], inputs: ("push" | "pull" | number)[]): Map<string, "push" | "pull" | number> {
    const states = new Map<string, "push" | "pull" | number>();

    const stack = new Map<Component, PropogateConnection[]>();

    for (let i = 0; i < inputComponents.length; i++) {
        const component = inputComponents[i];
        const input = inputs[i];

        for (const connection of component.connectedRight) {
            const key = connection.component;
            if (stack.has(key)) {
                stack.get(key)!.push({
                    leftName: component.name,
                    connection: connection,
                    state: input,
                    teeth: component.kind == "gear" ? component.teeth : undefined,
                });
            } else {
                stack.set(key, [{
                    leftName: component.name,
                    connection: connection,
                    state: input,
                    teeth: component.kind == "gear" ? component.teeth : undefined,
                }]);
            }
        }

        component.state = input;
        states.set(component.name, input);
    }

    while (stack.size > 0) {
        const [component, props]: [Component, PropogateConnection[]] = stack.entries().next().value;
        stack.delete(component);

        let forcedState: number | "push" | "pull" | null = null;
        for (const prop of props) {
            if (prop.connection.kind == "rod-rod") {
                if (prop.connection.rodAttachment == "attach") {
                    console.log(`${prop.leftName} makes ${prop.connection.component.name}: ${prop.state}`);
                    component.state = prop.state;
                } else if (prop.connection.rodAttachment == "push" && prop.state == "push") {
                    console.log(`${prop.leftName} pushes ${prop.connection.component.name}: ${prop.state}`);
                    component.state = "push";
                } else if (prop.connection.rodAttachment == "pull" && prop.state == "pull") {
                    console.log(`${prop.leftName} pulls ${prop.connection.component.name}: ${prop.state}`);
                    component.state = "pull";
                }
                verifyConsistency(forcedState, component.state);
                forcedState = component.state;
            } else if (prop.connection.kind == "gear-rod") {
                if (component.kind == "gear") {
                    // Rod moving a gear
                    if (prop.state == "push") {
                        component.state = (prop.connection.gearOffset + component.teeth / 2) % component.teeth;
                    } else {
                        component.state = prop.connection.gearOffset;
                    }
                } else {
                    // Gear moving a rod
                    const rodPosition = (prop.connection.gearOffset + (prop.state as number)) % prop.teeth!;
                    if (rodPosition == 0) {
                        component.state = "pull";
                    } else if (rodPosition == prop.teeth! / 2) {
                        component.state = "push";
                    } else {
                        throw new Error(`Rod not fully pulled or pushed! Expected 0 or ${prop.teeth! / 2}, got ${rodPosition}`);
                    }
                }
                verifyConsistency(forcedState, component.state);
                forcedState = component.state;
            } else {
                // Gear moving a gear
                // Note that no consistency check is done here because we assume these are one way ratchet-y gears
                if (component.kind != "gear" || typeof prop.state != "number") { throw new Error("unreachable"); }
                component.state = mod((component.state - prop.state), component.teeth); // backwards direction remember
            }
        }

        if (forcedState == null && component.kind == "rod" && component.spring != "none") {
            component.state = component.spring;
        }

        states.set(component.name, component.state);

        // Propogate
        for (const connection of component.connectedRight) {
            const key = connection.component;
            if (stack.has(key)) {
                stack.get(key)!.push({
                    leftName: component.name,
                    connection: connection,
                    state: component.state,
                    teeth: component.kind == "gear" ? component.teeth : undefined,
                });
            } else {
                stack.set(key, [{
                    leftName: component.name,
                    connection: connection,
                    state: component.state,
                    teeth: component.kind == "gear" ? component.teeth : undefined,
                }]);
            }
        }
    }

    return states;
}



function verifyConsistency(forcedState: string | number | null, newState: "push" | "pull" | number) {
    if (forcedState != null && forcedState != newState) {
        throw new Error("Connection is not consistent. Forced: " + forcedState + " New: " + newState);
    }
}
