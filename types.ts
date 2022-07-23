export type Component = Gear | Rod;

export type Connection = RodRodConnection | GearRodConnection | GearGearConnection;

export type RodRodConnection = {
    kind: "rod-rod";
    component: Component;
    rodAttachment: "push" | "pull" | "attach";
}

export type GearRodConnection = {
    kind: "gear-rod";
    component: Component;
    gearOffset: number;
    teeth: number;
}

export type GearGearConnection = {
    kind: "gear-gear";
    component: Component;
}

export type Gear = {
    kind: "gear";
    name: string;
    teeth: number;
    connectedRight: Connection[];

    state: number; // number of teeth turned
}


export type Rod = {
    name: string;
    kind: "rod";
    connectedRight: Connection[];
    spring: 'pull' | 'push' | 'none';

    state: 'push' | 'pull';
}

export enum PullDirection {
    Left,
    Right
}
