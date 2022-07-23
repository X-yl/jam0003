import { Component, Connection, Gear, Rod } from "./types.ts";

type PropogateConnection = {
    connection: Connection;
    state: number | "push" | "pull";
}


export function simulate(inputComponents: Component[], inputs: ("push" | "pull")[]): Map<string, "push" | "pull" | number> {
    const states = new Map<string, "push" | "pull" | number>();

    const stack = new Map<Component, PropogateConnection[]>();

    for (let i = 0; i < inputComponents.length; i++) {
        const component = inputComponents[i];
        const input = inputs[i];

        if (component.kind == "gear") {
            throw new Error("Gear input is not supported");
        }

        for (const connection of component.connectedRight) {
            const key = connection.component;
            if (stack.has(key)) {
                stack.get(key)!.push({
                    connection: connection,
                    state: input,
                });
            } else {
                stack.set(key, [{
                    connection: connection,
                    state: input,
                }]);
            }
        }

        component.state = input;
        states.set(component.name, input);
    }

    while (stack.size > 0) {
        const [component, props] : [Component, PropogateConnection[]] = stack.entries().next().value;
        stack.delete(component);
        
        let forcedState: number | "push" | "pull" | null = null;
        for (const prop of props) {
            if (prop.connection.kind == "rod-rod") {
                if (prop.connection.rodAttachment == "attach") {
                    component.state = prop.state;
                } else if (prop.connection.rodAttachment == "push" && prop.state == "push") {
                    component.state = "push";
                } else if (prop.connection.rodAttachment == "pull" && prop.state == "pull") {
                    component.state = "pull";
                }
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
                    const rodPosition = (prop.connection.gearOffset + (prop.state as number)) % prop.connection.teeth;
                    if (rodPosition == 0) {
                        component.state = "pull";
                    } else if (rodPosition == prop.connection.teeth / 2) {
                        component.state = "push";
                    }
                }
            } else {
                throw new Error("FIXME: NYI");
            }
            verifyConsistency(forcedState, component.state);
            forcedState = component.state;
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
                    connection: connection,
                    state: component.state,
                });
            } else {
                stack.set(key, [{
                    connection: connection,
                    state: component.state,
                }]);
            }
        }
    }

    return states;
} 



function verifyConsistency(forcedState: string | number | null, newState: "push" | "pull" | number) {
  if(forcedState != null && forcedState != newState) {
    throw new Error("Connection is not consistent");
  }
}
